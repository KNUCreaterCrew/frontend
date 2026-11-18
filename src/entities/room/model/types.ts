import type { z } from 'zod'
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
