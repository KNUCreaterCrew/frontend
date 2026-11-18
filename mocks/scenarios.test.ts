import { roomDtoSchema } from '@/entities/room'
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
]

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
