import { deployedRoomJson, interfacesRoomJson } from './__fixtures__'
import { presentHighlights, presentRoom, presentRoomListItem } from './display'
import { roomDtoSchema } from './dto'
import { toRoom } from './mapping'
import type { RoomListItem, SeatStatus } from './types'

describe('presentRoom', () => {
  it('장치가 연결된 방의 UNKNOWN 좌석을 EMPTY 로 바꾸고 빈자리와 혼잡도를 다시 계산한다', () => {
    const base = toRoom(
      roomDtoSchema.parse({
        ...interfacesRoomJson,
        total_seats: 4,
        available_seats: 1,
        unknown_seats: 1,
        congestion_level: 'MODERATE',
        edge_online: true,
        seats: [
          { ...interfacesRoomJson.seats[0]!, seat_id: 'A-01', label: 'A1', status: 'EMPTY' },
          { ...interfacesRoomJson.seats[0]!, seat_id: 'A-02', label: 'A2', status: 'OCCUPIED' },
          { ...interfacesRoomJson.seats[0]!, seat_id: 'B-01', label: 'B1', status: 'AWAY' },
          {
            ...interfacesRoomJson.seats[0]!,
            seat_id: 'B-02',
            label: 'B2',
            status: 'UNKNOWN',
            reason: 'OCCLUDED',
          },
        ],
      }),
    )

    const shown = presentRoom(base)
    expect(shown.availableSeats).toBe(2)
    expect(shown.unknownSeats).toBe(0)
    expect(shown.congestionLevel).toBe('MODERATE')
    expect(shown.seats[3]).toMatchObject({ status: 'EMPTY', rawStatus: 'UNKNOWN', reason: null })
  })

  it('장치가 끊긴 방의 UNKNOWN 좌석은 그대로 둔다', () => {
    const offline = toRoom(roomDtoSchema.parse(deployedRoomJson))
    expect(presentRoom(offline)).toBe(offline)
  })

  it('장치가 연결돼 있어도 모르는 상태(UNRECOGNIZED)는 EMPTY 로 바꾸지 않는다', () => {
    const room = toRoom(
      roomDtoSchema.parse({
        ...interfacesRoomJson,
        edge_online: true,
        seats: [{ ...interfacesRoomJson.seats[0]!, status: 'RESERVED' }],
      }),
    )
    expect(presentRoom(room).seats[0]?.status).toBe('UNRECOGNIZED')
  })
})

describe('presentRoomListItem', () => {
  const item: RoomListItem = {
    roomId: 'IT4-108',
    roomName: 'IT4-108호',
    totalSeats: 6,
    availableSeats: 1,
    unknownSeats: 3,
    congestionLevel: 'HIGH',
    edgeOnline: true,
  }

  it('장치 연결 시 unknownSeats 를 availableSeats 에 합치고 혼잡도를 갱신한다', () => {
    expect(presentRoomListItem(item)).toEqual({
      ...item,
      availableSeats: 4,
      unknownSeats: 0,
      congestionLevel: 'LOW',
    })
  })

  it('장치 끊김 시 원래 집계를 유지한다', () => {
    const offline = { ...item, edgeOnline: false }
    expect(presentRoomListItem(offline)).toBe(offline)
  })
})

describe('presentHighlights', () => {
  it('장치 연결 시 UNKNOWN 강조를 EMPTY 로 바꾼다', () => {
    const map = new Map<string, SeatStatus>([
      ['A-01', 'UNKNOWN'],
      ['A-02', 'OCCUPIED'],
    ])
    expect(presentHighlights(map, true)).toEqual(
      new Map<string, SeatStatus>([
        ['A-01', 'EMPTY'],
        ['A-02', 'OCCUPIED'],
      ]),
    )
    expect(presentHighlights(map, false)).toBe(map)
  })
})
