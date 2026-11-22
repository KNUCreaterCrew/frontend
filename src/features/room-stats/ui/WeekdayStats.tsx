import { useState } from 'react'
import { statsSourceLabel } from '@/entities/room'
import type { Weekday, WeeklyStats } from '@/entities/room'
import { buildWeekdayChart } from '../model/chartModel'
import { usualSourceSentence } from '../model/usualSource'
import { weekdaySentence } from '../model/weekdayModel'
import { StepChart } from './StepChart'
import { WeekdayPicker } from './WeekdayPicker'

interface WeekdayStatsProps {
  weekly: WeeklyStats
  today: Weekday
  nowMinute: number
}

export function WeekdayStats({ weekly, today, nowMinute }: WeekdayStatsProps) {
  const [selected, setSelected] = useState<Weekday>(today)
  const chart = buildWeekdayChart(weekly, selected, selected === today ? nowMinute : null)
  const sourceLabel = statsSourceLabel(weekly.dataSource)
  const sourceSentence = usualSourceSentence(weekly.dataSource)

  return (
    <div className="mt-4 border-t border-line pt-4">
      <div className="flex flex-wrap items-center gap-2">
        <h3 className="text-body font-semibold text-ink">요일별 평소 빈자리</h3>
        {sourceLabel !== null && (
          <span className="rounded-chip border border-line-strong px-1 text-label text-ink-soft">
            {sourceLabel}
          </span>
        )}
      </div>
      <WeekdayPicker value={selected} onChange={setSelected} />
      <p className="mt-3 text-body text-ink">{weekdaySentence(weekly, selected)}</p>
      <StepChart chart={chart} />
      {sourceSentence !== null && <p className="text-label text-ink-soft">{sourceSentence}</p>}
    </div>
  )
}
