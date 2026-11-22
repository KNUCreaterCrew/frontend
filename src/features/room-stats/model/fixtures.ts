import type {
  DailyStats,
  StatsBucket,
  StatsDataSource,
  WeeklyCell,
  WeeklyStats,
} from '@/entities/room'

export function bucket(
  time: string,
  observedMinutes: number,
  avail: number | null,
  unknown: number | null,
): StatsBucket {
  return {
    start: `2026-11-24T${time}:00+09:00`,
    observedMinutes,
    avgAvailableSeats: avail,
    avgUnknownSeats: unknown,
    congestionLevel: avail === null ? null : 'MODERATE',
  }
}

export function daily(
  buckets: StatsBucket[],
  dataSource: StatsDataSource = 'OBSERVED',
  totalSeats = 4,
): DailyStats {
  return {
    roomId: 'IT4-101',
    date: '2026-11-24',
    bucketMinutes: 10,
    totalSeats,
    dataSource,
    buckets,
  }
}

export function wcell(
  weekday: WeeklyCell['weekday'],
  hour: number,
  avail: number | null,
  unknown: number | null = 0,
): WeeklyCell {
  return {
    weekday,
    hour,
    observedMinutes: avail === null ? 0 : 170,
    observedDays: avail === null ? 0 : 3,
    avgAvailableSeats: avail,
    avgUnknownSeats: avail === null ? null : unknown,
    congestionLevel: avail === null ? null : 'MODERATE',
  }
}

export function weekly(cells: WeeklyCell[], dataSource: StatsDataSource = 'MIXED'): WeeklyStats {
  return {
    roomId: 'IT4-101',
    startDate: '2026-10-27',
    endDate: '2026-11-23',
    weeks: 4,
    bucketMinutes: 60,
    totalSeats: 4,
    dataSource,
    cells,
  }
}
