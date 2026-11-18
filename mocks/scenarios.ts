import { HttpResponse, delay, http } from 'msw'
import type { RequestHandler } from 'msw'
import {
  ROOM_ID,
  allUnknownRoom,
  manySeatsRoom,
  mixedRoom,
  noSeatsRoom,
  offlineRoom,
} from './fixtures/rooms'
import { roomHandler } from './handlers/rooms'

const ROOM_URL = '*/api/v1/rooms/:roomId'

const mixed = [roomHandler({ [ROOM_ID]: mixedRoom })]

export const scenarios: Record<string, RequestHandler[]> = {
  default: mixed,
  mixed,
  'all-unknown': [roomHandler({ [ROOM_ID]: allUnknownRoom })],
  offline: [roomHandler({ [ROOM_ID]: offlineRoom })],
  loading: [
    http.get(ROOM_URL, async () => {
      await delay('infinite')
      return HttpResponse.json(mixedRoom)
    }),
  ],
  error: [
    http.get(ROOM_URL, () =>
      HttpResponse.json({ detail: '일시적인 오류입니다.' }, { status: 500 }),
    ),
  ],
  'not-found': [
    http.get(ROOM_URL, () =>
      HttpResponse.json({ detail: '등록되지 않은 방입니다.' }, { status: 404 }),
    ),
  ],
  'slow-wake': [
    http.get(ROOM_URL, async () => {
      await delay(65_000)
      return HttpResponse.json(mixedRoom)
    }),
  ],
  'many-seats': [roomHandler({ [ROOM_ID]: manySeatsRoom })],
  'no-seats': [roomHandler({ [ROOM_ID]: noSeatsRoom })],
}

export function resolveScenario(name: string): RequestHandler[] {
  const found = Object.hasOwn(scenarios, name) ? scenarios[name] : undefined
  if (!found) {
    const known = Object.keys(scenarios).join(', ')
    throw new Error(`알 수 없는 시나리오: ${name} (알려진 이름: ${known})`)
  }
  return found
}
