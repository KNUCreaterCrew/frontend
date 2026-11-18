import { HttpHandler } from 'msw'
import {
  applyRoomEvent,
  parseRoomEvent,
  roomDtoSchema,
  roomListDtoSchema,
  toRoom,
} from '@/entities/room'
import type { Room } from '@/entities/room'
import { server } from './node'
import {
  ROOM_ID,
  allUnknownRoom,
  buildRoom,
  deployedOfflineRoom,
  manySeatsRoom,
  mixedRoom,
  noSeatsRoom,
  offlineRoom,
} from './fixtures/rooms'
import { ROOM_LIST_URL } from './handlers/rooms'
import { resolveScenario } from './scenarios'

test('default 시나리오는 핸들러 배열이다', () => {
  expect(Array.isArray(resolveScenario('default'))).toBe(true)
})
test('모르는 시나리오는 알려진 이름을 담아 실패한다', () => {
  expect(() => resolveScenario('nope')).toThrow(/default/)
})
test('상속 속성 이름은 알 수 없는 시나리오로 취급한다', () => {
  expect(() => resolveScenario('constructor')).toThrow(/default/)
})

const SCENARIO_NAMES = [
  'default',
  'mixed',
  'all-unknown',
  'offline',
  'loading',
  'error',
  'not-found',
  'slow-wake',
  'many-seats',
  'no-seats',
  'live-flow',
  'ws-reject',
  'ws-slow-close',
  'ws-down',
  'live-demo',
  'seat-details',
  'rooms-many',
  'rooms-empty',
  'rooms-refresh-fail',
]

test.each(SCENARIO_NAMES)('시나리오 %s 는 ws 핸들러를 하나 이상 가진다', (name) => {
  expect(resolveScenario(name).some((h) => h.constructor.name === 'WebSocketHandler')).toBe(true)
})

test.each(SCENARIO_NAMES)('시나리오 %s 가 풀린다', (name) => {
  expect(resolveScenario(name).length).toBeGreaterThan(0)
})

const fixtureList = {
  mixedRoom,
  allUnknownRoom,
  offlineRoom,
  deployedOfflineRoom,
  manySeatsRoom,
  noSeatsRoom,
}

describe.each(Object.entries(fixtureList))('fixture %s', (_name, room) => {
  test('roomDtoSchema 를 통과한다', () => {
    expect(roomDtoSchema.safeParse(room).success).toBe(true)
    expect(room.room_id).toBe(ROOM_ID)
  })
  test('집계가 좌석 상태 수와 같다', () => {
    expect(room.total_seats).toBe(room.seats.length)
    expect(room.available_seats).toBe(room.seats.filter((s) => s.status === 'EMPTY').length)
    expect(room.unknown_seats).toBe(room.seats.filter((s) => s.status === 'UNKNOWN').length)
  })
})

test('manySeatsRoom 은 40석이다', () => {
  expect(manySeatsRoom.seats.length).toBe(40)
})

test('mixedRoom 은 1/4/1 이고 보통이다', () => {
  expect([mixedRoom.available_seats, mixedRoom.total_seats, mixedRoom.unknown_seats]).toEqual([
    1, 4, 1,
  ])
  expect(mixedRoom.congestion_level).toBe('MODERATE')
})

test('buildRoom 혼잡도 기준: 60% LOW, 25% MODERATE, 미만 HIGH, 0석 HIGH', () => {
  const mk = (empty: number, total: number) =>
    buildRoom(
      Array.from({ length: total }, (_, i) => ({
        ...mixedRoom.seats[0]!,
        seat_id: `A-${i}`,
        status: i < empty ? ('EMPTY' as const) : ('OCCUPIED' as const),
      })),
    ).congestion_level
  expect(mk(3, 5)).toBe('LOW')
  expect(mk(1, 4)).toBe('MODERATE')
  expect(mk(1, 5)).toBe('HIGH')
  expect(mk(0, 0)).toBe('HIGH')
})

