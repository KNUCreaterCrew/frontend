import { weekdayLabel } from '@/entities/room'
import type { RoomSummary, Weekday, WeeklyCell } from '@/entities/room'

export type UsualComparison = 'quieter' | 'similar' | 'busier'

const MIN_OBSERVED_DAYS = 2

export function compareWithUsual(
  current: RoomSummary,
  usual: WeeklyCell | undefined,
  statsTotalSeats: number,
): UsualComparison | null {
  if (current.kind !== 'known') return null
  if (usual === undefined || usual.avgAvailableSeats === null) return null
  if (usual.observedDays < MIN_OBSERVED_DAYS) return null
  if (statsTotalSeats !== current.totalSeats) return null

  const margin = Math.max(1, current.totalSeats * 0.2)
  const available = current.availableSeats
  const unknown = current.unknownSeats
  const usualAvg = usual.avgAvailableSeats

  if (available >= usualAvg + margin) return 'quieter'
  if (available + unknown <= usualAvg - margin) return 'busier'
  if (available >= usualAvg - margin && available + unknown <= usualAvg + margin) return 'similar'
  return null
}

export function comparisonSentence(comparison: UsualComparison, weekday: Weekday): string {
  const prefix = `지금은 평소 ${weekdayLabel(weekday)} 이 시간`
  switch (comparison) {
    case 'quieter':
      return `${prefix}보다 한산해요.`
    case 'similar':
      return `${prefix}과 비슷해요.`
    case 'busier':
      return `${prefix}보다 붐벼요.`
  }
}
