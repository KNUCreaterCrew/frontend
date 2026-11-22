import { useId, type ReactNode } from 'react'
import { statsSourceLabel, weekdayLabel } from '@/entities/room'
import type { DailyStats, RoomSummary, WeeklyStats } from '@/entities/room'
import { freshnessWarning, formatKstHour, useDelayedVisibility, type KstClock } from '@/shared/lib'
import { Button } from '@/shared/ui'
import { useRoomStats } from '../lib/useRoomStats'
import { buildTodayChart, type DayChart } from '../model/chartModel'
import { compareWithUsual, comparisonSentence } from '../model/compareWithUsual'
import { todaySummary } from '../model/statsSummary'
import { usualSourceSentence } from '../model/usualSource'
import { StatsLegend } from './StatsLegend'
import { StatsSkeleton } from './StatsSkeleton'
import { StepChart } from './StepChart'
import { WeekdayStats } from './WeekdayStats'

const TITLE = '오늘 빈자리 흐름'

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
  // 오늘 기록이 있는지는 출처가 아니라 그려지는 막대로 정한다
  const chart =
    daily.data !== undefined && weekly.data !== undefined
      ? buildTodayChart(daily.data, weekly.data, clock.weekday, clock.minuteOfDay)
      : null
  const todaySource =
    daily.data !== undefined && chart !== null && chart.bars.length > 0
      ? statsSourceLabel(daily.data.dataSource)
      : null

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
  } else if (daily.data !== undefined && weekly.data !== undefined && chart !== null) {
    // 경고는 재조회가 실패했을 때만. 평소 값은 30분 동안 다시 조회하지 않으므로 경과 시간만으로 경고하지 않는다
    const refreshFailed = daily.isRefetchError || weekly.isRefetchError
    const updatedAt = daily.isRefetchError ? daily.dataUpdatedAt : weekly.dataUpdatedAt
    const staleNotice = refreshFailed ? freshnessWarning(updatedAt, true, now) : null
    body = (
      <StatsBody
        daily={daily.data}
        weekly={weekly.data}
        chart={chart}
        clock={clock}
        summary={summary}
        staleNotice={staleNotice}
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
  chart: DayChart
  clock: KstClock
  summary: RoomSummary
  staleNotice: string | null
}

function StatsBody({ daily, weekly, chart, clock, summary, staleNotice }: StatsBodyProps) {
  const weekday = weekdayLabel(clock.weekday)
  const usualCell = weekly.cells.find(
    (cell) => cell.weekday === clock.weekday && cell.hour === clock.hour,
  )
  const stale = staleNotice !== null && (
    <p className="mt-3 text-label font-bold text-ink">{staleNotice}</p>
  )

  const hasToday = chart.bars.length > 0
  if (!hasToday && chart.usualSteps.length === 0) {
    return (
      <>
        <p className="mt-2 text-body text-ink">아직 기록이 없어요.</p>
        {stale}
      </>
    )
  }

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
    hasToday ? todaySummary(daily, clock.minuteOfDay) : null,
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
      {!hasToday && (
        <p className="mt-2 text-body text-ink">
          {`오늘은 아직 기록이 없어요. 평소 ${weekday} 흐름만 보여요.`}
        </p>
      )}
      <StepChart chart={chart} />
      <StatsLegend
        showToday={hasToday}
        usualLabel={usualLabel}
        showMissing={showMissing}
        showLowConfidence={showLowConfidence}
      />
      {readout !== '' && <p className="sr-only">{readout}</p>}
      {weekly.dataSource !== null && (
        <WeekdayStats weekly={weekly} today={clock.weekday} nowMinute={clock.minuteOfDay} />
      )}
      {stale}
    </>
  )
}