test('배포 원문 offline 방은 last_observed_at 이 null 이다', () => {
  expect(deployedOfflineRoom.seats.every((s) => s.last_observed_at === null)).toBe(true)
  expect(deployedOfflineRoom.edge_online).toBe(false)
  expect(offlineRoom.seats.every((s) => s.last_observed_at !== null)).toBe(true)
})

const ROOM_SCENARIOS = SCENARIO_NAMES.filter(
  (name) => !['loading', 'error', 'not-found', 'slow-wake', 'rooms-empty'].includes(name),
)

test.each(ROOM_SCENARIOS)(
  '시나리오 %s 의 알 수 없는 좌석은 마지막 확인이 상태 시작보다 30초 이상 앞선다',
  async (name) => {
    server.use(...resolveScenario(name))
    const dto = roomDtoSchema.parse(
      await (await fetch(`http://localhost/api/v1/rooms/${ROOM_ID}`)).json(),
    )
    const known = ['OCCUPIED', 'AWAY', 'EMPTY']
    for (const seat of dto.seats) {
      if (known.includes(seat.status) || seat.last_observed_at === null) continue
      expect(Date.parse(seat.last_observed_at), `${name} ${seat.seat_id}`).toBeLessThanOrEqual(
        Date.parse(seat.status_since) - 30_000,
      )
    }
  },
)

async function getRoom(id: string) {
  return fetch(`http://localhost/api/v1/rooms/${id}`)
}

describe('핸들러', () => {
  test('기본 핸들러는 mixed 방을 준다', async () => {
    const res = await getRoom(ROOM_ID)
    expect(res.status).toBe(200)
    expect(roomDtoSchema.parse(await res.json()).available_seats).toBe(1)
  })
  test('없는 방은 404 와 안내 문구', async () => {
    const res = await getRoom('nope')
    expect(res.status).toBe(404)
    expect(await res.json()).toEqual({ detail: '등록되지 않은 방입니다.' })
  })
  test('error 시나리오는 500', async () => {
    server.use(...resolveScenario('error'))
    const res = await getRoom(ROOM_ID)
    expect(res.status).toBe(500)
    expect(await res.json()).toEqual({ detail: '일시적인 오류입니다.' })
  })
  test('not-found 시나리오는 모든 ID 에 404', async () => {
    server.use(...resolveScenario('not-found'))
    expect((await getRoom(ROOM_ID)).status).toBe(404)
  })
  test('offline 시나리오는 edge_online false', async () => {
    server.use(...resolveScenario('offline'))
    expect(roomDtoSchema.parse(await (await getRoom(ROOM_ID)).json()).edge_online).toBe(false)
  })
  test('no-seats 시나리오는 좌석 0개', async () => {
    server.use(...resolveScenario('no-seats'))
    const body = roomDtoSchema.parse(await (await getRoom(ROOM_ID)).json())
    expect(body.seats).toEqual([])
    expect(body.congestion_level).toBe('HIGH')
  })
})

describe('live-demo', () => {
  afterEach(() => vi.useRealTimers())

  test('연결이 있을 때만 3초마다 SEAT_UPDATED 를 보내고 마지막 연결이 닫히면 멈춘다', async () => {
    vi.useFakeTimers({ toFake: ['setInterval', 'clearInterval'] })
    server.use(...resolveScenario('live-demo'))
    const messages: Array<{ event: string; version: number; changes?: unknown[] }> = []
    const socket = new WebSocket(`ws://localhost/ws/rooms/${ROOM_ID}`)
    socket.addEventListener('message', (e) =>
      messages.push(JSON.parse(String(e.data)) as (typeof messages)[number]),
    )
    await vi.waitFor(() => expect(socket.readyState).toBe(1))
    await vi.advanceTimersByTimeAsync(3000)
    await vi.waitFor(() => expect(messages.length).toBe(1))
    expect(messages[0]).toMatchObject({ event: 'SEAT_UPDATED', version: 13 })
    const body = roomDtoSchema.parse(await (await getRoom(ROOM_ID)).json())
    expect(body.version).toBe(13)
    socket.close()
    await vi.waitFor(() => expect(vi.getTimerCount()).toBe(0))
  })

  test('연결이 없으면 타이머가 돌지 않는다', () => {
    vi.useFakeTimers({ toFake: ['setInterval', 'clearInterval'] })
    server.use(...resolveScenario('live-demo'))
    expect(vi.getTimerCount()).toBe(0)
  })
})

