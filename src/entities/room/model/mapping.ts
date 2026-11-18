import { congestionLevelSchema, seatReasonSchema, seatStatusSchema } from './dto'
import type { RoomDto } from './dto'
import type { CongestionLevel, Room, Seat, SeatReason, SeatStatus } from './types'

function toStatus(raw: string): SeatStatus {
  const parsed = seatStatusSchema.safeParse(raw)
  return parsed.success ? parsed.data : 'UNRECOGNIZED'
}

function toReason(raw: string | null): SeatReason | null {
  if (raw === null) return null
  const parsed = seatReasonSchema.safeParse(raw)
  return parsed.success ? parsed.data : 'UNRECOGNIZED'
}

function toCongestion(raw: string): CongestionLevel {
  const parsed = congestionLevelSchema.safeParse(raw)
  return parsed.success ? parsed.data : 'UNRECOGNIZED'
}

function toSeat(seat: RoomDto['seats'][number]): Seat {
  return {
    seatId: seat.seat_id,
    label: seat.label,
    status: toStatus(seat.status),
    rawStatus: seat.status,
    reason: toReason(seat.reason),
    statusSince: seat.status_since,
    lastObservedAt: seat.last_observed_at,
    hasOutlet: seat.has_outlet,
    isWindow: seat.is_window,
    layout: { ...seat.layout },
  }
}

export function toRoom(dto: RoomDto): Room {
  return {
    roomId: dto.room_id,
    roomName: dto.room_name,
    totalSeats: dto.total_seats,
    availableSeats: dto.available_seats,
    unknownSeats: dto.unknown_seats,
    congestionLevel: toCongestion(dto.congestion_level),
    edgeOnline: dto.edge_online,
    version: dto.version,
    seats: dto.seats.map(toSeat),
  }
}
