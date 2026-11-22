import { HttpResponse, delay, http } from 'msw'
import type { MockHandler } from './handlers/rooms'
import type { RoomDto } from '@/entities/room'
import {
  ROOM_ID,
  allUnknownRoom,
  buildRoom,
  manyRooms,
  manySeatsRoom,
  calmRoom,
  mixedRoom,
  noSeatsRoom,
  offlineRoom,
  seatDetailsRoom,
  toListItemDto,
} from './fixtures/rooms'
import { startupRoomDto } from './fixtures/interfacesFlow'
import {
  DAILY_STATS_URL,
  WEEKLY_STATS_URL,
  dailyStatsHandler,
  weeklyStatsHandler,
} from './handlers/stats'
import {
  defaultDailyStats,
  defaultWeeklyStats,
  emptyDailyStats,
  emptyWeeklyStats,
} from './fixtures/stats'
import type { LiveRoom } from './handlers/rooms'
import {
  ROOM_LIST_URL,
  liveRoom,
  quietRoomSocket,
  rejectingRoomSocket,
  roomHandler,
  roomListHandler,
} from './handlers/rooms'

const ROOM_URL = '*/api/v1/rooms/:roomId'

type DemoSeat = RoomDto['seats'][number]
const DEMO_CYCLE = { EMPTY: 'OCCUPIED', OCCUPIED: 'AWAY', AWAY: 'EMPTY' } as const
const DEMO_INTERVAL_MS = 3000
const DEMO_OFFLINE_EVERY = 6

// 알 수 없음은 마지막 유효 판정 30초 뒤에 되므로 status_since 보다 30초 이상 앞선 값으로 맞춘다.
function unknownObservedAt(observed: string | null, since: string): string | null {
  if (observed === null) return null
  const limit = Date.parse(since) - 30_000
  return new Date(Math.min(Date.parse(observed), limit)).toISOString()
}

// 연결이 있는 동안 3초마다 좌석 하나를 순환시키고, 6번째 단계마다 edge 끊김과 복구를 보여 준다.
function liveDemoHandlers(base: RoomDto): MockHandler[] {
  let version = base.version
  let edgeOnline = true
  let seats: DemoSeat[] = base.seats.map((seat) => ({ ...seat }))
  let saved: DemoSeat[] | null = null
  let step = 0
  let timer: ReturnType<typeof setInterval> | undefined

  const snapshot = () => buildRoom(seats, { version, edge_online: edgeOnline })

  function emit(room: LiveRoom, before: DemoSeat[]): void {
    const now = snapshot()
    const changes = seats.flatMap((seat, i) => {
      const prev = before[i]!
      if (prev.status === seat.status && prev.reason === seat.reason) return []
      return [
        {
          seat_id: seat.seat_id,
          prev_status: prev.status,
          curr_status: seat.status,
          reason: seat.reason,
          status_since: seat.status_since,
          last_observed_at: seat.last_observed_at,
        },
      ]
    })
    if (changes.length === 0) return
    room.send({
      event: 'SEAT_UPDATED',
      room_id: now.room_id,
      version,
      available_seats: now.available_seats,
      unknown_seats: now.unknown_seats,
      congestion_level: now.congestion_level,
      changes,
    })
  }

  function tick(room: LiveRoom): void {
    step += 1
    const at = new Date().toISOString()
    const before = seats.map((seat) => ({ ...seat }))
    version += 1
    if (step % DEMO_OFFLINE_EVERY === 0) {
      saved = before
      edgeOnline = false
      seats = seats.map((seat) => ({
        ...seat,
        status: 'UNKNOWN',
        reason: 'EDGE_OFFLINE',
        status_since: at,
        last_observed_at: unknownObservedAt(seat.last_observed_at, at),
      }))
      room.send({
        event: 'EDGE_STATUS_CHANGED',
        room_id: base.room_id,
        version,
        edge_online: false,
      })
    } else if (saved) {
      const restore = saved
      saved = null
      edgeOnline = true
      seats = seats.map((seat, i) => ({ ...restore[i]!, status_since: at }))
      room.send({ event: 'EDGE_STATUS_CHANGED', room_id: base.room_id, version, edge_online: true })
    } else {
      const cyclable = seats.flatMap((seat, i) => (seat.status in DEMO_CYCLE ? [i] : []))
      const index = cyclable[step % Math.max(cyclable.length, 1)]
      const target = index === undefined ? undefined : seats[index]
      if (target && target.status in DEMO_CYCLE) {
        const next = DEMO_CYCLE[target.status as keyof typeof DEMO_CYCLE]
        seats = seats.map((seat, i) =>
          i === index ? { ...seat, status: next, status_since: at, last_observed_at: at } : seat,
        )
      }
    }
    room.setRoom(snapshot())
    emit(room, before)
  }

  const room: LiveRoom = liveRoom(base, {
    onClientsChange: (count) => {
      if (count > 0 && timer === undefined) {
        timer = setInterval(() => tick(room), DEMO_INTERVAL_MS)
      } else if (count === 0 && timer !== undefined) {
        clearInterval(timer)
        timer = undefined
      }
    },
  })
  return room.handlers
}

// 방 하나짜리 시나리오: 상세와 목록이 같은 방을 본다.
const single = (room: RoomDto) => () => [
  roomHandler({ [ROOM_ID]: room }),
  roomListHandler([toListItemDto(room)]),
  quietRoomSocket(),
]