describe('live-demo 흐름', () => {
  afterEach(() => vi.useRealTimers())

  test('7단계 동안 받은 이벤트를 적용하면 GET 과 같은 방이 되고 단계 규칙을 지킨다', async () => {
    vi.useFakeTimers({ toFake: ['setInterval', 'clearInterval'] })
    server.use(...resolveScenario('live-demo'))
    const texts: string[] = []
    const socket = new WebSocket(`ws://localhost/ws/rooms/${ROOM_ID}`)
    socket.addEventListener('message', (e) => texts.push(String(e.data)))
    await vi.waitFor(() => expect(socket.readyState).toBe(1))

    let room: Room = toRoom(mixedRoom)
    const unknownSeat = mixedRoom.seats.find((s) => s.status === 'UNKNOWN')!
    const log: Array<{ step: number; kinds: string[]; version: number }> = []
    for (let step = 1; step <= 7; step++) {
      const before = texts.length
      await vi.advanceTimersByTimeAsync(3000)
      await vi.waitFor(() => expect(texts.length).toBeGreaterThan(before))
      const events = texts.slice(before).map((t) => parseRoomEvent(t)!)
      for (const event of events) {
        const applied = applyRoomEvent(room, event)
        expect(applied.needsRefetch).toBe(false)
        room = applied.room
      }
      const versions = new Set(events.map((e) => e.version))
      expect(versions).toEqual(new Set([12 + step]))
      log.push({ step, kinds: events.map((e) => e.type), version: 12 + step })

      const dto = roomDtoSchema.parse(await (await getRoom(ROOM_ID)).json())
      const expected = toRoom(dto)
      expect(dto.version).toBe(12 + step)
      expect(room.edgeOnline).toBe(expected.edgeOnline)
      expect(room.seats.map((s) => [s.seatId, s.rawStatus, s.reason])).toEqual(
        expected.seats.map((s) => [s.seatId, s.rawStatus, s.reason]),
      )
      expect(room.seats.filter((s) => s.rawStatus === 'EMPTY').length).toBe(dto.available_seats)
      expect(room.seats.filter((s) => s.rawStatus === 'UNKNOWN').length).toBe(dto.unknown_seats)
      if (step < 6) {
        const seat = dto.seats.find((s) => s.seat_id === unknownSeat.seat_id)!
        expect(seat.reason).toBe(unknownSeat.reason)
      }
    }
    expect(log[5]!.kinds).toEqual(['EDGE_STATUS_CHANGED', 'SEAT_UPDATED'])
    expect(log[6]!.kinds).toEqual(['EDGE_STATUS_CHANGED', 'SEAT_UPDATED'])
    for (const entry of log.slice(0, 5)) expect(entry.kinds).toEqual(['SEAT_UPDATED'])
    expect(room.edgeOnline).toBe(true)
    socket.close()
  })

  test('6번째 단계는 전 좌석 UNKNOWN/EDGE_OFFLINE 이고 다음 단계가 이전 상태를 복구한다', async () => {
    vi.useFakeTimers({ toFake: ['setInterval', 'clearInterval'] })
    server.use(...resolveScenario('live-demo'))
    const socket = new WebSocket(`ws://localhost/ws/rooms/${ROOM_ID}`)
    await vi.waitFor(() => expect(socket.readyState).toBe(1))
    const statuses: string[][] = []
    for (let step = 1; step <= 7; step++) {
      await vi.advanceTimersByTimeAsync(3000)
      const dto = roomDtoSchema.parse(await (await getRoom(ROOM_ID)).json())
      statuses.push(dto.seats.map((s) => `${s.status}/${s.reason}`))
      if (step === 6) {
        expect(dto.edge_online).toBe(false)
        expect(dto.seats.every((s) => s.status === 'UNKNOWN' && s.reason === 'EDGE_OFFLINE')).toBe(
          true,
        )
      }
    }
    expect(statuses[6]!.some((s) => s === 'UNKNOWN/OCCLUDED')).toBe(true)
    expect(statuses[6]!.some((s) => s.includes('EDGE_OFFLINE'))).toBe(false)
    expect(statuses[6]).toEqual(statuses[4])
    socket.close()
  })
})

