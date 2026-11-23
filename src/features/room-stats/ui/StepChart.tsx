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
// 잠깐만 본 묶음(관측 5분 미만)은 면을 흐리게, 윗선을 짧은 점선으로
const DIM: Record<BarKind, number> = { observed: 1, lowConfidence: 0.4 }
const TOP_DASH: Record<BarKind, string | undefined> = { observed: undefined, lowConfidence: '2 3' }

/** today: 오늘 관측값(에메랄드). usual: 평소 평균(ink-soft). 에메랄드는 오늘 관측값에만 쓴다 */
export type StepChartTone = 'today' | 'usual'

const TONE: Record<
  StepChartTone,
  { stroke: string; fill: string; fillTop: number; fillBottom: number }
> = {
  today: { stroke: 'text-empty', fill: 'var(--color-empty-tint)', fillTop: 1, fillBottom: 0.75 },
  usual: {
    stroke: 'text-ink-soft',
    fill: 'var(--color-ink-soft)',
    fillTop: 0.16,
    fillBottom: 0.06,
  },
}

interface StepChartProps {
  chart: DayChart
  tone?: StepChartTone
  /** 가장 최근 값에 점을 찍는다. 오늘 그래프만 쓴다(요일별 평소는 지금 값이 아니다) */
  showLatest?: boolean
}

export function StepChart({ chart, tone = 'today', showLatest = false }: StepChartProps) {
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
  const look = TONE[tone]
  const usual = chart.usualSteps.length > 0 ? usualPath(chart.usualSteps, start, end) : ''

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
            <stop offset="0" style={{ stopColor: look.fill, stopOpacity: look.fillTop }} />
            <stop offset="1" style={{ stopColor: look.fill, stopOpacity: look.fillBottom }} />
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
          className="absolute inset-0 bg-surface/70 pattern-unknown opacity-60"
          style={{ clipPath: band }}
        />
      ))}

      {/* 바닥선은 선보다 먼저 그려 빈자리 0 인 묶음의 윗선을 덮지 않는다 */}
      <div className="absolute inset-x-0 bottom-0 border-t border-line-strong" />

      <svg {...STRETCH}>
        {usual !== '' && (
          <>
            {/* 빗금과 오늘 선 위에서도 다른 층으로 읽히게 흰 테두리를 먼저 깐다 */}
            <path
              d={usual}
              className="text-surface"
              fill="none"
              stroke="currentColor"
              strokeWidth={3}
              strokeOpacity={0.6}
              vectorEffect="non-scaling-stroke"
            />
            <path
              d={usual}
              className="text-ink-soft"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeDasharray="5 4"
              vectorEffect="non-scaling-stroke"
            />
          </>
        )}
        {KINDS.map((kind) => (
          <g key={kind} className={look.stroke} fill="none" stroke="currentColor">
            {paths[kind].rise !== '' && (
              <path
                d={paths[kind].rise}
                strokeWidth={1}
                opacity={DIM[kind]}
                vectorEffect="non-scaling-stroke"
              />
            )}
            {paths[kind].top !== '' && (
              <path
                data-top={kind}
                d={paths[kind].top}
                strokeWidth={2}
                strokeDasharray={TOP_DASH[kind]}
                strokeLinecap={TOP_DASH[kind] === undefined ? 'square' : 'butt'}
                vectorEffect="non-scaling-stroke"
              />
            )}
          </g>
        ))}
      </svg>

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
          data-latest=""
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
