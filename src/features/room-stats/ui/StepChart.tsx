import { useId, type CSSProperties } from 'react'
import { formatKstHour } from '@/shared/lib'
import { barPaths, latestBar, unknownBands } from '../model/barPath'
import type { BarKind, DayChart } from '../model/chartModel'
import { usualPath } from '../model/usualPath'

// 판 위의 선과 면은 viewBox 0 0 100 100 을 판 크기로 늘린 SVG, 글자와 점은 % 위치의 HTML 이다
const STRETCH = {
  viewBox: '0 0 100 100',
  preserveAspectRatio: 'none',
  className: 'absolute inset-0 h-full w-full overflow-visible',
} as const

const KINDS = ['observed', 'lowConfidence'] as const satisfies readonly BarKind[]
// 잠깐만 본 묶음(관측 5분 미만)은 흐리게
const DIM: Record<BarKind, number> = { observed: 1, lowConfidence: 0.4 }

interface StepChartProps {
  chart: DayChart
  /** 가장 최근 값에 점을 찍는다. 오늘 그래프만 쓴다(요일별 평소는 지금 값이 아니다) */
  showLatest?: boolean
}

export function StepChart({ chart, showLatest = false }: StepChartProps) {
  const fillId = useId()
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
  const paths = barPaths(chart.bars, start, end)
  const latest = showLatest && showNow ? latestBar(chart.bars, chart.nowMinute) : null

  return (
    <div aria-hidden="true" className="relative mt-6 mb-8 ml-8 aspect-2/1">
      <div className="absolute inset-x-0 top-0 border-t border-dashed border-line" />
      <div className="absolute inset-x-0 top-1/2 border-t border-dashed border-line" />
      <span className="absolute top-0 right-full mr-2 -translate-y-1/2 num text-label whitespace-nowrap text-ink-soft">
        {`${chart.totalSeats}석`}
      </span>
      <span className="absolute right-full bottom-0 mr-2 translate-y-1/2 num text-label whitespace-nowrap text-ink-soft">
        0석
      </span>

      {chart.missingSpans.map((missing) => (
        <div
          key={`missing-${missing.startMinute}`}
          className="absolute inset-y-0 border-x border-line-strong bg-surface/70 pattern-unknown"
          style={horizontal(missing.startMinute, missing.endMinute)}
        />
      ))}

      <svg {...STRETCH}>
        <defs>
          <linearGradient id={fillId} x1="0" y1="0" x2="0" y2="100" gradientUnits="userSpaceOnUse">
            <stop offset="0" style={{ stopColor: 'var(--color-empty-tint)' }} />
            <stop offset="1" style={{ stopColor: 'var(--color-empty-tint)', stopOpacity: 0.45 }} />
          </linearGradient>
        </defs>
        {KINDS.map(
          (kind) =>
            paths[kind].area !== '' && (
              <path
                key={kind}
                data-kind={kind}
                d={paths[kind].area}
                fill={`url(#${fillId})`}
                opacity={DIM[kind]}
              />
            ),
        )}
      </svg>

      {unknownBands(chart.bars, start, end).map((band) => (
        <div
          key={band}
          className="absolute inset-0 bg-surface/70 pattern-unknown"
          style={{ clipPath: band }}
        />
      ))}

      <svg {...STRETCH}>
        {chart.usualSteps.length > 0 && (
          <path
            d={usualPath(chart.usualSteps, start, end)}
            className="text-ink-soft"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeDasharray="5 4"
            vectorEffect="non-scaling-stroke"
          />
        )}
        {KINDS.map(
          (kind) =>
            paths[kind].line !== '' && (
              <path
                key={kind}
                d={paths[kind].line}
                className="text-empty"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinejoin="round"
                strokeLinecap="round"
                opacity={DIM[kind]}
                vectorEffect="non-scaling-stroke"
              />
            ),
        )}
      </svg>

      <div className="absolute inset-x-0 bottom-0 border-t border-line-strong" />

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

      {latest !== null && (
        <span
          className="absolute size-3 -translate-x-1/2 translate-y-1/2 rounded-full border-2 border-surface bg-empty"
          style={{ left: x(latest.minute), bottom: `${latest.pct}%` }}
        />
      )}

      {chart.xTickHours.map((hour) => (
        <div
          key={`tick-${hour}`}
          className="absolute top-full flex -translate-x-1/2 flex-col items-center"
          style={{ left: x(hour * 60) }}
        >
          <span className="h-1 w-px bg-line-strong" />
          <span className="num text-label whitespace-nowrap text-ink-soft">
            {formatKstHour(hour)}
          </span>
        </div>
      ))}
    </div>
  )
}
