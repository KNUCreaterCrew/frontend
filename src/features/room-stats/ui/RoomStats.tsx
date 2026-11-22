import { useId, type ReactNode } from 'react'
import { statsSourceLabel, weekdayLabel } from '@/entities/room'
import type { DailyStats, RoomSummary, StatsDataSource, WeeklyStats } from '@/entities/room'
import { freshnessWarning, formatKstHour, useDelayedVisibility, type KstClock } from '@/shared/lib'
import { Button } from '@/shared/ui'
import { useRoomStats } from '../lib/useRoomStats'
import { buildTodayChart } from '../model/chartModel'
import { compareWithUsual, comparisonSentence } from '../model/compareWithUsual'
import { todaySummary } from '../model/statsSummary'
import { StatsLegend } from './StatsLegend'
import { StatsSkeleton } from './StatsSkeleton'
import { StepChart } from './StepChart'

const TITLE = '오늘 빈자리 흐름'

function usualSourceSentence(source: StatsDataSource): string | null {
  switch (source) {
    case 'SEED':
      return '평소 값은 최근 4주 예시 데이터예요.'
    case 'MIXED':
      return '평소 값에는 예시 데이터가 섞여 있어요.'
    case 'UNRECOGNIZED':
      return '평소 값의 출처를 알 수 없어요.'
    default:
      return null
  }
}

function formatSeats(value: number): string {
  return String(Number(value.toFixed(1)))
}

interface RoomStatsProps {
  roomId: string
  summary: RoomSummary
}

export function RoomStats({ roomId, summary }: RoomStatsProps) {
  const titleId = useId()
  const { now, clock, daily, weekly } = useRoomStats(roomId, true)
  const failed =
    (daily.data === undefined && daily.isError) || (weekly.data === undefined && weekly.isError)
  const loading = !failed && (daily.data === undefined || weekly.data === undefined)
  const skeletonVisible = useDelayedVisibility(loading)
  const todaySource = daily.data ? statsSourceLabel(daily.data.dataSource) : null

  const retry = () => {
    void daily.refetch()
    void weekly.refetch()
  }

  let body: ReactNode = null
  if (failed) {
    body = (
      <>
        <p className="mt-2 text-body text-ink">빈자리 흐름을 불러오지 못했어요.</p>
        <Button variant="plain" className="mt-3" onClick={retry}>
          다시 불러오기
        </Button>
      </>
    )
  } else if (daily.data !== undefined && weekly.data !== undefined) {
    const refreshFailed = daily.isRefetchError || weekly.isRefetchError
    const updatedAt = daily.isRefetchError ? daily.dataUpdatedAt : weekly.dataUpdatedAt
    body = (
      <StatsBody
        daily={daily.data}
        weekly={weekly.data}
        clock={clock}
        summary={summary}
        staleNotice={freshnessWarning(updatedAt, refreshFailed, now)}
      />
    )
  } else if (skeletonVisible) {
    body = <StatsSkeleton />
  }

  return (
    <section
      aria-labelledby={titleId}
      aria-busy={loading}
      className="rounded-panel bg-surface p-4 shadow-plate"
    >
      <div className="flex flex-wrap items-center gap-2">
        <h2 id={titleId} className="text-fact font-semibold text-ink">
          {TITLE}
        </h2>
        {todaySource !== null && (
          <span className="rounded-chip border border-line-strong px-1 text-label text-ink-soft">
            {todaySource}
          </span>
        )}
      </div>
      {body}
    </section>
  )
}

interface StatsBodyProps {
  daily: DailyStats
  weekly: WeeklyStats
  clock: KstClock
  summary: RoomSummary
  staleNotice: string | null
}

function StatsBody({ daily, weekly, clock, summary, staleNotice }: StatsBodyProps) {
  const weekday = weekdayLabel(clock.weekday)
  const usualCell = weekly.cells.find(
    (cell) => cell.weekday === clock.weekday && cell.hour === clock.hour,
  )
  const hasUsualToday = weekly.cells.some(
    (cell) => cell.weekday === clock.weekday && cell.avgAvailableSeats !== null,
  )
  const stale = staleNotice !== null && (
    <p className="mt-3 text-label font-bold text-ink">{staleNotice}</p>
  )

  if (daily.dataSource === null && !hasUsualToday) {
    return (
      <>
        <p className="mt-2 text-body text-ink">아직 기록이 없어요.</p>
        {stale}
      </>
    )
  }

  const chart = buildTodayChart(daily, weekly, clock.weekday, clock.minuteOfDay)
  const comparison = compareWithUsual(summary, usualCell, weekly.totalSeats)
  const usualSource = usualSourceSentence(weekly.dataSource)
  const weeklySourceLabel = statsSourceLabel(weekly.dataSource)
  const usualLabel =
    chart.usualSteps.length === 0
      ? null
      : `평소 ${weekday}${weeklySourceLabel === null ? '' : ` (${weeklySourceLabel})`}`
  const showMissing = chart.missingSpans.length > 0 || chart.bars.some((b) => b.unknownPct > 0)
  const showLowConfidence = chart.bars.some((b) => b.kind === 'lowConfidence')

  const readout = [
    daily.dataSource === null ? null : todaySummary(daily, clock.minuteOfDay),
    usualCell?.avgAvailableSeats == null
      ? null
      : `평소 ${weekday} ${formatKstHour(clock.hour)} 평균 빈자리는 ${formatSeats(usualCell.avgAvailableSeats)}석이에요.`,
  ]
    .filter((text) => text !== null)
    .join(' ')

  return (
    <>
      {comparison !== null && (
        <p className="mt-2 text-fact font-bold text-ink">
          {comparisonSentence(comparison, clock.weekday)}
        </p>
      )}
      {usualSource !== null && <p className="mt-1 text-label text-ink-soft">{usualSource}</p>}
      {daily.dataSource === null && (
        <p className="mt-2 text-body text-ink">
          {`오늘은 아직 기록이 없어요. 평소 ${weekday} 흐름만 보여요.`}
        </p>
      )}
      <StepChart chart={chart} />
      <StatsLegend
        usualLabel={usualLabel}
        showMissing={showMissing}
        showLowConfidence={showLowConfidence}
      />
      {readout !== '' && <p className="sr-only">{readout}</p>}
      {stale}
    </>
  )
}
