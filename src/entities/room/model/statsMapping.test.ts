import { dailyStatsDtoSchema, weeklyStatsDtoSchema } from './statsDto'
import { toDailyStats, toWeeklyStats } from './statsMapping'

function daily(overrides: Record<string, unknown> = {}, bucket: Record<string, unknown> = {}) {
  return dailyStatsDtoSchema.parse({
    room_id: 'IT4-101',
    date: '2026-11-24',
    bucket_minutes: 10,
    total_seats: 4,
    data_source: 'OBSERVED',
    buckets: [
      {
        start: '2026-11-24T10:00:00+09:00',
        observed_minutes: 6,
        avg_available_seats: 1.7,
        avg_unknown_seats: 0.2,
        congestion_level: 'MODERATE',
        ...bucket,
      },
    ],
    ...overrides,
  })
}

function cell(overrides: Record<string, unknown> = {}) {
  return {
    weekday: 'TUE',
    hour: 10,
    observed_days: 3,
    observed_minutes: 170,
    avg_available_seats: 2.1,
    avg_unknown_seats: 0.1,
    congestion_level: 'MODERATE',
    ...overrides,
  }
}

function weekly(cells: unknown[], dataSource: string | null = 'MIXED') {
  return weeklyStatsDtoSchema.parse({
    room_id: 'IT4-101',
    start_date: '2026-10-27',
    end_date: '2026-11-23',
    weeks: 4,
    bucket_minutes: 60,
    total_seats: 4,
    data_source: dataSource,
    cells,
  })
}

describe('toDailyStats', () => {
  it('필드 이름을 camelCase 로 바꾼다', () => {
    expect(toDailyStats(daily())).toEqual({
      roomId: 'IT4-101',
      date: '2026-11-24',
      bucketMinutes: 10,
      totalSeats: 4,
      dataSource: 'OBSERVED',
      buckets: [
        {
          start: '2026-11-24T10:00:00+09:00',
          observedMinutes: 6,
          avgAvailableSeats: 1.7,
          avgUnknownSeats: 0.2,
          congestionLevel: 'MODERATE',
        },
      ],
    })
  })

  it('알려진 data_source 와 null 은 그대로 둔다', () => {
    for (const source of ['OBSERVED', 'SEED', 'MIXED', null]) {
      expect(toDailyStats(daily({ data_source: source })).dataSource).toBe(source)
    }
  })

  it('모르는 data_source 는 UNRECOGNIZED 로 바꾼다', () => {
    expect(toDailyStats(daily({ data_source: 'FOO' })).dataSource).toBe('UNRECOGNIZED')
  })

  it('congestion_level null 은 null, 모르는 값은 UNRECOGNIZED', () => {
    expect(toDailyStats(daily({}, { congestion_level: null })).buckets[0]?.congestionLevel).toBe(
      null,
    )
    expect(toDailyStats(daily({}, { congestion_level: 'BUSY' })).buckets[0]?.congestionLevel).toBe(
      'UNRECOGNIZED',
    )
  })
})

describe('toWeeklyStats', () => {
  it('필드 이름을 camelCase 로 바꾼다', () => {
    expect(toWeeklyStats(weekly([cell()]))).toEqual({
      roomId: 'IT4-101',
      startDate: '2026-10-27',
      endDate: '2026-11-23',
      weeks: 4,
      bucketMinutes: 60,
      totalSeats: 4,
      dataSource: 'MIXED',
      cells: [
        {
          weekday: 'TUE',
          hour: 10,
          observedMinutes: 170,
          observedDays: 3,
          avgAvailableSeats: 2.1,
          avgUnknownSeats: 0.1,
          congestionLevel: 'MODERATE',
        },
      ],
    })
  })

  it('모르는 요일 칸은 뺀다', () => {
    const result = toWeeklyStats(weekly([cell({ weekday: 'XYZ' }), cell({ weekday: 'MON' })]))
    expect(result.cells.map((c) => c.weekday)).toEqual(['MON'])
  })

  it('data_source 와 congestion_level 을 같은 규칙으로 바꾼다', () => {
    const result = toWeeklyStats(
      weekly([cell({ congestion_level: 'BUSY' }), cell({ congestion_level: null })], 'FOO'),
    )
    expect(result.dataSource).toBe('UNRECOGNIZED')
    expect(result.cells.map((c) => c.congestionLevel)).toEqual(['UNRECOGNIZED', null])
  })
})
