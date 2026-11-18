// 테스트용 원문 응답. mocks/ 의 시나리오와는 별개로 둔다.
import type { RoomDto } from './dto'
import type { RoomEventDto } from './events'

const deployedSeats: [string, string, number, number, boolean, boolean][] = [
  ['A-01', 'A1', 0, 0, true, true],
  ['A-02', 'A2', 80, 0, false, false],
  ['B-01', 'B1', 0, 64, true, true],
  ['B-02', 'B2', 80, 64, false, false],
]

// 배포 서버의 응답 원문(IT4-101, 서버가 막 시작해 전 좌석 확인 불가)
export const deployedRoomJson = {
  room_id: 'IT4-101',
  room_name: '제1실습실 (예시)',
  total_seats: 4,
  available_seats: 0,
  unknown_seats: 4,
  congestion_level: 'HIGH',
  edge_online: false,
  version: 0,
  seats: deployedSeats.map(([seatId, label, x, y, hasOutlet, isWindow]) => ({
    seat_id: seatId,
    label,
    status: 'UNKNOWN',
    reason: 'EDGE_OFFLINE',
    status_since: '2026-11-18T08:22:33.079046Z',
    last_observed_at: null,
    has_outlet: hasOutlet,
    is_window: isWindow,
    layout: { x, y, width: 64, height: 48 },
  })),
}

// INTERFACES 2절 예시
export const interfacesRoomJson = {
  room_id: 'IT4-101',
  room_name: '제1실습실',
  total_seats: 1,
  available_seats: 0,
  unknown_seats: 0,
  congestion_level: 'HIGH',
  edge_online: true,
  version: 1,
  seats: [
    {
      seat_id: 'A-01',
      label: 'A1',
      status: 'OCCUPIED',
      reason: null,
      status_since: '2026-11-24T10:15:29+09:00',
      last_observed_at: '2026-11-24T10:15:29+09:00',
      has_outlet: true,
      is_window: true,
      layout: { x: 120, y: 80, width: 64, height: 48 },
    },
  ],
}

// INTERFACES 1석 흐름(IT4-101, A-01)

function seatDto(patch: Partial<RoomDto['seats'][number]>): RoomDto['seats'][number] {
  return {
    seat_id: 'A-01',
    label: 'A1',
    status: 'UNKNOWN',
    reason: 'EDGE_OFFLINE',
    status_since: '2026-11-24T01:10:00Z',
    last_observed_at: null,
    has_outlet: true,
    is_window: true,
    layout: { x: 120, y: 80, width: 64, height: 48 },
    ...patch,
  }
}

// 서버가 막 시작한 상태. status_since 는 임의의 서버 시작 시각이다.
export const startupRoomDto: RoomDto = {
  room_id: 'IT4-101',
  room_name: '제1실습실 (예시)',
  total_seats: 1,
  available_seats: 0,
  unknown_seats: 1,
  congestion_level: 'HIGH',
  edge_online: false,
  version: 0,
  seats: [seatDto({})],
}

// 10:15:40 방 조회 응답
export const v1RoomDto: RoomDto = {
  room_id: 'IT4-101',
  room_name: '제1실습실 (예시)',
  total_seats: 1,
  available_seats: 0,
  unknown_seats: 0,
  congestion_level: 'HIGH',
  edge_online: true,
  version: 1,
  seats: [
    seatDto({
      status: 'OCCUPIED',
      reason: null,
      status_since: '2026-11-24T10:15:29+09:00',
      last_observed_at: '2026-11-24T10:15:29+09:00',
    }),
  ],
}

type SeatEventDto = Extract<RoomEventDto, { event: 'SEAT_UPDATED' }>

function eventPair(
  version: number,
  edgeOnline: boolean,
  seatEvent: Omit<SeatEventDto, 'event' | 'room_id' | 'version'>,
): [RoomEventDto, SeatEventDto] {
  return [
    { event: 'EDGE_STATUS_CHANGED', room_id: 'IT4-101', version, edge_online: edgeOnline },
    { event: 'SEAT_UPDATED', room_id: 'IT4-101', version, ...seatEvent },
  ]
}

// 10:15:29 에 A-01 이 확인되고 edge 가 연결됨
export const v1Events = eventPair(1, true, {
  available_seats: 0,
  unknown_seats: 0,
  congestion_level: 'HIGH',
  changes: [
    {
      seat_id: 'A-01',
      prev_status: 'UNKNOWN',
      curr_status: 'OCCUPIED',
      reason: null,
      status_since: '2026-11-24T10:15:29+09:00',
      last_observed_at: '2026-11-24T10:15:29+09:00',
    },
  ],
})

// INTERFACES 3절: 10:16:11 edge 끊김
export const v2Events = eventPair(2, false, {
  available_seats: 0,
  unknown_seats: 1,
  congestion_level: 'HIGH',
  changes: [
    {
      seat_id: 'A-01',
      prev_status: 'OCCUPIED',
      curr_status: 'UNKNOWN',
      reason: 'EDGE_OFFLINE',
      status_since: '2026-11-24T10:16:11+09:00',
      last_observed_at: '2026-11-24T10:15:29+09:00',
    },
  ],
})

// 10:17:04 edge 복구
export const v3Events = eventPair(3, true, {
  available_seats: 0,
  unknown_seats: 0,
  congestion_level: 'HIGH',
  changes: [
    {
      seat_id: 'A-01',
      prev_status: 'UNKNOWN',
      curr_status: 'OCCUPIED',
      reason: null,
      status_since: '2026-11-24T10:17:04+09:00',
      last_observed_at: '2026-11-24T10:17:04+09:00',
    },
  ],
})
