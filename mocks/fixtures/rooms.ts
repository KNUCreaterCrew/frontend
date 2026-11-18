import type { RoomDto, RoomSummaryDto } from '@/entities/room'

export const ROOM_ID = 'IT4-101'
const ROOM_NAME = '제1실습실 (예시)'

type SeatDto = RoomDto['seats'][number]
type Status = SeatDto['status']
type Reason = SeatDto['reason']

const OBSERVED_AT = '2026-11-18T05:02:36Z'
const SINCE = '2026-11-18T05:00:00Z'
// 알 수 없음은 유효한 판정 없이 30초가 지나야 되므로 마지막 확인은 SINCE 보다 30초 이상 앞선다(04:58:00 ~ 04:59:30).
const UNKNOWN_OBSERVED_FROM = Date.parse('2026-11-18T04:58:00Z')
const KNOWN_STATUSES: string[] = ['OCCUPIED', 'AWAY', 'EMPTY']

function defaultObservedAt(i: SeatInit): string {
  if (KNOWN_STATUSES.includes(i.status)) return OBSERVED_AT
  const offsetSeconds = (i.row.charCodeAt(0) * 7 + i.n * 13) % 91
  return new Date(UNKNOWN_OBSERVED_FROM + offsetSeconds * 1000).toISOString()
}

export function buildRoom(seats: SeatDto[], overrides: Partial<RoomDto> = {}): RoomDto {
  const total = seats.length
  const available = seats.filter((s) => s.status === 'EMPTY').length
  const unknown = seats.filter((s) => s.status === 'UNKNOWN').length
  const ratio = total === 0 ? 0 : available / total
  const congestion = ratio >= 0.6 ? 'LOW' : ratio >= 0.25 ? 'MODERATE' : 'HIGH'
  return {
    room_id: ROOM_ID,
    room_name: ROOM_NAME,
    total_seats: total,
    available_seats: available,
    unknown_seats: unknown,
    congestion_level: congestion,
    edge_online: true,
    version: 1,
    seats,
    ...overrides,
  }
}

type SeatInit = {
  row: string
  n: number
  x: number
  y: number
  status: Status
  reason?: Reason
  outlet?: boolean
  window?: boolean
  observedAt?: string | null
  since?: string
}

function seat(i: SeatInit): SeatDto {
  return {
    seat_id: `${i.row}-${String(i.n).padStart(2, '0')}`,
    label: `${i.row}${i.n}`,
    status: i.status,
    reason: i.reason ?? null,
    status_since: i.since ?? SINCE,
    last_observed_at: i.observedAt === undefined ? defaultObservedAt(i) : i.observedAt,
    has_outlet: i.outlet ?? false,
    is_window: i.window ?? false,
    layout: { x: i.x, y: i.y, width: 64, height: 48 },
  }
}

export const mixedRoom: RoomDto = buildRoom(
  [
    seat({ row: 'A', n: 1, x: 0, y: 0, status: 'EMPTY', outlet: true, window: true }),
    seat({ row: 'A', n: 2, x: 80, y: 0, status: 'OCCUPIED', window: true }),
    seat({ row: 'B', n: 1, x: 0, y: 64, status: 'AWAY', outlet: true }),
    seat({ row: 'B', n: 2, x: 80, y: 64, status: 'UNKNOWN', reason: 'OCCLUDED' }),
  ],
  { version: 12 },
)

export const allUnknownRoom: RoomDto = buildRoom(
  [
    seat({ row: 'A', n: 1, x: 0, y: 0, status: 'UNKNOWN', reason: 'OCCLUDED', outlet: true }),
    seat({ row: 'A', n: 2, x: 80, y: 0, status: 'UNKNOWN', reason: 'STALE_OBSERVATION' }),
    seat({ row: 'B', n: 1, x: 0, y: 64, status: 'UNKNOWN', reason: 'OCCLUDED', outlet: true }),
    seat({ row: 'B', n: 2, x: 80, y: 64, status: 'UNKNOWN', reason: 'STALE_OBSERVATION' }),
  ],
  { version: 12 },
)

export const offlineRoom: RoomDto = buildRoom(
  [
    seat({ row: 'A', n: 1, x: 0, y: 0, status: 'UNKNOWN', reason: 'EDGE_OFFLINE', outlet: true }),
    seat({ row: 'A', n: 2, x: 80, y: 0, status: 'UNKNOWN', reason: 'EDGE_OFFLINE' }),
    seat({ row: 'B', n: 1, x: 0, y: 64, status: 'UNKNOWN', reason: 'EDGE_OFFLINE', outlet: true }),
    seat({ row: 'B', n: 2, x: 80, y: 64, status: 'UNKNOWN', reason: 'EDGE_OFFLINE' }),
  ],
  { edge_online: false, version: 12 },
)

const DEPLOYED_SINCE = '2026-11-18T08:22:33.079046Z'

function deployedSeat(
  row: string,
  n: number,
  x: number,
  y: number,
  outlet: boolean,
  window: boolean,
) {
  return seat({
    row,
    n,
    x,
    y,
    status: 'UNKNOWN',
    reason: 'EDGE_OFFLINE',
    outlet,
    window,
    observedAt: null,
    since: DEPLOYED_SINCE,
  })
}

export const deployedOfflineRoom: RoomDto = buildRoom(
  [
    deployedSeat('A', 1, 0, 0, true, true),
    deployedSeat('A', 2, 80, 0, false, false),
    deployedSeat('B', 1, 0, 64, true, false),
    deployedSeat('B', 2, 80, 64, false, false),
  ],
  { edge_online: false, version: 0 },
)