describe('시나리오는 호출마다 새로 만들어진다', () => {
  test('ws-reject 를 두 번 풀면 각자 첫 연결을 거절한다', async () => {
    for (let round = 0; round < 2; round++) {
      server.resetHandlers()
      server.use(...resolveScenario('ws-reject'))
      const events: string[] = []
      const socket = new WebSocket(`ws://localhost/ws/rooms/${ROOM_ID}`)
      for (const name of ['open', 'close']) socket.addEventListener(name, () => events.push(name))
      await vi.waitFor(() => expect(events).toContain('close'))
      expect(events).toEqual(['close'])
    }
  })
})

describe('seat-details', () => {
  test('좌석 라벨이 모두 다르고 요구한 경우를 담는다', async () => {
    server.use(...resolveScenario('seat-details'))
    const body = roomDtoSchema.parse(await (await getRoom(ROOM_ID)).json())
    const labels = body.seats.map((s) => s.label)
    expect(new Set(labels).size).toBe(labels.length)
    const seats = toRoom(body).seats
    const unknown = seats.filter((s) => s.status === 'UNKNOWN')
    for (const reason of [
      'OCCLUDED',
      'LOW_CONFIDENCE',
      'MODEL_CONFLICT',
      'VLM_TIMEOUT',
      'STALE_OBSERVATION',
      'EDGE_OFFLINE',
      'UNRECOGNIZED',
      null,
    ]) {
      expect(unknown.some((s) => s.reason === reason)).toBe(true)
    }
    expect(seats.some((s) => s.status === 'UNRECOGNIZED')).toBe(true)
    // EMPTY 는 확인한 관측이 있어야 해서 시간이 null 인 빈자리는 없다
    expect(seats.some((s) => s.status === 'EMPTY' && s.lastObservedAt === null)).toBe(false)
    expect(seats.some((s) => s.status === 'EMPTY' && s.lastObservedAt !== null)).toBe(true)
    expect(seats.some((s) => s.status === 'UNKNOWN' && s.lastObservedAt === null)).toBe(true)
    expect(seats.some((s) => s.isWindow)).toBe(true)
  })
})

const LIST_URL = 'http://localhost/api/v1/rooms'
const getList = () => fetch(LIST_URL)
const SINGLE_ROOM_SCENARIOS = [
  'default',
  'mixed',
  'all-unknown',
  'offline',
  'no-seats',
  'many-seats',
  'seat-details',
]
const SUMMARY_FIELDS = [
  'room_id',
  'room_name',
  'total_seats',
  'available_seats',
  'unknown_seats',
  'congestion_level',
  'edge_online',
] as const

