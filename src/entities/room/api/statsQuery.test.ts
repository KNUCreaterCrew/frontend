import { ApiError } from '@/shared/api'
import { dailyStatsQueryOptions, weeklyStatsQueryOptions } from './statsQuery'

type QueryLike = { state: { error: unknown } }

describe('statsQuery', () => {
  it('일별 쿼리는 고정된 키와 1분 재조회를 쓴다', () => {
    const options = dailyStatsQueryOptions('IT4-101', '2026-11-24')
    expect(options.queryKey).toEqual(['rooms', 'stats', 'IT4-101', 'daily', '2026-11-24'])
    expect(options.refetchInterval).toBe(60_000)
  })

  it('주간 쿼리는 기본 4주이고 30분 동안 신선하다', () => {
    const options = weeklyStatsQueryOptions('IT4-101')
    expect(options.queryKey).toEqual(['rooms', 'stats', 'IT4-101', 'weekly', 4])
    expect(options.staleTime).toBe(30 * 60_000)
  })

  it('404 로 실패한 조회는 포커스에서 다시 부르지 않는다', () => {
    const refetchOnWindowFocus = dailyStatsQueryOptions('IT4-101', '2026-11-24')
      .refetchOnWindowFocus as (query: QueryLike) => boolean
    const notFound = new ApiError('http', { status: 404 })
    expect(refetchOnWindowFocus({ state: { error: notFound } })).toBe(false)
    expect(refetchOnWindowFocus({ state: { error: null } })).toBe(true)
  })
})
