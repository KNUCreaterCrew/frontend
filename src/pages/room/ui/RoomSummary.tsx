import { useState } from 'react'
import type { ReactNode } from 'react'
import { congestionLabel } from '@/entities/room'
import type { RoomSummary as Summary } from '@/entities/room'
import { lastObservedParts, useNow } from '@/shared/lib'

// 휴대폰은 한 줄로 흐르는 요약("빈자리 1석  확인 불가 1석  전체 4석"), PC 는 가는 선으로 나눈 표
function Row({
  term,
  value,
  first = false,
  wideOnly = false,
}: {
  term: string
  value: ReactNode
  first?: boolean
  wideOnly?: boolean
}) {
  return (
    <div
      className={`flex items-baseline gap-x-1 lg:flex-wrap lg:justify-between lg:gap-x-3 lg:border-t lg:border-line lg:py-2 lg:first:border-t-0 lg:first:pt-0 ${wideOnly ? 'max-lg:hidden' : ''}`.trim()}
    >
      <dt
        className={`whitespace-nowrap ${first ? 'font-semibold text-ink lg:text-fact' : 'text-ink-soft'}`}
      >
        {term}
      </dt>
      <dd className="num font-semibold text-ink lg:ml-auto lg:text-right lg:text-number">
        {value}
      </dd>
    </div>
  )
}

function Big({ summary }: { summary: Summary }) {
  // 처음 그린 값은 그대로 두고, 값이 바뀐 뒤부터 새 요소로 그려 한 번 넘어온다(동작 줄이기면 그대로)
  const known = summary.kind === 'known' ? summary.availableSeats : null
  const [seen, setSeen] = useState({ first: known, changed: false })
  if (!seen.changed && known !== seen.first) setSeen({ first: seen.first, changed: true })
  if (summary.kind === 'known') {
    const flip = seen.changed || known !== seen.first ? 'motion-safe:animate-flip' : ''
    return (
      <p
        key={summary.availableSeats}
        aria-hidden="true"
        className={`shrink-0 font-num text-count font-bold tracking-poster text-empty-ink area-big lg:text-poster ${flip}`.trim()}
      >
        {summary.availableSeats}
      </p>
    )
  }
  if (summary.kind === 'allUnknown') {
    return (
      <p
        aria-hidden="true"
        className="w-min shrink-0 text-count-word font-bold tracking-tight wrap-normal text-ink area-big lg:text-poster-word"
      >
        확인 불가
      </p>
    )
  }
  return null
}

// 줄이 바뀔 수 있는 곳은 상대 시각과 (시각) 사이뿐이다.
function LastObserved({ iso, now }: { iso: string | null; now: number }) {
  const parts = lastObservedParts(iso, now)
  if (parts === null) return '아직 확인하지 못함'
  return (
    <>
      <span className="whitespace-nowrap">{parts.relative}</span>{' '}
      <span className="whitespace-nowrap">({parts.time})</span>
    </>
  )
}

/** room-hud 격자 안에 큰 숫자(area-big)와 요약(area-facts)을 놓는다 */
export function RoomSummary({ summary }: { summary: Summary }) {
  const now = useNow(1000)
  const total = summary.kind === 'noSeats' ? 0 : summary.totalSeats
  const unknown = summary.kind === 'noSeats' ? 0 : summary.unknownSeats
  const available =
    summary.kind === 'known'
      ? `${summary.availableSeats}석`
      : summary.kind === 'allUnknown'
        ? '확인 불가'
        : '0석'

  return (
    <>
      <Big summary={summary} />
      <dl className="mt-1 flex min-w-0 flex-wrap gap-x-3 gap-y-1 self-start text-body area-facts lg:mt-0 lg:block lg:self-center">
        <Row term="빈자리" value={available} first />
        <Row term="확인 불가" value={`${unknown}석`} />
        <Row term="전체" value={`${total}석`} />
        {summary.kind === 'known' && (
          <Row term="혼잡도" value={congestionLabel(summary.congestionLevel)} wideOnly />
        )}
        {summary.kind === 'allUnknown' && (
          <Row
            term="마지막 확인"
            value={<LastObserved iso={summary.latestObservedAt} now={now} />}
          />
        )}
      </dl>
    </>
  )
}
