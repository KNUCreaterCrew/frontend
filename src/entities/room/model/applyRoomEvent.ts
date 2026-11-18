import type { Room, RoomEvent, Seat } from './types'

interface ApplyResult {
  room: Room
  needsRefetch: boolean
}

// 이벤트를 방 스냅샷에 반영한다. version 은 건드리지 않는다(기준은 방 조회 응답으로만 바뀐다).
export function applyRoomEvent(room: Room, event: RoomEvent): ApplyResult {
  if (event.roomId !== room.roomId) return { room, needsRefetch: false }

  if (event.type === 'EDGE_STATUS_CHANGED') {
    if (event.edgeOnline === room.edgeOnline) return { room, needsRefetch: false }
    return { room: { ...room, edgeOnline: event.edgeOnline }, needsRefetch: false }
  }

  const bySeatId = new Map<string, Seat>()
  for (const change of event.changes) {
    const seat = room.seats.find((candidate) => candidate.seatId === change.seatId)
    if (!seat || seat.rawStatus !== change.prevRawStatus) {
      return { room, needsRefetch: true }
    }
    bySeatId.set(seat.seatId, {
      ...seat,
      status: change.status,
      rawStatus: change.rawStatus,
      reason: change.reason,
      statusSince: change.statusSince,
      lastObservedAt: change.lastObservedAt,
    })
  }

  return {
    room: {
      ...room,
      availableSeats: event.availableSeats,
      unknownSeats: event.unknownSeats,
      congestionLevel: event.congestionLevel,
      seats: room.seats.map((seat) => bySeatId.get(seat.seatId) ?? seat),
    },
    needsRefetch: false,
  }
}