const MANY_STATUSES: [Status, Reason?][] = [
  ['EMPTY'],
  ['OCCUPIED'],
  ['EMPTY'],
  ['AWAY'],
  ['OCCUPIED'],
  ['UNKNOWN', 'OCCLUDED'],
  ['OCCUPIED'],
  ['EMPTY'],
]

export const manySeatsRoom: RoomDto = buildRoom(
  ['A', 'B', 'C', 'D', 'E'].flatMap((row, r) =>
    Array.from({ length: 8 }, (_, c) => {
      const [status, reason] = MANY_STATUSES[(c + r * 3) % MANY_STATUSES.length]!
      return seat({
        row,
        n: c + 1,
        x: c * 80,
        y: r * 64,
        status,
        reason,
        outlet: (c + r) % 2 === 0,
        window: c === 0 || c === 7,
      })
    }),
  ),
  { version: 12 },
)

const DETAIL_REASONS = [
  'OCCLUDED',
  'LOW_CONFIDENCE',
  'MODEL_CONFLICT',
  'VLM_TIMEOUT',
  'STALE_OBSERVATION',
  'EDGE_OFFLINE',
]

// 좌석 상세 시트의 경우마다 좌석 하나씩. status 와 reason 은 DTO 에서 문자열이라 모르는 값도 그대로 쓴다.
export const seatDetailsRoom: RoomDto = buildRoom(
  [
    ...DETAIL_REASONS.map((reason, i) =>
      seat({ row: 'A', n: i + 1, x: i * 80, y: 0, status: 'UNKNOWN', reason, window: i === 0 }),
    ),
    seat({ row: 'B', n: 1, x: 0, y: 64, status: 'UNKNOWN', reason: null, observedAt: null }),
    seat({ row: 'B', n: 2, x: 80, y: 64, status: 'UNKNOWN', reason: 'SOMETHING_NEW' }),
    seat({ row: 'B', n: 3, x: 160, y: 64, status: 'SOMETHING_NEW', reason: 'OCCLUDED' }),
    seat({ row: 'B', n: 4, x: 240, y: 64, status: 'EMPTY', outlet: true }),
    seat({ row: 'B', n: 5, x: 320, y: 64, status: 'OCCUPIED', window: true }),
    seat({ row: 'B', n: 6, x: 400, y: 64, status: 'AWAY', outlet: true }),
  ],
  { version: 12 },
)

export const noSeatsRoom: RoomDto = buildRoom([], { version: 12 })

export function toListItemDto(room: RoomDto): RoomSummaryDto {
  return {
    room_id: room.room_id,
    room_name: room.room_name,
    total_seats: room.total_seats,
    available_seats: room.available_seats,
    unknown_seats: room.unknown_seats,
    congestion_level: room.congestion_level,
    edge_online: room.edge_online,
  }
}

function seatsOf(statuses: Array<[Status, Reason?]>): SeatDto[] {
  return statuses.map(([status, reason], i) =>
    seat({ row: 'A', n: i + 1, x: i * 80, y: 0, status, reason }),
  )
}

const LONG_WORD = '가나다라마바사아자차카타파하'.repeat(3)

// 방 목록 시나리오(rooms-many)용 방 여섯 개. 방마다 room_id 가 다르다.
export const manyRooms: RoomDto[] = [
  // 확인된 여유(LOW)
  buildRoom(seatsOf([['EMPTY'], ['EMPTY'], ['EMPTY'], ['OCCUPIED'], ['AWAY']]), {
    room_id: ROOM_ID,
    room_name: ROOM_NAME,
    version: 12,
  }),
  // 혼잡(HIGH): 확인된 빈자리 0석에 확인 불가 2석이 섞인 경우
  buildRoom(
    seatsOf([
      ['OCCUPIED'],
      ['OCCUPIED'],
      ['AWAY'],
      ['OCCUPIED'],
      ['UNKNOWN', 'OCCLUDED'],
      ['UNKNOWN', 'LOW_CONFIDENCE'],
    ]),
    { room_id: 'IT4-102', room_name: '제2실습실', version: 12 },
  ),
  // 장치는 연결됨, 전부 확인 불가
  buildRoom(
    seatsOf([
      ['UNKNOWN', 'OCCLUDED'],
      ['UNKNOWN', 'STALE_OBSERVATION'],
      ['UNKNOWN', 'OCCLUDED'],
      ['UNKNOWN', 'LOW_CONFIDENCE'],
    ]),
    { room_id: 'IT4-103', room_name: '제3실습실', version: 12 },
  ),
  // 장치 끊김
  buildRoom(
    seatsOf([
      ['UNKNOWN', 'EDGE_OFFLINE'],
      ['UNKNOWN', 'EDGE_OFFLINE'],
      ['UNKNOWN', 'EDGE_OFFLINE'],
    ]),
    { room_id: 'IT4-104', room_name: '제4실습실', edge_online: false, version: 12 },
  ),
  // 좌석 0
  buildRoom([], { room_id: 'IT4-105', room_name: '제5실습실 (좌석 준비 중)', version: 12 }),
  // 아주 긴 이름(공백 없는 긴 단어 포함)
  buildRoom(seatsOf([['EMPTY'], ['OCCUPIED'], ['OCCUPIED'], ['AWAY']]), {
    room_id: 'IT4-106',
    room_name: `${LONG_WORD} 대형 실습실`,
    version: 12,
  }),
]
