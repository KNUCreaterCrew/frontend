import { congestionLabel } from '@/entities/room'
import type { RoomSummary as Summary } from '@/entities/room'
import { formatLastObserved, useNow } from '@/shared/lib'

function Row({ term, value, first = false }: { term: string; value: string; first?: boolean }) {
  return (
    <div className="flex items-baseline justify-between gap-3 border-t border-ink py-2 first:border-t-0">
      <dt className={`whitespace-nowrap ${first ? 'text-fact font-black' : 'font-bold'}`}>
        {term}
      </dt>
      <dd className="font-num text-number font-bold tabular-nums">{value}</dd>
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
          <Row term="마지막 확인" value={formatLastObserved(summary.latestObservedAt, now)} />
        )}
      </dl>
    </div>
  )
}
