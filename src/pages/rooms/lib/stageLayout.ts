import type { Room, SeatStatus } from '@/entities/room'

export type StageTone = 'empty' | 'away' | 'occupied' | 'unknown'

export interface StageSeat {
  seatId: string
  tone: StageTone
  /** 좌석도 경계의 왼쪽 위를 원점으로 한 layout 단위 */
  x: number
  y: number
  width: number
  height: number
}

export interface StageLayout {
  roomId: string
  /** 좌석도 경계의 크기(layout 단위) */
  width: number
  height: number
  seats: StageSeat[]
}

// 모르는 상태는 확인 불가와 같은 점선으로 그린다. 빈자리로 빛나지 않는다
const TONE: Record<SeatStatus, StageTone> = {
  EMPTY: 'empty',
  AWAY: 'away',
  OCCUPIED: 'occupied',
  UNKNOWN: 'unknown',
  UNRECOGNIZED: 'unknown',
}

/** 방 조회 응답을 머리 영역 무대의 배치로 바꾼다. 경계는 INTERFACES.md 의 규칙대로 좌석에서 잡는다 */
export function toStageLayout(room: Room): StageLayout | null {
  if (room.seats.length === 0) return null
  let minX = Infinity
  let minY = Infinity
  let maxX = -Infinity
  let maxY = -Infinity
  for (const { layout } of room.seats) {
    minX = Math.min(minX, layout.x)
    minY = Math.min(minY, layout.y)
    maxX = Math.max(maxX, layout.x + layout.width)
    maxY = Math.max(maxY, layout.y + layout.height)
  }
  return {
    roomId: room.roomId,
    width: Math.max(maxX - minX, 1),
    height: Math.max(maxY - minY, 1),
    seats: room.seats.map((seat) => ({
      seatId: seat.seatId,
      tone: TONE[seat.status],
      x: seat.layout.x - minX,
      y: seat.layout.y - minY,
      width: seat.layout.width,
      height: seat.layout.height,
    })),
  }
}
