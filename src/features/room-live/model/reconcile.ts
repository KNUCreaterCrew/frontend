import { applyRoomEvent } from '@/entities/room'
import type { Room, RoomEvent } from '@/entities/room'

interface Entry {
  position: number
  event: RoomEvent
}

// 방 조회가 진행되는 동안 받은 이벤트를 모아 두는 기록.
// 활성 표시가 하나라도 있을 때만 쌓고, 모두 해제되면 비운다.
export class EventLog {
  private entries: Entry[] = []
  private marks: number[] = []
  private next = 0

  push(event: RoomEvent): void {
    const position = this.next++
    if (this.marks.length === 0) return
    this.entries.push({ position, event })
  }

  // 조회를 시작하는 위치. 활성 표시로 등록한다.
  mark(): number {
    const position = this.next
    this.marks.push(position)
    return position
  }

  // 그 위치 뒤에 받은 이벤트(받은 순서)
  since(mark: number): RoomEvent[] {
    return this.entries.filter((entry) => entry.position >= mark).map((entry) => entry.event)
  }

  release(mark: number): void {
    const index = this.marks.indexOf(mark)
    if (index >= 0) this.marks.splice(index, 1)
    if (this.marks.length === 0) {
      this.entries = []
      return
    }
    const oldest = Math.min(...this.marks)
    this.entries = this.entries.filter((entry) => entry.position >= oldest)
  }

  size(): number {
    return this.entries.length
  }
}

export function isNewer(base: Room, event: RoomEvent): boolean {
  return event.version > base.version
}

// 조회 응답 위에 기준보다 큰 이벤트를 받은 순서대로 다시 얹는다.
// 다시 조회가 필요한 이벤트는 건너뛴다(30초 재조회가 맞춘다).
export function rebase(snapshot: Room, events: readonly RoomEvent[]): Room {
  let room = snapshot
  for (const event of events) {
    if (!isNewer(snapshot, event)) continue
    const result = applyRoomEvent(room, event)
    if (result.needsRefetch) continue
    room = result.room
  }
  return room
}
