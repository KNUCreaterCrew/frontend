// 테스트용 원문 응답. mocks/ 의 시나리오와는 별개로 둔다.

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
