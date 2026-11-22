import { toCongestion } from './mapping'
import type { DailyStatsDto, WeeklyStatsDto } from './statsDto'
import { WEEKDAYS } from './types'
import type {
  CongestionLevel,
  DailyStats,
  StatsDataSource,
  Weekday,
  WeeklyCell,
  WeeklyStats,
} from './types'

function toDataSource(raw: string | null): StatsDataSource {
  if (raw === null) return null
  return raw === 'OBSERVED' || raw === 'SEED' || raw === 'MIXED' ? raw : 'UNRECOGNIZED'
}

function toLevel(raw: string | null): CongestionLevel | null {
  return raw === null ? null : toCongestion(raw)
}

function toWeekday(raw: string): Weekday | null {
  return WEEKDAYS.find((weekday) => weekday === raw) ?? null
}

export function toDailyStats(dto: DailyStatsDto): DailyStats {
  return {
    roomId: dto.room_id,
    date: dto.date,
    bucketMinutes: dto.bucket_minutes,
    totalSeats: dto.total_seats,
    dataSource: toDataSource(dto.data_source),
    buckets: dto.buckets.map((bucket) => ({
      start: bucket.start,
      observedMinutes: bucket.observed_minutes,
      avgAvailableSeats: bucket.avg_available_seats,
      avgUnknownSeats: bucket.avg_unknown_seats,
      congestionLevel: toLevel(bucket.congestion_level),
    })),
  }
}

export function toWeeklyStats(dto: WeeklyStatsDto): WeeklyStats {
  const cells: WeeklyCell[] = []
  for (const cell of dto.cells) {
    const weekday = toWeekday(cell.weekday)
    if (weekday === null) continue
    cells.push({
      weekday,
      hour: cell.hour,
      observedMinutes: cell.observed_minutes,
      observedDays: cell.observed_days,
      avgAvailableSeats: cell.avg_available_seats,
      avgUnknownSeats: cell.avg_unknown_seats,
      congestionLevel: toLevel(cell.congestion_level),
    })
  }
  return {
    roomId: dto.room_id,
    startDate: dto.start_date,
    endDate: dto.end_date,
    weeks: dto.weeks,
    bucketMinutes: dto.bucket_minutes,
    totalSeats: dto.total_seats,
    dataSource: toDataSource(dto.data_source),
    cells,
  }
}
