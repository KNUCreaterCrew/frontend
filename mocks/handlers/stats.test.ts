import { dailyStatsDtoSchema, weeklyStatsDtoSchema } from '@/entities/room'
import {
  defaultDailyStats,
  defaultWeeklyStats,
  emptyDailyStats,
  emptyWeeklyStats,
} from '../fixtures/stats'

const NOW = Date.parse('2026-11-24T14:05:00+09:00')

describe('defaultDailyStats', () => {
  const daily = defaultDailyStats('2026-11-24', NOW)
  const at = (hhmm: string) => daily.buckets.find((b) => b.start.includes(`T${hhmm}:00+09:00`))!

  test('스키마를 통과하고 144칸이다', () => {
    expect(dailyStatsDtoSchema.safeParse(daily).success).toBe(true)
    expect(daily.buckets).toHaveLength(144)
    expect(daily.total_seats).toBe(4)
    expect(daily.data_source).toBe('OBSERVED')
  })
  test('8시 앞은 모두 0분이다', () => {
    const before = daily.buckets.slice(0, 48)
    expect(before.every((b) => b.observed_minutes === 0 && b.congestion_level === null)).toBe(true)
  })
  test('11시 20분부터 네 칸은 0분 null(장치 꺼짐)이다', () => {
    for (const t of ['11:20', '11:30', '11:40', '11:50']) {
      const b = at(t)
      expect(b.observed_minutes).toBe(0)
      expect(b.avg_available_seats).toBeNull()
    }
  })
  test('11시 10분 칸은 3분, 14시 칸은 5분이다', () => {
    expect(at('11:10').observed_minutes).toBe(3)
    expect(at('14:00').observed_minutes).toBe(5)
    expect(at('14:00').avg_available_seats).toBe(1)
  })
  test('14시 10분부터는 0분 null 이다', () => {
    for (const b of daily.buckets.filter((x) => x.start >= '2026-11-24T14:10')) {
      expect(b.observed_minutes).toBe(0)
      expect(b.avg_available_seats).toBeNull()
    }
  })
  test('혼잡도는 빈자리 비율로 정한다', () => {
    expect(at('08:10').congestion_level).toBe('LOW')
    expect(at('09:10').congestion_level).toBe('MODERATE')
    expect(at('10:30').congestion_level).toBe('HIGH')
  })
  test('지난 날이면 14시부터 21시 50분까지 채운다', () => {
    const past = defaultDailyStats('2026-11-23', NOW)
    for (const b of past.buckets.slice(84, 132)) {
      expect(b.observed_minutes).toBe(10)
      expect(b.avg_available_seats).toBe(2)
    }
  })
  test('source 를 받는다', () => {
    expect(defaultDailyStats('2026-11-24', NOW, 'MIXED').data_source).toBe('MIXED')
  })
})

describe('오늘 통계는 지금 시각까지만 채운다', () => {
  const at = (d: ReturnType<typeof defaultDailyStats>, hhmm: string) =>
    d.buckets.find((b) => b.start.includes(`T${hhmm}:00+09:00`))!

  test('10시 5분이면 10시 칸은 5분, 그 뒤는 비어 있다', () => {
    const d = defaultDailyStats('2026-11-24', Date.parse('2026-11-24T10:05:00+09:00'))
    expect(at(d, '10:00').observed_minutes).toBe(5)
    expect(at(d, '10:00').avg_available_seats).toBe(1)
    expect(at(d, '10:10').observed_minutes).toBe(0)
    expect(at(d, '10:10').avg_available_seats).toBeNull()
    expect(at(d, '13:00').observed_minutes).toBe(0)
    expect(at(d, '13:00').avg_available_seats).toBeNull()
    expect(at(d, '09:50').observed_minutes).toBe(10)
  })
  test('8시 전이면 모든 칸이 비고 관측이 없으니 data_source 는 null 이다', () => {
    const d = defaultDailyStats('2026-11-24', Date.parse('2026-11-24T07:30:00+09:00'), 'MIXED')
    expect(d.buckets).toHaveLength(144)
    expect(d.buckets.every((b) => b.observed_minutes === 0)).toBe(true)
    expect(d.data_source).toBeNull()
  })
})

test('emptyDailyStats 는 144칸 모두 0분이고 data_source 가 null 이다', () => {
  const empty = emptyDailyStats('2026-11-24')
  expect(dailyStatsDtoSchema.safeParse(empty).success).toBe(true)
  expect(empty.buckets).toHaveLength(144)
  expect(empty.data_source).toBeNull()
  expect(empty.total_seats).toBe(4)
  expect(empty.buckets.every((b) => b.observed_minutes === 0)).toBe(true)
})

describe('weekly', () => {
  const weekly = defaultWeeklyStats('SEED', NOW)
  test('스키마를 통과하고 168칸이다', () => {
    expect(weeklyStatsDtoSchema.safeParse(weekly).success).toBe(true)
    expect(weekly.cells).toHaveLength(168)
    expect(weekly.data_source).toBe('SEED')
    expect(weekly.start_date).toBe('2026-10-27')
    expect(weekly.end_date).toBe('2026-11-23')
  })
  test('화요일 14시 평균은 0.8 이고 4일 관측이다', () => {
    const cell = weekly.cells.find((c) => c.weekday === 'TUE' && c.hour === 14)!
    expect(cell.avg_available_seats).toBe(0.8)
    expect(cell.observed_days).toBe(4)
    expect(cell.avg_unknown_seats).toBe(0)
  })
  test('8시부터 21시 밖은 null 이다', () => {
    const out = weekly.cells.filter((c) => c.hour < 8 || c.hour > 21)
    expect(out.every((c) => c.avg_available_seats === null && c.observed_minutes === 0)).toBe(true)
  })
  test('주말은 평평하다', () => {
    const sat = weekly.cells.filter((c) => c.weekday === 'SAT' && c.hour >= 8 && c.hour <= 21)
    const values = sat.map((c) => c.avg_available_seats!)
    expect(Math.max(...values) - Math.min(...values)).toBeLessThan(0.5)
  })
})

test('emptyWeeklyStats 는 data_source 가 null 이고 모든 칸 0분이다', () => {
  const empty = emptyWeeklyStats(NOW)
  expect(weeklyStatsDtoSchema.safeParse(empty).success).toBe(true)
  expect(empty.data_source).toBeNull()
  expect(empty.cells.every((c) => c.observed_minutes === 0 && c.observed_days === 0)).toBe(true)
})

describe('defaultDailyStats 자정 직후', () => {
  test('관측된 칸이 하나도 없으면 data_source 는 null 이다', () => {
    const daily = defaultDailyStats('2026-11-24', Date.parse('2026-11-24T00:49:00+09:00'))
    expect(daily.buckets.every((b) => b.observed_minutes === 0)).toBe(true)
    expect(daily.data_source).toBeNull()
  })
})
