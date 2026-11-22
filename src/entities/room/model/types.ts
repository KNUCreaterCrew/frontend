import type { z } from 'zod'
import type { KstWeekday } from '@/shared/lib'
import type { seatReasonSchema } from './dto'

export type SeatStatus = 'EMPTY' | 'OCCUPIED' | 'AWAY' | 'UNKNOWN' | 'UNRECOGNIZED'
export type SeatReason = z.infer<typeof seatReasonSchema> | 'UNRECOGNIZED'
export type CongestionLevel = 'LOW' | 'MODERATE' | 'HIGH' | 'UNRECOGNIZED'

export interface SeatLayout {
  x: number
  y: number
  width: number
  height: number
}

export interface Seat {
  seatId: string
  label: string
  status: SeatStatus
  rawStatus: string
  reason: SeatReason | null
  statusSince: string
  lastObservedAt: string | null
  hasOutlet: boolean
  isWindow: boolean
  layout: SeatLayout
}

export interface Room {
  roomId: string
  roomName: string
  totalSeats: number
  availableSeats: number
  unknownSeats: number
  congestionLevel: CongestionLevel
  edgeOnline: boolean
  version: number
  seats: Seat[]
}

export interface RoomListItem {
  roomId: string
  roomName: string
  totalSeats: number
  availableSeats: number
  unknownSeats: number
  congestionLevel: CongestionLevel
  edgeOnline: boolean
}

export interface SeatChange {
  seatId: string
  prevStatus: SeatStatus
  prevRawStatus: string
  status: SeatStatus
  rawStatus: string
  reason: SeatReason | null
  statusSince: string
  lastObservedAt: string | null
}

export type RoomEvent =
  | { type: 'EDGE_STATUS_CHANGED'; roomId: string; version: number; edgeOnline: boolean }
  | {
      type: 'SEAT_UPDATED'
      roomId: string
      version: number
      availableSeats: number
      unknownSeats: number
      congestionLevel: CongestionLevel
      changes: SeatChange[]
    }

export type Weekday = KstWeekday
export const WEEKDAYS: readonly Weekday[] = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN']

export type StatsDataSource = 'OBSERVED' | 'SEED' | 'MIXED' | 'UNRECOGNIZED' | null

export interface StatsBucket {
  start: string
  observedMinutes: number
  avgAvailableSeats: number | null
  avgUnknownSeats: number | null
  congestionLevel: CongestionLevel | null
}

export interface DailyStats {
  roomId: string
  date: string
  bucketMinutes: number
  totalSeats: number
  dataSource: StatsDataSource
  buckets: StatsBucket[]
}

export interface WeeklyCell {
  weekday: Weekday
  hour: number
  observedMinutes: number
  observedDays: number
  avgAvailableSeats: number | null
  avgUnknownSeats: number | null
  congestionLevel: CongestionLevel | null
}

export interface WeeklyStats {
  roomId: string
  startDate: string
  endDate: string
  weeks: number
  bucketMinutes: number
  totalSeats: number
  dataSource: StatsDataSource
  cells: WeeklyCell[]
}