const mixed = single(mixedRoom)

// 호출할 때마다 새 핸들러를 만든다(연결 수, 로그, 타이머 상태를 시나리오 사이에 공유하지 않는다).
export const scenarios: Record<string, () => MockHandler[]> = {
  default: mixed,
  mixed,
  'all-unknown': single(allUnknownRoom),
  offline: single(offlineRoom),
  loading: () => [
    http.get(ROOM_URL, async () => {
      await delay('infinite')
      return HttpResponse.json(mixedRoom)
    }),
    http.get(ROOM_LIST_URL, async () => {
      await delay('infinite')
      return HttpResponse.json([toListItemDto(mixedRoom)])
    }),
    quietRoomSocket(),
  ],
  error: () => [
    http.get(ROOM_URL, () =>
      HttpResponse.json({ detail: '일시적인 오류입니다.' }, { status: 500 }),
    ),
    http.get(ROOM_LIST_URL, () =>
      HttpResponse.json({ detail: '일시적인 오류입니다.' }, { status: 500 }),
    ),
    quietRoomSocket(),
  ],
  'not-found': () => [
    http.get(ROOM_URL, () =>
      HttpResponse.json({ detail: '등록되지 않은 방입니다.' }, { status: 404 }),
    ),
    roomListHandler([]),
    rejectingRoomSocket(),
  ],
  'slow-wake': () => [
    http.get(ROOM_URL, async () => {
      await delay(65_000)
      return HttpResponse.json(mixedRoom)
    }),
    http.get(ROOM_LIST_URL, async () => {
      await delay(65_000)
      return HttpResponse.json([toListItemDto(mixedRoom)])
    }),
    quietRoomSocket(),
  ],
  'live-flow': () => liveRoom(startupRoomDto).handlers,
  'ws-reject': () => liveRoom(mixedRoom, { rejectFirst: true }).handlers,
  'ws-slow-close': () => liveRoom(mixedRoom, { closeAfterOpen: 1013 }).handlers,
  'ws-down': () => liveRoom(mixedRoom, { alwaysReject: true }).handlers,
  'live-demo': () => liveDemoHandlers(mixedRoom),
  'many-seats': single(manySeatsRoom),
  'seat-details': single(seatDetailsRoom),
  'no-seats': single(noSeatsRoom),
  'rooms-many': () => [
    roomHandler(Object.fromEntries(manyRooms.map((room) => [room.room_id, room]))),
    roomListHandler(manyRooms.map(toListItemDto)),
    quietRoomSocket(),
  ],
  'stats-seed': () => [
    ...single(mixedRoom)(),
    dailyStatsHandler(emptyDailyStats),
    weeklyStatsHandler(() => defaultWeeklyStats('SEED', Date.now())),
  ],
  'stats-mixed': () => [
    ...single(calmRoom)(),
    dailyStatsHandler((date) => defaultDailyStats(date, Date.now())),
    weeklyStatsHandler(() => defaultWeeklyStats('MIXED', Date.now())),
  ],
  'stats-empty': () => [
    ...single(mixedRoom)(),
    dailyStatsHandler(emptyDailyStats),
    weeklyStatsHandler(() => emptyWeeklyStats(Date.now())),
  ],
  'stats-error': () => [
    ...single(mixedRoom)(),
    http.get(DAILY_STATS_URL, () =>
      HttpResponse.json({ detail: '일시적인 오류입니다.' }, { status: 500 }),
    ),
    http.get(WEEKLY_STATS_URL, () =>
      HttpResponse.json({ detail: '일시적인 오류입니다.' }, { status: 500 }),
    ),
  ],
  'stats-loading': () => [
    ...single(mixedRoom)(),
    http.get(DAILY_STATS_URL, async () => {
      await delay('infinite')
      return HttpResponse.json({})
    }),
    http.get(WEEKLY_STATS_URL, async () => {
      await delay('infinite')
      return HttpResponse.json({})
    }),
  ],
  'rooms-empty': () => [roomHandler({}), roomListHandler([]), quietRoomSocket()],
  // 첫 목록 요청부터 10초 동안만 정상이고 이후는 500. 개발 서버의 StrictMode 가 시작 때 요청을
  // 두 번 보내도 첫 화면은 정상으로 뜨고, 30초 재조회가 실패하는 화면을 보기 위한 것.
  'rooms-refresh-fail': () => {
    let firstAt: number | undefined
    return [
      roomHandler({ [ROOM_ID]: mixedRoom }),
      http.get(ROOM_LIST_URL, () => {
        const now = Date.now()
        firstAt ??= now
        if (now - firstAt > 10_000) {
          return HttpResponse.json({ detail: '일시적인 오류입니다.' }, { status: 500 })
        }
        return HttpResponse.json([toListItemDto(mixedRoom)])
      }),
      quietRoomSocket(),
    ]
  },
}

export function resolveScenario(name: string): MockHandler[] {
  const found = Object.hasOwn(scenarios, name) ? scenarios[name] : undefined
  if (!found) {
    const known = Object.keys(scenarios).join(', ')
    throw new Error(`알 수 없는 시나리오: ${name} (알려진 이름: ${known})`)
  }
  return found()
}
