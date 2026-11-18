import { deployedRoomJson, interfacesRoomJson } from './__fixtures__'
import { roomDtoSchema } from './dto'
import { toRoom, toRoomListItem } from './mapping'

function withSeat(patch: Record<string, unknown>, room: Record<string, unknown> = {}) {
  const [first, ...rest] = interfacesRoomJson.seats
  return roomDtoSchema.parse({
    ...interfacesRoomJson,
    ...room,
    seats: [{ ...first!, ...patch }, ...rest],
  })
}

describe('toRoom', () => {
  it('필드 이름을 camelCase 로 바꾸고 정상 값은 그대로 둔다', () => {
    const room = toRoom(roomDtoSchema.parse(interfacesRoomJson))
    expect(room).toEqual({
      roomId: 'IT4-101',
      roomName: '제1실습실',
      totalSeats: 1,
      availableSeats: 0,
      unknownSeats: 0,
      congestionLevel: 'HIGH',
      edgeOnline: true,
      version: 1,
      seats: [
        {
          seatId: 'A-01',
          label: 'A1',
          status: 'OCCUPIED',
          rawStatus: 'OCCUPIED',
          reason: null,
          statusSince: '2026-11-24T10:15:29+09:00',
          lastObservedAt: '2026-11-24T10:15:29+09:00',
          hasOutlet: true,
          isWindow: true,
          layout: { x: 120, y: 80, width: 64, height: 48 },
        },
      ],
    })
  })

  it('배포 응답의 알려진 reason 과 null 관측 시각을 보존한다', () => {
    const seat = toRoom(roomDtoSchema.parse(deployedRoomJson)).seats[0]!
    expect(seat.status).toBe('UNKNOWN')
    expect(seat.reason).toBe('EDGE_OFFLINE')
    expect(seat.lastObservedAt).toBeNull()
  })

  it('모르는 status 는 UNRECOGNIZED 로 두고 원문을 rawStatus 에 남긴다', () => {
    const seat = toRoom(withSeat({ status: 'RESERVED' })).seats[0]!
    expect(seat.status).toBe('UNRECOGNIZED')
    expect(seat.rawStatus).toBe('RESERVED')
  })

  it('모르는 reason 은 UNRECOGNIZED 로 바꾼다', () => {
    const seat = toRoom(withSeat({ status: 'UNKNOWN', reason: 'SUN_GLARE' })).seats[0]!
    expect(seat.reason).toBe('UNRECOGNIZED')
  })

  it('모르는 congestion_level 은 UNRECOGNIZED 로 바꾼다', () => {
    const room = toRoom(withSeat({}, { congestion_level: 'FULL' }))
    expect(room.congestionLevel).toBe('UNRECOGNIZED')
  })
})

describe('toRoomListItem', () => {
  const dto = {
    room_id: 'IT4-101',
    room_name: '제1실습실 (예시)',
    total_seats: 4,
    available_seats: 1,
    unknown_seats: 1,
    congestion_level: 'MODERATE',
    edge_online: true,
  }

  it('필드 이름을 camelCase 로 옮긴다', () => {
    expect(toRoomListItem(dto)).toEqual({
      roomId: 'IT4-101',
      roomName: '제1실습실 (예시)',
      totalSeats: 4,
      availableSeats: 1,
      unknownSeats: 1,
      congestionLevel: 'MODERATE',
      edgeOnline: true,
    })
  })

  it('모르는 혼잡도는 UNRECOGNIZED 로 바꾼다', () => {
    expect(toRoomListItem({ ...dto, congestion_level: 'SOMETHING' }).congestionLevel).toBe(
      'UNRECOGNIZED',
    )
  })
})
