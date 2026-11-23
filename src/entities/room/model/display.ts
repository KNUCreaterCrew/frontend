import type { CongestionLevel, Room, RoomListItem, Seat, SeatStatus } from './types'

function congestionFromCounts(availableSeats: number, totalSeats: number): CongestionLevel {
  const ratio = totalSeats === 0 ? 0 : availableSeats / totalSeats
  if (ratio >= 0.6) return 'LOW'
  if (ratio >= 0.25) return 'MODERATE'
  return 'HIGH'
}

function presentSeat(seat: Seat): Seat {
  if (seat.status !== 'UNKNOWN') return seat
  return { ...seat, status: 'EMPTY', reason: null }
}

/**
 * 장치가 연결된 방(edgeOnline === true)에서는 확인 불가(UNKNOWN) 좌석을 화면상 빈자리(EMPTY)로 표시한다.
 * 장치가 끊긴 방(edgeOnline === false)은 확인 불가 상태를 그대로 유지한다.
 */
export function presentRoom(room: Room): Room {
  if (!room.edgeOnline) return room
  const hasUnknownSeat = room.seats.some((seat) => seat.status === 'UNKNOWN')
  if (room.unknownSeats === 0 && !hasUnknownSeat) return room
  const availableSeats = room.availableSeats + room.unknownSeats
  const congestionLevel =
    room.congestionLevel === 'UNRECOGNIZED'
      ? 'UNRECOGNIZED'
      : congestionFromCounts(availableSeats, room.totalSeats)
  return {
    ...room,
    availableSeats,
    unknownSeats: 0,
    congestionLevel,
    seats: hasUnknownSeat ? room.seats.map(presentSeat) : room.seats,
  }
}

export function presentRoomListItem(item: RoomListItem): RoomListItem {
  if (!item.edgeOnline || item.unknownSeats === 0) return item
  const availableSeats = item.availableSeats + item.unknownSeats
  const congestionLevel =
    item.congestionLevel === 'UNRECOGNIZED'
      ? 'UNRECOGNIZED'
      : congestionFromCounts(availableSeats, item.totalSeats)
  return {
    ...item,
    availableSeats,
    unknownSeats: 0,
    congestionLevel,
  }
}

export function presentHighlights(
  highlights: ReadonlyMap<string, SeatStatus>,
  edgeOnline: boolean,
): ReadonlyMap<string, SeatStatus> {
  if (!edgeOnline || highlights.size === 0) return highlights
  let changed = false
  for (const status of highlights.values()) {
    if (status === 'UNKNOWN') {
      changed = true
      break
    }
  }
  if (!changed) return highlights
  const mapped = new Map<string, SeatStatus>()
  for (const [seatId, status] of highlights) {
    mapped.set(seatId, status === 'UNKNOWN' ? 'EMPTY' : status)
  }
  return mapped
}
