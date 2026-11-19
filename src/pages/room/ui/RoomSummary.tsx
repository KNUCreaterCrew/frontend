import { useState } from 'react'
import type { ReactNode } from 'react'
import { congestionLabel } from '@/entities/room'
import type { RoomSummary as Summary } from '@/entities/room'
import { lastObservedParts, useNow } from '@/shared/lib'

// 네이비 패널 안에 놓인다. 글자는 on-ink 계열만 쓴다.
function Row({ term, value, first = false }: { term: string; value: ReactNode; first?: boolean }) {
  return (
    <div className="flex flex-wrap items-baseline justify-between gap-x-3 border-t border-on-ink/15 py-2 first:border-t-0 first:pt-0">
      <dt
        className={`whitespace-nowrap ${first ? 'text-fact font-semibold text-on-ink' : 'text-on-ink-soft'}`}
      >
        {term}
      </dt>
      <dd className="ml-auto text-right num text-number font-semibold text-on-ink">{value}</dd>
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
        className={`shrink-0 font-num text-poster font-bold tracking-poster text-empty-bright ${flip}`.trim()}
      >
        {summary.availableSeats}
      </p>
    )
  }
  if (summary.kind === 'allUnknown') {
    return (
      <p
        aria-hidden="true"
        className="w-min shrink-0 text-poster-word font-bold tracking-tight wrap-normal text-on-ink"
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
    <div className="mt-5 flex items-center gap-5 border-t border-on-ink/15 pt-5">
      <Big summary={summary} />
      <dl className="min-w-0 flex-1">
        <Row term="빈자리" value={available} first />
        <Row term="확인 불가" value={`${unknown}석`} />
        <Row term="전체" value={`${total}석`} />
        {summary.kind === 'known' && (
          <Row term="혼잡도" value={congestionLabel(summary.congestionLevel)} />
        )}
        {summary.kind === 'allUnknown' && (
          <Row
            term="마지막 확인"
            value={<LastObserved iso={summary.latestObservedAt} now={now} />}
          />
        )}
      </dl>
    </div>
  )
}
