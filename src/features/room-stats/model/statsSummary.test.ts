import { describe, expect, it } from 'vitest'
import { bucket, daily } from './fixtures'
import { todaySummary } from './statsSummary'

const buckets = [
  bucket('08:00', 10, 3, 0),
  bucket('08:10', 0, null, null),
  bucket('08:20', 10, 0.5, 0),
]

const BASE =
  '오늘 8시부터 8시 30분까지 기록이에요. 빈자리가 가장 많았던 때는 8시(평균 3석), 가장 적었던 때는 8시 20분(평균 0.5석)이에요. 확인하지 못한 시간이 10분 있어요.'

describe('todaySummary', () => {
  it('기록 범위, 가장 많았던 때와 적었던 때, 확인하지 못한 시간을 말한다', () => {
    expect(todaySummary(daily(buckets), 510)).toBe(BASE)
  })

  it('예시 데이터 출처를 끝에 붙인다', () => {
    expect(todaySummary(daily(buckets, 'SEED'), 510)).toBe(`${BASE} 예시 데이터예요.`)
    expect(todaySummary(daily(buckets, 'MIXED'), 510)).toBe(`${BASE} 예시 데이터가 섞여 있어요.`)
    expect(todaySummary(daily(buckets, 'UNRECOGNIZED'), 510)).toBe(
      `${BASE} 출처를 알 수 없는 데이터예요.`,
    )
  })

  it('확인하지 못한 시간이 0이면 그 문장을 뺀다', () => {
    const d = daily([bucket('08:00', 10, 3, 0), bucket('08:10', 10, 0.5, 0)])
    expect(todaySummary(d, 500)).toBe(
      '오늘 8시부터 8시 20분까지 기록이에요. 빈자리가 가장 많았던 때는 8시(평균 3석), 가장 적었던 때는 8시 10분(평균 0.5석)이에요.',
    )
  })

  it('지금 이후의 null 칸은 세지 않는다', () => {
    expect(todaySummary(daily(buckets), 490)).not.toContain('확인하지 못한')
    expect(todaySummary(daily(buckets), 511)).toContain('확인하지 못한 시간이 10분 있어요.')
  })

  it('60분 이상은 시간과 분으로 말한다', () => {
    const nulls = Array.from({ length: 14 }, (_, i) => {
      const m = 600 + (i + 1) * 10
      const hh = String(Math.floor(m / 60)).padStart(2, '0')
      const mm = String(m % 60).padStart(2, '0')
      return bucket(`${hh}:${mm}`, 0, null, null)
    })
    const d = daily([bucket('10:00', 10, 1, 0), ...nulls, bucket('12:30', 10, 1, 0)])
    expect(todaySummary(d, 800)).toContain('확인하지 못한 시간이 2시간 20분 있어요.')
  })

  it('기록이 없으면 안내 문장', () => {
    expect(todaySummary(daily([], null), 600)).toBe('오늘은 아직 기록이 없어요.')
  })
})
