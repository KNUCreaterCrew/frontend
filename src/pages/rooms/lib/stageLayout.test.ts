import { toRoom } from '@/entities/room'
import { mixedRoom } from '@mocks/fixtures/rooms'
import { toStageLayout } from './stageLayout'

describe('toStageLayout', () => {
  test('경계의 왼쪽 위를 원점으로 옮기고 상태를 네 가지 면으로 바꾼다', () => {
    const room = toRoom(mixedRoom)
    const shifted = {
      ...room,
      seats: room.seats.map((s) => ({ ...s, layout: { ...s.layout, x: s.layout.x + 100 } })),
    }
    const layout = toStageLayout(shifted)
    expect(layout).toMatchObject({ roomId: 'IT4-101', width: 144, height: 112 })
    expect(layout?.seats.map((s) => [s.seatId, s.tone, s.x, s.y])).toEqual([
      ['A-01', 'empty', 0, 0],
      ['A-02', 'occupied', 80, 0],
      ['B-01', 'away', 0, 64],
      ['B-02', 'unknown', 80, 64],
    ])
  })

  test('모르는 상태는 빛나지 않는 확인 불가 면', () => {
    const room = toRoom(mixedRoom)
    const first = room.seats[0]
    if (!first) throw new Error('좌석 없음')
    const layout = toStageLayout({ ...room, seats: [{ ...first, status: 'UNRECOGNIZED' }] })
    expect(layout?.seats[0]?.tone).toBe('unknown')
  })

  test('좌석이 없으면 null', () => {
    expect(toStageLayout({ ...toRoom(mixedRoom), seats: [] })).toBeNull()
  })
})
