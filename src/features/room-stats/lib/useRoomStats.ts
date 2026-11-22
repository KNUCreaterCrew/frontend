import { useQuery, type UseQueryResult } from '@tanstack/react-query'
import { dailyStatsQueryOptions, weeklyStatsQueryOptions } from '@/entities/room'
import type { DailyStats, WeeklyStats } from '@/entities/room'
import { kstClock, useNow, type KstClock } from '@/shared/lib'

export interface RoomStatsQueries {
  now: number
  clock: KstClock
  daily: UseQueryResult<DailyStats, unknown>
  weekly: UseQueryResult<WeeklyStats, unknown>
}

// 1분마다 KST 시계를 다시 읽는다. 자정을 넘기면 날짜가 바뀌어 새 날의 기록을 조회한다
export function useRoomStats(roomId: string, enabled: boolean): RoomStatsQueries {
  const now = useNow(60_000)
  const clock = kstClock(now)
  const daily = useQuery({ ...dailyStatsQueryOptions(roomId, clock.date), enabled })
  const weekly = useQuery({ ...weeklyStatsQueryOptions(roomId), enabled })
  return { now, clock, daily, weekly }
}
