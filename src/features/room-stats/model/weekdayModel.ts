import { weekdayLabel } from '@/entities/room'
import type { Weekday, WeeklyStats } from '@/entities/room'
import { formatKstHour } from '@/shared/lib'

const MIN_NOTICEABLE_DIFFERENCE = 0.5

export function weekdaySentence(weekly: WeeklyStats, weekday: Weekday): string {
  const label = weekdayLabel(weekday)
  const cells = weekly.cells
    .filter((cell) => cell.weekday === weekday && cell.avgAvailableSeats !== null)
    .sort((a, b) => a.hour - b.hour)

  let busiest: { hour: number; avg: number } | null = null
  let quietest: { hour: number; avg: number } | null = null
  for (const cell of cells) {
    const avg = cell.avgAvailableSeats ?? 0
    if (busiest === null || avg < busiest.avg) busiest = { hour: cell.hour, avg }
    if (quietest === null || avg > quietest.avg) quietest = { hour: cell.hour, avg }
  }

  if (busiest === null || quietest === null) return '이 요일은 아직 기록이 없어요.'
  if (quietest.avg - busiest.avg < MIN_NOTICEABLE_DIFFERENCE) {
    return `${label}은 시간대별 차이가 크지 않아요.`
  }
  return `${label}은 보통 ${formatKstHour(busiest.hour)}쯤 가장 붐비고 ${formatKstHour(quietest.hour)}쯤 가장 한산해요.`
}
