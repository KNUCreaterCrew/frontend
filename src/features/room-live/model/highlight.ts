import type { RoomEvent, Seat, SeatStatus } from '@/entities/room'

export const HIGHLIGHT_MS = 5_000
export const MAX_HIGHLIGHTS = 2

export interface Highlight {
  seatId: string
  status: SeatStatus
  version: number
  until: number
}

export type HighlightTarget = { seatId: string; status: SeatStatus; version: number }

// 상태가 실제로 바뀐 좌석만 강조한다. 같은 version 의 EDGE 변경이 있었으면 강조하지 않는다.
export function highlightTargets(
  event: RoomEvent,
  edgeChangedVersions: ReadonlySet<number>,
): HighlightTarget[] {
  if (event.type !== 'SEAT_UPDATED') return []
  if (edgeChangedVersions.has(event.version)) return []
  return event.changes
    .filter((change) => change.prevStatus !== change.status)
    .map((change) => ({ seatId: change.seatId, status: change.status, version: event.version }))
}

export function addHighlights(
  current: readonly Highlight[],
  targets: readonly HighlightTarget[],
  now: number,
): Highlight[] {
  let list = [...current]
  for (const target of targets) {
    list = list.filter((item) => item.seatId !== target.seatId)
    list.push({ ...target, until: now + HIGHLIGHT_MS })
  }
  return list.slice(-MAX_HIGHLIGHTS)
}

// EDGE 이벤트가 SEAT 보다 늦게 왔을 때 그 version 의 강조를 지운다.
export function dropVersion(current: readonly Highlight[], version: number): Highlight[] {
  return current.filter((item) => item.version !== version)
}

export function pruneHighlights(current: readonly Highlight[], now: number): Highlight[] {
  return current.filter((item) => item.until > now)
}

// 강조한 상태와 좌석의 지금 상태가 다르면(강조 없이 다시 바뀐 좌석) 그 강조를 지운다.
export function keepMatching(
  current: readonly Highlight[],
  seats: ReadonlyArray<Pick<Seat, 'seatId' | 'status'>>,
): readonly Highlight[] {
  const statusById = new Map(seats.map((seat) => [seat.seatId, seat.status] as const))
  const next = current.filter((item) => statusById.get(item.seatId) === item.status)
  return next.length === current.length ? current : next
}
