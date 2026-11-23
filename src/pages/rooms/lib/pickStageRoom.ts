import type { RoomListItem } from '@/entities/room'

export type StagePick = { room: RoomListItem; hasEmpty: boolean }

/**
 * 머리 영역에 그릴 방. 확인된 빈자리가 가장 많은 방이고, 같으면 서버 순서가 앞인 방이다.
 * 빈자리 있는 방이 없으면 좌석이 있는 첫 방을 그린다. 좌석 있는 방이 없으면 null.
 */
export function pickStageRoom(items: readonly RoomListItem[]): StagePick | null {
  let best: RoomListItem | null = null
  for (const item of items) {
    if (item.totalSeats === 0) continue
    if (best === null || item.availableSeats > best.availableSeats) best = item
  }
  return best === null ? null : { room: best, hasEmpty: best.availableSeats > 0 }
}
