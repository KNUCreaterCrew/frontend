import { HttpResponse, http } from 'msw'
import type { DailyStatsDto, WeeklyStatsDto } from '@/entities/room'
import { kstClock } from '@/shared/lib'
import { ROOM_ID } from '../fixtures/rooms'
import { defaultDailyStats, defaultWeeklyStats } from '../fixtures/stats'
import type { MockHandler } from './rooms'

export const DAILY_STATS_URL = '*/api/v1/rooms/:roomId/stats/daily'
export const WEEKLY_STATS_URL = '*/api/v1/rooms/:roomId/stats/weekly'

const notFound = () => HttpResponse.json({ detail: '등록되지 않은 방입니다.' }, { status: 404 })

export function dailyStatsHandler(build: (date: string) => DailyStatsDto) {
  return http.get(DAILY_STATS_URL, ({ params, request }) => {
    if (params.roomId !== ROOM_ID) return notFound()
    const date = new URL(request.url).searchParams.get('date') ?? kstClock(Date.now()).date
    return HttpResponse.json(build(date))
  })
}

export function weeklyStatsHandler(build: () => WeeklyStatsDto) {
  return http.get(WEEKLY_STATS_URL, ({ params }) => {
    if (params.roomId !== ROOM_ID) return notFound()
    return HttpResponse.json(build())
  })
}

export function statsHandlers(): MockHandler[] {
  return [
    dailyStatsHandler((date) => defaultDailyStats(date, Date.now())),
    weeklyStatsHandler(() => defaultWeeklyStats('OBSERVED', Date.now())),
  ]
}
