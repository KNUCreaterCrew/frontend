import type { DailyStatsDto, WeeklyStatsDto } from '@/entities/room'
import { WEEKDAYS } from '@/entities/room'
import { kstClock } from '@/shared/lib'

export type StatsSource = 'OBSERVED' | 'SEED' | 'MIXED'

type Bucket = DailyStatsDto['buckets'][number]
type Cell = WeeklyStatsDto['cells'][number]

const TOTAL_SEATS = 4
const BUCKET_MINUTES = 10
const BUCKETS_PER_DAY = 144
const FIRST_HOUR = 8
const LAST_HOUR = 21

// 빈자리 비율 60% 이상 LOW, 25% 이하 HIGH, 그 사이 MODERATE, 평균이 없으면 null.
function levelOf(avgAvailable: number | null): string | null {
  if (avgAvailable === null) return null
  const ratio = avgAvailable / TOTAL_SEATS
  if (ratio >= 0.6) return 'LOW'
  if (ratio <= 0.25) return 'HIGH'
  return 'MODERATE'
}

const pad = (n: number) => String(n).padStart(2, '0')

function bucketStart(date: string, index: number): string {
  const minutes = index * BUCKET_MINUTES
  return `${date}T${pad(Math.floor(minutes / 60))}:${pad(minutes % 60)}:00+09:00`
}

const offBucket = (start: string): Bucket => ({
  start,
  observed_minutes: 0,
  avg_available_seats: null,
  avg_unknown_seats: null,
  congestion_level: null,
})

function filled(start: string, available: number, unknown: number, minutes: number): Bucket {
  return {
    start,
    observed_minutes: minutes,
    avg_available_seats: available,
    avg_unknown_seats: unknown,
    congestion_level: levelOf(available),
  }
}

type Slot = readonly [available: number, unknown: number, minutes: number] | null

// 8시부터 13시까지 10분 묶음. null 은 장치 꺼짐.
// prettier-ignore
const MORNING: readonly Slot[] = [
  [3, 0, 10], [4, 0, 10], [3, 0, 10], [3, 0, 10], [3, 0, 10], [2.8, 0, 10],
  [2.5, 0, 10], [2, 0, 10], [2, 0.3, 10], [3, 0, 10], [2, 0, 10], [2, 0, 10],
  [1, 0, 10], [1, 0, 10], [0.6, 0, 10], [0, 0, 10], [0, 0.4, 10], [1, 0, 10],
  [1, 0, 10], [1.3, 0, 3], null, null, null, null,
  [2, 0.5, 10], [2.6, 0, 10], [3, 0, 10], [2, 0, 10], [2, 0, 10], [1.4, 0, 10],
  [1, 0, 10], [1, 1, 10], [1, 1, 10], [0.5, 1, 10], [1, 1, 10], [1, 1, 10],
]

const FIRST_INDEX = FIRST_HOUR * 6
const AFTERNOON_INDEX = 14 * 6
const END_INDEX = (LAST_HOUR + 1) * 6

export function emptyDailyStats(date: string): DailyStatsDto {
  return {
    room_id: 'IT4-101',
    date,
    bucket_minutes: BUCKET_MINUTES,
    total_seats: TOTAL_SEATS,
    data_source: null,
    buckets: Array.from({ length: BUCKETS_PER_DAY }, (_, i) => offBucket(bucketStart(date, i))),
  }
}

export function defaultDailyStats(
  date: string,
  nowMs: number,
  source: StatsSource = 'OBSERVED',
): DailyStatsDto {
  const clock = kstClock(nowMs)
  const today = clock.date === date
  const current = Math.floor(clock.minuteOfDay / BUCKET_MINUTES)
  const currentMinutes = (i: number) => Math.max(1, clock.minuteOfDay - i * BUCKET_MINUTES)
  const buckets = Array.from({ length: BUCKETS_PER_DAY }, (_, i): Bucket => {
    const start = bucketStart(date, i)
    if (i < FIRST_INDEX || i >= END_INDEX) return offBucket(start)
    const slot = i < AFTERNOON_INDEX ? MORNING[i - FIRST_INDEX] : null
    if (i < AFTERNOON_INDEX) {
      if (!slot) return offBucket(start)
      if (today && i > current) return offBucket(start)
      const minutes = today && i === current ? currentMinutes(i) : slot[2]
      return filled(start, slot[0], slot[1], minutes)
    }
    if (!today) return filled(start, 2, 0, BUCKET_MINUTES)
    if (i < current) return filled(start, 1, 1, BUCKET_MINUTES)
    if (i === current) return filled(start, 1, 1, currentMinutes(i))
    return offBucket(start)
  })
  return {
    room_id: 'IT4-101',
    date,
    bucket_minutes: BUCKET_MINUTES,
    total_seats: TOTAL_SEATS,
    data_source: source,
    buckets,
  }
}

// prettier-ignore
const WEEKDAY_PROFILE: Record<number, number> = {
  8: 2.6, 9: 2.6, 10: 1, 11: 0.9, 12: 2.1, 13: 0.9, 14: 0.8,
  15: 1, 16: 0.7, 17: 2, 18: 1.8, 19: 2.6, 20: 2.5, 21: 2.5,
}
// 차이가 0.5 미만인 평평한 주말.
// prettier-ignore
const WEEKEND_PROFILE: Record<number, number> = {
  8: 3.3, 9: 3.2, 10: 3.1, 11: 3.1, 12: 3, 13: 3, 14: 3.1,
  15: 3, 16: 3.1, 17: 3, 18: 3.3, 19: 3.2, 20: 3.3, 21: 3.3,
}

const OBSERVED_DAYS = 4

function shiftDate(date: string, days: number): string {
  return new Date(Date.parse(`${date}T00:00:00Z`) + days * 86_400_000).toISOString().slice(0, 10)
}

const offCell = (weekday: Cell['weekday'], hour: number): Cell => ({
  weekday,
  hour,
  observed_days: 0,
  observed_minutes: 0,
  avg_available_seats: null,
  avg_unknown_seats: null,
  congestion_level: null,
})

export function emptyWeeklyStats(nowMs: number): WeeklyStatsDto {
  const today = kstClock(nowMs).date
  return {
    room_id: 'IT4-101',
    start_date: shiftDate(today, -28),
    end_date: shiftDate(today, -1),
    weeks: 4,
    bucket_minutes: 60,
    total_seats: TOTAL_SEATS,
    data_source: null,
    cells: WEEKDAYS.flatMap((weekday) =>
      Array.from({ length: 24 }, (_, hour) => offCell(weekday, hour)),
    ),
  }
}

export function defaultWeeklyStats(source: StatsSource, nowMs: number): WeeklyStatsDto {
  return {
    ...emptyWeeklyStats(nowMs),
    data_source: source,
    cells: WEEKDAYS.flatMap((weekday) => {
      const profile = weekday === 'SAT' || weekday === 'SUN' ? WEEKEND_PROFILE : WEEKDAY_PROFILE
      return Array.from({ length: 24 }, (_, hour): Cell => {
        const available = profile[hour]
        if (available === undefined) return offCell(weekday, hour)
        return {
          weekday,
          hour,
          observed_days: OBSERVED_DAYS,
          observed_minutes: OBSERVED_DAYS * 60,
          avg_available_seats: available,
          avg_unknown_seats: 0,
          congestion_level: levelOf(available),
        }
      })
    }),
  }
}
