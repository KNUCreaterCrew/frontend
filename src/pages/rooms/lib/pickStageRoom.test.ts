import type { RoomListItem } from '@/entities/room'
import { pickStageRoom } from './pickStageRoom'

function room(roomId: string, availableSeats: number, totalSeats = 10): RoomListItem {
  return {
    roomId,
    roomName: roomId,
    totalSeats,
    availableSeats,
    unknownSeats: 0,
    congestionLevel: 'LOW',
    edgeOnline: true,
  }
}

describe('pickStageRoom', () => {
  test('빈자리가 가장 많은 방을 고른다', () => {
    expect(pickStageRoom([room('a', 1), room('b', 5), room('c', 3)])).toEqual({
      room: room('b', 5),
      hasEmpty: true,
    })
  })

  test('빈자리 수가 같으면 서버 순서가 앞인 방', () => {
    expect(pickStageRoom([room('a', 2), room('b', 2)])?.room.roomId).toBe('a')
  })

  test('빈자리 있는 방이 없으면 좌석이 있는 첫 방, hasEmpty 는 false', () => {
    expect(pickStageRoom([room('none', 0, 0), room('a', 0), room('b', 0)])).toEqual({
      room: room('a', 0),
      hasEmpty: false,
    })
  })

  test('좌석 있는 방이 없거나 목록이 비면 null', () => {
    expect(pickStageRoom([room('none', 0, 0)])).toBeNull()
    expect(pickStageRoom([])).toBeNull()
  })
})
