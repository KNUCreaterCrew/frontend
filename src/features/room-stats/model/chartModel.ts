import type { DailyStats, Weekday, WeeklyStats } from '@/entities/room'
import { kstClock } from '@/shared/lib'

export type BarKind = 'observed' | 'lowConfidence'

export interface ChartBar {
  startMinute: number
  widthMinutes: number
  kind: BarKind
  availablePct: number
  unknownPct: number
}

export interface MinuteSpan {
  startMinute: number
  endMinute: number
}

export interface UsualStep {
  startMinute: number
  pct: number
}

export interface DayChart {
  rangeStartMinute: number
  rangeEndMinute: number
  totalSeats: number
  bars: ChartBar[]
  missingSpans: MinuteSpan[]
  usualSteps: UsualStep[]
  nowMinute: number | null
  xTickHours: number[]
}

export const DEFAULT_RANGE_START = 480
const RANGE_END = 1440
const LOW_CONFIDENCE_MINUTES = 5

function pct(seats: number, total: number): number {
  return total > 0 ? Math.min(100, Math.max(0, (seats / total) * 100)) : 0
}

function rangeStartFor(firstRecordedMinute: number | null): number {
  if (firstRecordedMinute === null) return DEFAULT_RANGE_START
  return Math.min(DEFAULT_RANGE_START, Math.floor(firstRecordedMinute / 60) * 60)
}

function tickHours(rangeStart: number): number[] {
  const hours: number[] = []
  for (let hour = 0; hour < 24; hour += 1) {
    if (hour % 3 === 0 && hour * 60 >= rangeStart && hour * 60 < RANGE_END) hours.push(hour)
  }
  return hours
}

export function buildTodayChart(
  daily: DailyStats,
  weekly: WeeklyStats | null,
  weekday: Weekday,
  nowMinute: number,
  // 확인 불가 판단 기준. 자료를 받은 시각이라 시계(nowMinute)가 앞서도 받지 못한 시간은 빈 구간이 아니다
  dataMinute: number = nowMinute,
): DayChart {
  const total = daily.totalSeats
  const buckets =
    daily.dataSource === null
      ? []
      : daily.buckets
          .map((bucket) => ({
            bucket,
            startMinute: kstClock(Date.parse(bucket.start)).minuteOfDay,
          }))
          .sort((a, b) => a.startMinute - b.startMinute)

  const firstRecorded = buckets.find((b) => b.bucket.avgAvailableSeats !== null)
  const rangeStart = rangeStartFor(firstRecorded?.startMinute ?? null)
  const inRange = (minute: number) => minute >= rangeStart && minute < RANGE_END

  const bars: ChartBar[] = []
  const missingSpans: MinuteSpan[] = []
  for (const { bucket, startMinute } of buckets) {
    if (!inRange(startMinute)) continue
    if (bucket.avgAvailableSeats !== null) {
      const availablePct = pct(bucket.avgAvailableSeats, total)
      bars.push({
        startMinute,
        widthMinutes: daily.bucketMinutes,
        kind: bucket.observedMinutes < LOW_CONFIDENCE_MINUTES ? 'lowConfidence' : 'observed',
        availablePct,
        unknownPct: Math.min(pct(bucket.avgUnknownSeats ?? 0, total), 100 - availablePct),
      })
      continue
    }
    if (startMinute >= dataMinute) continue
    const endMinute = startMinute + daily.bucketMinutes
    const last = missingSpans[missingSpans.length - 1]
    if (last !== undefined && last.endMinute === startMinute) last.endMinute = endMinute
    else missingSpans.push({ startMinute, endMinute })
  }

  const usualSteps: UsualStep[] =
    weekly === null
      ? []
      : weekly.cells
          .filter(
            (cell) =>
              cell.weekday === weekday &&
              cell.avgAvailableSeats !== null &&
              inRange(cell.hour * 60),
          )
          .sort((a, b) => a.hour - b.hour)
          .map((cell) => ({
            startMinute: cell.hour * 60,
            pct: pct(cell.avgAvailableSeats ?? 0, total),
          }))

  return {
    rangeStartMinute: rangeStart,
    rangeEndMinute: RANGE_END,
    totalSeats: total,
    bars,
    missingSpans,
    usualSteps,
    nowMinute,
    xTickHours: tickHours(rangeStart),
  }
}

export function buildWeekdayChart(
  weekly: WeeklyStats,
  weekday: Weekday,
  nowMinute: number | null,
): DayChart {
  const total = weekly.totalSeats
  const cells = weekly.cells
    .filter((cell) => cell.weekday === weekday && cell.avgAvailableSeats !== null)
    .sort((a, b) => a.hour - b.hour)
  const rangeStart = rangeStartFor(cells[0] === undefined ? null : cells[0].hour * 60)

  const bars: ChartBar[] = cells
    .filter((cell) => cell.hour * 60 >= rangeStart && cell.hour * 60 < RANGE_END)
    .map((cell) => {
      const availablePct = pct(cell.avgAvailableSeats ?? 0, total)
      return {
        startMinute: cell.hour * 60,
        widthMinutes: 60,
        kind: 'observed' as const,
        availablePct,
        unknownPct: Math.min(pct(cell.avgUnknownSeats ?? 0, total), 100 - availablePct),
      }
    })

  return {
    rangeStartMinute: rangeStart,
    rangeEndMinute: RANGE_END,
    totalSeats: total,
    bars,
    missingSpans: [],
    usualSteps: [],
    nowMinute,
    xTickHours: tickHours(rangeStart),
  }
}
