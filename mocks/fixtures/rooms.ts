import type { RoomDto } from '@/entities/room'

export const ROOM_ID = 'IT4-101'
const ROOM_NAME = '제1실습실 (예시)'

type SeatDto = RoomDto['seats'][number]
type Status = SeatDto['status']
type Reason = SeatDto['reason']

const OBSERVED_AT = '2026-11-18T05:02:36Z'
const SINCE = '2026-11-18T05:00:00Z'

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
    last_observed_at: i.observedAt === undefined ? OBSERVED_AT : i.observedAt,
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
    seat({ row: 'B', n: 1, x: 0, y: 64, status: 'UNKNOWN', reason: null }),
    seat({ row: 'B', n: 2, x: 80, y: 64, status: 'UNKNOWN', reason: 'SOMETHING_NEW' }),
    seat({ row: 'B', n: 3, x: 160, y: 64, status: 'SOMETHING_NEW', reason: 'OCCLUDED' }),
    seat({ row: 'B', n: 4, x: 240, y: 64, status: 'EMPTY', observedAt: null, outlet: true }),
    seat({ row: 'B', n: 5, x: 320, y: 64, status: 'OCCUPIED', window: true }),
    seat({ row: 'B', n: 6, x: 400, y: 64, status: 'AWAY', outlet: true }),
  ],
  { version: 12 },
)

export const noSeatsRoom: RoomDto = buildRoom([], { version: 12 })
