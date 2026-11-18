import { HttpResponse, delay, http } from 'msw'
import type { MockHandler } from './handlers/rooms'
import type { RoomDto } from '@/entities/room'
import {
  ROOM_ID,
  allUnknownRoom,
  buildRoom,
  manySeatsRoom,
  mixedRoom,
  noSeatsRoom,
  offlineRoom,
} from './fixtures/rooms'
import { startupRoomDto } from './fixtures/interfacesFlow'
import type { LiveRoom } from './handlers/rooms'
import { liveRoom, quietRoomSocket, rejectingRoomSocket, roomHandler } from './handlers/rooms'

const ROOM_URL = '*/api/v1/rooms/:roomId'

type DemoSeat = RoomDto['seats'][number]
const DEMO_CYCLE = { EMPTY: 'OCCUPIED', OCCUPIED: 'AWAY', AWAY: 'EMPTY' } as const
const DEMO_INTERVAL_MS = 3000
const DEMO_OFFLINE_EVERY = 6

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

const mixed = () => [roomHandler({ [ROOM_ID]: mixedRoom }), quietRoomSocket()]

// 호출할 때마다 새 핸들러를 만든다(연결 수, 로그, 타이머 상태를 시나리오 사이에 공유하지 않는다).
export const scenarios: Record<string, () => MockHandler[]> = {
  default: mixed,
  mixed,
  'all-unknown': () => [roomHandler({ [ROOM_ID]: allUnknownRoom }), quietRoomSocket()],
  offline: () => [roomHandler({ [ROOM_ID]: offlineRoom }), quietRoomSocket()],
  loading: () => [
    http.get(ROOM_URL, async () => {
      await delay('infinite')
      return HttpResponse.json(mixedRoom)
    }),
    quietRoomSocket(),
  ],
  error: () => [
    http.get(ROOM_URL, () =>
      HttpResponse.json({ detail: '일시적인 오류입니다.' }, { status: 500 }),
    ),
    quietRoomSocket(),
  ],
  'not-found': () => [
    http.get(ROOM_URL, () =>
      HttpResponse.json({ detail: '등록되지 않은 방입니다.' }, { status: 404 }),
    ),
    rejectingRoomSocket(),
  ],
  'slow-wake': () => [
    http.get(ROOM_URL, async () => {
      await delay(65_000)
      return HttpResponse.json(mixedRoom)
    }),
    quietRoomSocket(),
  ],
  'live-flow': () => liveRoom(startupRoomDto).handlers,
  'ws-reject': () => liveRoom(mixedRoom, { rejectFirst: true }).handlers,
  'ws-slow-close': () => liveRoom(mixedRoom, { closeAfterOpen: 1013 }).handlers,
  'ws-down': () => liveRoom(mixedRoom, { alwaysReject: true }).handlers,
  'live-demo': () => liveDemoHandlers(mixedRoom),
  'many-seats': () => [roomHandler({ [ROOM_ID]: manySeatsRoom }), quietRoomSocket()],
  'no-seats': () => [roomHandler({ [ROOM_ID]: noSeatsRoom }), quietRoomSocket()],
}

export function resolveScenario(name: string): MockHandler[] {
  const found = Object.hasOwn(scenarios, name) ? scenarios[name] : undefined
  if (!found) {
    const known = Object.keys(scenarios).join(', ')
    throw new Error(`알 수 없는 시나리오: ${name} (알려진 이름: ${known})`)
  }
  return found()
}
