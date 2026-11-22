import type { CSSProperties } from 'react'
import { formatKstHour } from '@/shared/lib'
import type { DayChart } from '../model/chartModel'
import { usualPath } from '../model/usualPath'

// 좌석도처럼 위치와 크기는 % inline style 로 준다
export function StepChart({ chart }: { chart: DayChart }) {
  const start = chart.rangeStartMinute
  const end = chart.rangeEndMinute
  const span = end - start
  const ratio = (minute: number) => ((Math.min(Math.max(minute, start), end) - start) / span) * 100
  const x = (minute: number) => `${ratio(minute)}%`
  const horizontal = (from: number, to: number): CSSProperties => ({
    left: x(from),
    width: `${ratio(to) - ratio(from)}%`,
  })
  const showNow = chart.nowMinute !== null && chart.nowMinute >= start && chart.nowMinute <= end

  return (
    <div
      aria-hidden="true"
      className="relative mt-6 mb-6 ml-8 aspect-2/1 border-b border-line-strong"
    >
      <div className="absolute inset-x-0 top-0 border-t border-dashed border-line" />
      <span className="absolute top-0 right-full mr-2 -translate-y-1/2 num text-label whitespace-nowrap text-ink-soft">
        {`${chart.totalSeats}석`}
      </span>
      <span className="absolute right-full bottom-0 mr-2 translate-y-1/2 num text-label whitespace-nowrap text-ink-soft">
        0석
      </span>

      {chart.missingSpans.map((missing) => (
        <div
          key={`missing-${missing.startMinute}`}
          className="absolute inset-y-0 border border-line-strong bg-surface pattern-unknown"
          style={horizontal(missing.startMinute, missing.endMinute)}
        />
      ))}

      {chart.bars.map((bar) => (
        <div key={`bar-${bar.startMinute}`}>
          <div
            className={[
              'absolute bottom-0 border-t-2 border-empty bg-empty-tint',
              bar.kind === 'lowConfidence' && 'opacity-40',
            ]
              .filter(Boolean)
              .join(' ')}
            style={{
              ...horizontal(bar.startMinute, bar.startMinute + bar.widthMinutes),
              height: `${bar.availablePct}%`,
            }}
          />
          {bar.unknownPct > 0 && (
            <div
              className="absolute bg-surface pattern-unknown"
              style={{
                ...horizontal(bar.startMinute, bar.startMinute + bar.widthMinutes),
                bottom: `${bar.availablePct}%`,
                height: `${bar.unknownPct}%`,
              }}
            />
          )}
        </div>
      ))}

      {chart.usualSteps.length > 0 && (
        <svg
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          className="absolute inset-0 h-full w-full overflow-visible text-ink-soft"
        >
          <path
            d={usualPath(chart.usualSteps, start, end)}
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeDasharray="5 4"
            vectorEffect="non-scaling-stroke"
          />
        </svg>
      )}

      {showNow && (
        <div
          className="absolute inset-y-0 w-px bg-ink"
          style={{ left: x(chart.nowMinute ?? start) }}
        >
          <span className="absolute bottom-full left-0 mb-1 -translate-x-1/2 text-label font-semibold whitespace-nowrap text-ink">
            지금
          </span>
        </div>
      )}

      {chart.xTickHours.map((hour) => (
        <span
          key={`tick-${hour}`}
          className="absolute top-full mt-1 -translate-x-1/2 num text-label whitespace-nowrap text-ink-soft"
          style={{ left: x(hour * 60) }}
        >
          {formatKstHour(hour)}
        </span>
      ))}
    </div>
  )
}
