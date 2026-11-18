import type { ReactNode } from 'react'
import { congestionLabel } from '@/entities/room'
import type { RoomSummary as Summary } from '@/entities/room'
import { lastObservedParts, useNow } from '@/shared/lib'

function Row({ term, value, first = false }: { term: string; value: ReactNode; first?: boolean }) {
  return (
    <div className="flex flex-wrap items-baseline justify-between gap-x-3 border-t border-ink py-2 first:border-t-0">
      <dt className={`whitespace-nowrap ${first ? 'text-fact font-black' : 'font-bold'}`}>
        {term}
      </dt>
      <dd className="ml-auto text-right font-num text-number font-bold tabular-nums">{value}</dd>
    </div>
  )
}

function Big({ summary }: { summary: Summary }) {
  if (summary.kind === 'known') {
    return (
      <p
        aria-hidden="true"
        className="shrink-0 font-num text-poster font-extrabold tracking-poster text-empty tabular-nums"
      >
        {summary.availableSeats}
      </p>
    )
  }
  if (summary.kind === 'allUnknown') {
    return (
      <p
        aria-hidden="true"
        className="shrink-0 text-poster-word font-black tracking-tight text-ink"
      >
        모름
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
        ? '모름'
        : '0석'

  return (
    <div className="mt-6 flex items-end gap-4 border-t-2 border-ink pt-4">
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
