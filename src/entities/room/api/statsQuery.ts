import { queryOptions } from '@tanstack/react-query'
import { endpoints, http, isNotFoundError } from '@/shared/api'
import { dailyStatsDtoSchema, weeklyStatsDtoSchema } from '../model/statsDto'
import { toDailyStats, toWeeklyStats } from '../model/statsMapping'
import type { DailyStats, WeeklyStats } from '../model/types'
import { roomKeys, unlessNotFound } from './roomQuery'

export async function fetchDailyStats(
  roomId: string,
  date: string,
  signal?: AbortSignal,
): Promise<DailyStats> {
  const dto = await http.get(endpoints.roomDailyStats(roomId, date), dailyStatsDtoSchema, {
    signal,
    timeoutMs: 30_000,
  })
  return toDailyStats(dto)
}

export async function fetchWeeklyStats(
  roomId: string,
  weeks: number,
  signal?: AbortSignal,
): Promise<WeeklyStats> {
  const dto = await http.get(endpoints.roomWeeklyStats(roomId, weeks), weeklyStatsDtoSchema, {
    signal,
    timeoutMs: 30_000,
  })
  return toWeeklyStats(dto)
}

export function dailyStatsQueryOptions(roomId: string, date: string) {
  return queryOptions({
    queryKey: roomKeys.dailyStats(roomId, date),
    queryFn: ({ signal }) => fetchDailyStats(roomId, date, signal),
    refetchInterval: (query) => (isNotFoundError(query.state.error) ? false : 60_000),
    refetchOnWindowFocus: unlessNotFound,
    refetchOnReconnect: unlessNotFound,
    retryOnMount: unlessNotFound,
  })
}

export function weeklyStatsQueryOptions(roomId: string, weeks = 4) {
  return queryOptions({
    queryKey: roomKeys.weeklyStats(roomId, weeks),
    queryFn: ({ signal }) => fetchWeeklyStats(roomId, weeks, signal),
    staleTime: 30 * 60_000,
    refetchOnWindowFocus: unlessNotFound,
    refetchOnReconnect: unlessNotFound,
    retryOnMount: unlessNotFound,
  })
}
