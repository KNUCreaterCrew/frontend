import type { CongestionLevel, Room, RoomListItem } from './types'

export type RoomSummary =
  | { kind: 'noSeats' }
  | {
      kind: 'allUnknown'
      totalSeats: number
      unknownSeats: number
      latestObservedAt: string | null
    }
  | {
      kind: 'known'
      availableSeats: number
      totalSeats: number
      unknownSeats: number
      congestionLevel: CongestionLevel
    }

function latestObservedAt(room: Room): string | null {
  let latest: string | null = null
  let latestMs = -Infinity
  for (const seat of room.seats) {
    if (seat.lastObservedAt === null) continue
    const ms = Date.parse(seat.lastObservedAt)
    if (ms > latestMs) {
      latestMs = ms
      latest = seat.lastObservedAt
    }
  }
  return latest
}

export function getRoomSummary(room: Room): RoomSummary {
  if (room.totalSeats === 0) return { kind: 'noSeats' }
  if (room.unknownSeats === room.totalSeats) {
    return {
      kind: 'allUnknown',
      totalSeats: room.totalSeats,
      unknownSeats: room.unknownSeats,
      latestObservedAt: latestObservedAt(room),
    }
  }
  return {
    kind: 'known',
    availableSeats: room.availableSeats,
    totalSeats: room.totalSeats,
    unknownSeats: room.unknownSeats,
    congestionLevel: room.congestionLevel,
  }
}

export type RoomListSummary =
  | { kind: 'noSeats' }
  | { kind: 'allUnknown'; totalSeats: number; unknownSeats: number; edgeOnline: boolean }
  | {
      kind: 'known'
      availableSeats: number
      totalSeats: number
      unknownSeats: number
      congestionLevel: CongestionLevel
      edgeOnline: boolean
    }

export function getRoomListSummary(item: RoomListItem): RoomListSummary {
  if (item.totalSeats === 0) return { kind: 'noSeats' }
  if (item.unknownSeats === item.totalSeats) {
    return {
      kind: 'allUnknown',
      totalSeats: item.totalSeats,
      unknownSeats: item.unknownSeats,
      edgeOnline: item.edgeOnline,
    }
  }
  return {
    kind: 'known',
    availableSeats: item.availableSeats,
    totalSeats: item.totalSeats,
    unknownSeats: item.unknownSeats,
    congestionLevel: item.congestionLevel,
    edgeOnline: item.edgeOnline,
  }
}
