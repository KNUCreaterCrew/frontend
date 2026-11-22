import { dailyStatsDtoSchema, weeklyStatsDtoSchema } from './statsDto'

function dailyJson(overrides: Record<string, unknown> = {}) {
  const buckets = Array.from({ length: 144 }, (_, i): Record<string, unknown> => {
    const h = String(Math.floor(i / 6)).padStart(2, '0')
    const m = String((i % 6) * 10).padStart(2, '0')
    return {
      start: `2026-11-24T${h}:${m}:00+09:00`,
      observed_minutes: 0,
      avg_available_seats: null,
      avg_unknown_seats: null,
      congestion_level: null,
    }
  })
  buckets[60] = {
    start: '2026-11-24T10:00:00+09:00',
    observed_minutes: 6,
    avg_available_seats: 1.7,
    avg_unknown_seats: 0.2,
    congestion_level: 'MODERATE',
  }
  return {
    room_id: 'IT4-101',
    date: '2026-11-24',
    bucket_minutes: 10,
    total_seats: 4,
    data_source: 'OBSERVED',
    buckets,
    ...overrides,
  }
}

const weeklyJson = {
  room_id: 'IT4-101',
  start_date: '2026-10-27',
  end_date: '2026-11-23',
  weeks: 4,
  bucket_minutes: 60,
  total_seats: 4,
  data_source: 'MIXED',
  cells: [
    {
      weekday: 'TUE',
      hour: 10,
      observed_days: 3,
      observed_minutes: 170,
      avg_available_seats: 2.1,
      avg_unknown_seats: 0.1,
      congestion_level: 'MODERATE',
    },
    {
      weekday: 'MON',
      hour: 3,
      observed_days: 0,
      observed_minutes: 0,
      avg_available_seats: null,
      avg_unknown_seats: null,
      congestion_level: null,
    },
  ],
}

describe('dailyStatsDtoSchema', () => {
  it('144칸 예시를 통과시킨다', () => {
    const parsed = dailyStatsDtoSchema.parse(dailyJson())
    expect(parsed.buckets).toHaveLength(144)
    expect(parsed.buckets[60]?.avg_available_seats).toBe(1.7)
  })

  it('오프셋 없는 start 는 실패한다', () => {
    const json = dailyJson()
    const buckets = json.buckets.map((b, i) =>
      i === 0 ? { ...b, start: '2026-11-24T10:00:00' } : b,
    )
    expect(dailyStatsDtoSchema.safeParse({ ...json, buckets }).success).toBe(false)
  })

  it('날짜 모양이 다르면 실패한다', () => {
    expect(dailyStatsDtoSchema.safeParse(dailyJson({ date: '2026/11/24' })).success).toBe(false)
  })

  it('모르는 data_source 문자열은 통과한다', () => {
    expect(dailyStatsDtoSchema.safeParse(dailyJson({ data_source: 'FOO' })).success).toBe(true)
  })
})

describe('weeklyStatsDtoSchema', () => {
  it('예시를 통과시킨다', () => {
    const parsed = weeklyStatsDtoSchema.parse(weeklyJson)
    expect(parsed.cells[0]?.observed_days).toBe(3)
    expect(parsed.data_source).toBe('MIXED')
  })

  it('hour 24 는 실패한다', () => {
    const cells = [{ ...weeklyJson.cells[0], hour: 24 }]
    expect(weeklyStatsDtoSchema.safeParse({ ...weeklyJson, cells }).success).toBe(false)
  })
})