describe('목록 핸들러 시나리오', () => {
  const DELAYED = ['loading', 'slow-wake']

  // 기본 핸들러에도 mixed 목록이 있어서, 응답만 보면 시나리오가 목록 핸들러를 빠뜨려도 통과한다.
  test.each(SCENARIO_NAMES)('시나리오 %s 는 목록 경로 핸들러를 직접 가진다', (name) => {
    const owns = resolveScenario(name).filter(
      (h) => h instanceof HttpHandler && h.info.method === 'GET' && h.info.path === ROOM_LIST_URL,
    )
    expect(owns).toHaveLength(1)
  })

  test.each(SCENARIO_NAMES.filter((n) => !DELAYED.includes(n)))(
    '시나리오 %s 는 목록 요청을 처리한다',
    async (name) => {
      server.use(...resolveScenario(name))
      const res = await getList()
      expect(res.status).toBe(name === 'error' ? 500 : 200)
      if (res.status === 200) {
        expect(roomListDtoSchema.safeParse(await res.json()).success).toBe(true)
      }
    },
  )

  test.each(DELAYED)('시나리오 %s 의 목록은 상세처럼 지연된다', async (name) => {
    vi.useFakeTimers({ toFake: ['setTimeout'] })
    const controller = new AbortController()
    try {
      server.use(...resolveScenario(name))
      let done = false
      fetch(LIST_URL, { signal: controller.signal }).then(
        () => (done = true),
        () => {},
      )
      await vi.advanceTimersByTimeAsync(30_000)
      expect(done).toBe(false)
      if (name === 'slow-wake') {
        await vi.advanceTimersByTimeAsync(40_000)
        await vi.waitFor(() => expect(done).toBe(true))
      }
    } finally {
      controller.abort()
      vi.useRealTimers()
    }
  })

  test.each(SINGLE_ROOM_SCENARIOS)(
    '단일 방 시나리오 %s 의 목록 항목은 같은 시나리오 상세 응답의 요약과 같다',
    async (name) => {
      server.use(...resolveScenario(name))
      const list = roomListDtoSchema.parse(await (await getList()).json())
      const detail = roomDtoSchema.parse(await (await getRoom(ROOM_ID)).json())
      expect(list).toHaveLength(1)
      for (const field of SUMMARY_FIELDS) expect(list[0]![field], field).toEqual(detail[field])
    },
  )

  test.each(['not-found', 'rooms-empty'])('시나리오 %s 의 목록은 빈 배열', async (name) => {
    server.use(...resolveScenario(name))
    expect(await (await getList()).json()).toEqual([])
  })

  test('rooms-many 는 서로 다른 여섯 방을 요구한 경우대로 준다', async () => {
    server.use(...resolveScenario('rooms-many'))
    const list = roomListDtoSchema.parse(await (await getList()).json())
    expect(list).toHaveLength(6)
    expect(new Set(list.map((i) => i.room_id)).size).toBe(6)
    for (const item of list) {
      const res = await getRoom(encodeURIComponent(item.room_id))
      expect(res.status, item.room_id).toBe(200)
      const detail = roomDtoSchema.parse(await res.json())
      for (const field of SUMMARY_FIELDS) expect(item[field], field).toEqual(detail[field])
    }
    const known = (i: (typeof list)[number]) => i.edge_online && i.unknown_seats < i.total_seats
    expect(list.some((i) => known(i) && i.congestion_level === 'LOW')).toBe(true)
    expect(list.some((i) => known(i) && i.congestion_level === 'HIGH')).toBe(true)
    expect(
      list.some((i) => i.edge_online && i.total_seats > 0 && i.unknown_seats === i.total_seats),
    ).toBe(true)
    expect(
      list.some((i) => !i.edge_online && i.total_seats > 0 && i.unknown_seats === i.total_seats),
    ).toBe(true)
    expect(list.some((i) => i.total_seats === 0)).toBe(true)
    expect(list.some((i) => i.room_name.length >= 40)).toBe(true)
    expect(list.some((i) => i.room_name.split(' ').some((w) => w.length >= 40))).toBe(true)
  })

  test('rooms-refresh-fail 은 첫 목록만 200 이고 이후 500', async () => {
    server.use(...resolveScenario('rooms-refresh-fail'))
    expect((await getList()).status).toBe(200)
    expect((await getList()).status).toBe(500)
    expect((await getList()).status).toBe(500)
  })

  test.each(['live-flow', 'ws-reject', 'ws-slow-close', 'ws-down', 'live-demo'])(
    '시나리오 %s 의 목록은 현재 방 요약 하나',
    async (name) => {
      server.use(...resolveScenario(name))
      const list = roomListDtoSchema.parse(await (await getList()).json())
      const detail = roomDtoSchema.parse(await (await getRoom(ROOM_ID)).json())
      expect(list).toHaveLength(1)
      for (const field of SUMMARY_FIELDS) expect(list[0]![field], field).toEqual(detail[field])
    },
  )
})
