// INTERFACES 예시 흐름(IT4-101, A-01). 값은 entities 테스트 입력과 같지만 따로 둔다.
import type { RoomDto, RoomEventDto } from '@/entities/room'

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
