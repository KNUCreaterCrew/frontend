import type { DailyStats, StatsDataSource } from '@/entities/room'
import { formatKstHour, kstClock } from '@/shared/lib'
import { DEFAULT_RANGE_START } from './chartModel'

function formatMinuteOfDay(minute: number): string {
  const hour = Math.floor(minute / 60)
  const rest = minute % 60
  return rest === 0 ? formatKstHour(hour) : `${formatKstHour(hour)} ${rest}분`
}

function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60)
  const rest = minutes % 60
  if (hours === 0) return `${rest}분`
  return rest === 0 ? `${hours}시간` : `${hours}시간 ${rest}분`
}

function formatSeats(value: number): string {
  return String(Number(value.toFixed(1)))
}

function sourceSuffix(source: StatsDataSource): string {
  switch (source) {
    case 'SEED':
      return ' 예시 데이터예요.'
    case 'MIXED':
      return ' 예시 데이터가 섞여 있어요.'
    case 'UNRECOGNIZED':
      return ' 출처를 알 수 없는 데이터예요.'
    default:
      return ''
  }
}

export function todaySummary(
  daily: DailyStats,
  nowMinute: number,
  dataMinute: number = nowMinute,
): string {
  const empty = '오늘은 아직 기록이 없어요.'
  if (daily.dataSource === null) return empty

  const buckets = daily.buckets
    .map((bucket) => ({
      startMinute: kstClock(Date.parse(bucket.start)).minuteOfDay,
      avg: bucket.avgAvailableSeats,
    }))
    .sort((a, b) => a.startMinute - b.startMinute)

  let first: number | null = null
  let end = 0
  let most: { startMinute: number; avg: number } | null = null
  let least: { startMinute: number; avg: number } | null = null
  for (const { startMinute, avg } of buckets) {
    if (avg === null) continue
    first ??= startMinute
    end = startMinute + daily.bucketMinutes
    if (most === null || avg > most.avg) most = { startMinute, avg }
    if (least === null || avg < least.avg) least = { startMinute, avg }
  }
  if (first === null || most === null || least === null) return empty

  const rangeStart = Math.min(DEFAULT_RANGE_START, Math.floor(first / 60) * 60)
  const missingMinutes =
    buckets.filter(
      (b) => b.avg === null && b.startMinute >= rangeStart && b.startMinute < dataMinute,
    ).length * daily.bucketMinutes

  let text =
    `오늘 ${formatMinuteOfDay(first)}부터 ${formatMinuteOfDay(end)}까지 기록이에요. ` +
    `빈자리가 가장 많았던 때는 ${formatMinuteOfDay(most.startMinute)}(평균 ${formatSeats(most.avg)}석), ` +
    `가장 적었던 때는 ${formatMinuteOfDay(least.startMinute)}(평균 ${formatSeats(least.avg)}석)이에요.`
  if (missingMinutes > 0) text += ` 확인하지 못한 시간이 ${formatDuration(missingMinutes)} 있어요.`
  return text + sourceSuffix(daily.dataSource)
}
