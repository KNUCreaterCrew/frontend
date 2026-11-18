import { deployedRoomJson } from './__fixtures__'
import { roomDtoSchema } from './dto'
import { toRoom } from './mapping'
import { getRoomListSummary, getRoomSummary } from './summary'
import type { RoomListItem } from './types'

function seat(
  id: string,
  x: number,
  y: number,
  status: string,
  reason: string | null = null,
  lastObservedAt: string | null = '2026-11-18T10:00:00+09:00',
) {
  return {
    seat_id: id,
    label: id,
    status,
    reason,
    status_since: '2026-11-18T10:00:00+09:00',
    last_observed_at: lastObservedAt,
    has_outlet: false,
    is_window: false,
    layout: { x, y, width: 64, height: 48 },
  }
}

function room(patch: Record<string, unknown>, seats: ReturnType<typeof seat>[]) {
  return toRoom(
    roomDtoSchema.parse({
      room_id: 'IT4-101',
      room_name: '제1실습실',
      total_seats: seats.length,
      available_seats: 0,
      unknown_seats: 0,
      congestion_level: 'HIGH',
      edge_online: true,
      version: 1,
      ...patch,
      seats,
    }),
  )
}

describe('getRoomSummary', () => {
  it('혼합 상태는 서버 집계 값으로 known 이 된다', () => {
    const r = room({ available_seats: 1, unknown_seats: 1, congestion_level: 'MODERATE' }, [
      seat('A1', 0, 0, 'EMPTY'),
      seat('A2', 80, 0, 'OCCUPIED'),
      seat('B1', 0, 64, 'AWAY'),
      seat('B2', 80, 64, 'UNKNOWN', 'OCCLUDED'),
    ])
    expect(getRoomSummary(r)).toEqual({
      kind: 'known',
      availableSeats: 1,
      totalSeats: 4,
      unknownSeats: 1,
      congestionLevel: 'MODERATE',
    })
  })

  it('배포 응답 원문(전원 확인 불가)은 allUnknown 이다', () => {
    const r = toRoom(roomDtoSchema.parse(deployedRoomJson))
    expect(getRoomSummary(r)).toEqual({
      kind: 'allUnknown',
      totalSeats: 4,
      unknownSeats: 4,
      latestObservedAt: null,
    })
  })

  it('좌석이 0개면 서버가 HIGH 를 줘도 noSeats 다', () => {
    expect(getRoomSummary(room({ congestion_level: 'HIGH' }, []))).toEqual({ kind: 'noSeats' })
  })

  it('확인 불가가 3/4 이고 HIGH 면 known 으로 HIGH 를 그대로 둔다', () => {
    const r = room({ available_seats: 0, unknown_seats: 3, congestion_level: 'HIGH' }, [
      seat('A1', 0, 0, 'OCCUPIED'),
      seat('A2', 80, 0, 'UNKNOWN', 'OCCLUDED'),
      seat('B1', 0, 64, 'UNKNOWN', 'OCCLUDED'),
      seat('B2', 80, 64, 'UNKNOWN', 'OCCLUDED'),
    ])
    const summary = getRoomSummary(r)
    expect(summary.kind).toBe('known')
    expect(summary).toMatchObject({ congestionLevel: 'HIGH', unknownSeats: 3 })
  })

  it('allUnknown 의 latestObservedAt 은 가장 늦은 좌석 관측 시각이다', () => {
    const r = room({ unknown_seats: 3 }, [
      seat('A1', 0, 0, 'UNKNOWN', 'STALE_OBSERVATION', '2026-11-18T09:00:00+09:00'),
      seat('A2', 80, 0, 'UNKNOWN', 'STALE_OBSERVATION', '2026-11-18T09:30:00Z'),
      seat('B1', 0, 64, 'UNKNOWN', 'STALE_OBSERVATION', null),
    ])
    expect(getRoomSummary(r)).toMatchObject({
      kind: 'allUnknown',
      latestObservedAt: '2026-11-18T09:30:00Z',
    })
  })
})

describe('getRoomListSummary', () => {
  const base: RoomListItem = {
    roomId: 'IT4-101',
    roomName: '제1실습실 (예시)',
    totalSeats: 4,
    availableSeats: 1,
    unknownSeats: 1,
    congestionLevel: 'MODERATE',
    edgeOnline: true,
  }

  it('확인된 좌석이 있으면 known 이다', () => {
    expect(getRoomListSummary(base)).toEqual({
      kind: 'known',
      availableSeats: 1,
      totalSeats: 4,
      unknownSeats: 1,
      congestionLevel: 'MODERATE',
      edgeOnline: true,
    })
  })

  it('전부 확인 불가이고 연결이 끊기면 allUnknown 이고 혼잡도 키가 없다', () => {
    const summary = getRoomListSummary({
      ...base,
      availableSeats: 0,
      unknownSeats: 4,
      congestionLevel: 'HIGH',
      edgeOnline: false,
    })
    expect(summary).toEqual({
      kind: 'allUnknown',
      totalSeats: 4,
      unknownSeats: 4,
      edgeOnline: false,
    })
    expect('congestionLevel' in summary).toBe(false)
  })

  it('연결됨이어도 전부 확인 불가이면 allUnknown 이다', () => {
    expect(
      getRoomListSummary({ ...base, totalSeats: 3, availableSeats: 0, unknownSeats: 3 }),
    ).toEqual({ kind: 'allUnknown', totalSeats: 3, unknownSeats: 3, edgeOnline: true })
  })

  it('좌석이 0개이면 noSeats 이다', () => {
    expect(
      getRoomListSummary({ ...base, totalSeats: 0, availableSeats: 0, unknownSeats: 0 }),
    ).toEqual({ kind: 'noSeats' })
  })

  it('연결이 끊겨도 확인된 좌석이 있으면 known 이고 edgeOnline 을 싣는다', () => {
    expect(
      getRoomListSummary({
        ...base,
        availableSeats: 2,
        congestionLevel: 'LOW',
        edgeOnline: false,
      }),
    ).toEqual({
      kind: 'known',
      availableSeats: 2,
      totalSeats: 4,
      unknownSeats: 1,
      congestionLevel: 'LOW',
      edgeOnline: false,
    })
  })
})
