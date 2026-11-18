import { v1Events, v1RoomDto, startupRoomDto } from '../fixtures/interfacesFlow'
import { server } from '../node'
import { ROOM_ID } from '../fixtures/rooms'
import { roomListDtoSchema } from '@/entities/room'
import { mixedRoom, toListItemDto } from '../fixtures/rooms'
import { liveRoom, roomHandler, roomListHandler } from './rooms'

const WS = `ws://localhost/ws/rooms/${ROOM_ID}`
const GET = `http://localhost/api/v1/rooms/${ROOM_ID}`

function connect(url = WS) {
  const socket = new WebSocket(url)
  const messages: string[] = []
  const events: string[] = []
  socket.addEventListener('message', (e) => messages.push(String(e.data)))
  for (const name of ['open', 'error', 'close']) {
    socket.addEventListener(name, () => events.push(name))
  }
  return { socket, messages, events }
}

async function getVersion() {
  const body = (await (await fetch(GET)).json()) as { version: number }
  return body.version
}

const until = (cond: () => boolean) =>
  vi.waitFor(() => {
    if (!cond()) throw new Error('아직')
  })

test('send 한 이벤트를 연결된 client 가 JSON 문자열로 받는다', async () => {
  const live = liveRoom(startupRoomDto)
  server.use(...live.handlers)
  const c = connect()
  await until(() => live.openClients() === 1)
  live.send(v1Events[0])
  await until(() => c.messages.length === 1)
  expect(JSON.parse(c.messages[0]!)).toEqual(v1Events[0])
  live.sendRaw('{깨짐')
  await until(() => c.messages.length === 2)
  expect(c.messages[1]).toBe('{깨짐')
  c.socket.close()
  await until(() => live.openClients() === 0)
})

test('log 는 연결과 GET 이 들어온 순서를 기록한다', async () => {
  const live = liveRoom(startupRoomDto)
  server.use(...live.handlers)
  const c = connect()
  await until(() => live.log.length === 1)
  await fetch(GET)
  expect(live.log).toEqual(['ws', 'get'])
  c.socket.close()
})

test('setRoom 은 이후 GET 응답을 바꾼다', async () => {
  const live = liveRoom(startupRoomDto)
  server.use(...live.handlers)
  live.setRoom(v1RoomDto)
  expect(await getVersion()).toBe(1)
})

test('holdNextGet 은 다음 GET 만 붙잡고 release 하면 보낸다', async () => {
  const live = liveRoom(startupRoomDto)
  server.use(...live.handlers)
  const release = live.holdNextGet()
  let done = false
  const pending = fetch(GET).then(async (r) => {
    done = true
    return ((await r.json()) as { version: number }).version
  })
  await until(() => live.log.length === 1)
  await new Promise((r) => setTimeout(r, 30))
  expect(done).toBe(false)
  release()
  expect(await pending).toBe(0)
  expect(await getVersion()).toBe(0)
})

test('rejectFirst 는 첫 연결만 닫고 메시지를 보내지 않는다', async () => {
  const live = liveRoom(startupRoomDto, { rejectFirst: true })
  server.use(...live.handlers)
  const first = connect()
  await until(() => first.events.includes('close'))
  expect(first.events).toEqual(['close'])
  expect(first.messages).toEqual([])
  const second = connect()
  await until(() => second.events.includes('open'))
  expect(second.events).not.toContain('close')
  second.socket.close()
})

test('closeAfterOpen 은 첫 연결만 open 이후 그 코드로 닫는다', async () => {
  const live = liveRoom(startupRoomDto, { closeAfterOpen: 1013 })
  server.use(...live.handlers)
  const codes: number[] = []
  const order: string[] = []
  const first = new WebSocket(WS)
  first.addEventListener('open', () => order.push('open'))
  first.addEventListener('close', (e) => {
    order.push('close')
    codes.push(e.code)
  })
  await until(() => codes.length === 1)
  expect(order).toEqual(['open', 'close'])
  expect(codes).toEqual([1013])
  const second = connect()
  await until(() => second.events.includes('open'))
  await new Promise((r) => setTimeout(r, 30))
  expect(second.events).not.toContain('close')
  second.socket.close()
})

test('alwaysReject 는 모든 연결을 닫는다', async () => {
  const live = liveRoom(startupRoomDto, { alwaysReject: true })
  server.use(...live.handlers)
  for (let i = 0; i < 2; i++) {
    const c = connect()
    await until(() => c.events.includes('close'))
  }
})

const LIST = 'http://localhost/api/v1/rooms'

describe('목록 핸들러', () => {
  test('roomListHandler 는 목록 경로에 배열을 주고 상세 경로는 처리하지 않는다', async () => {
    const items = [{ ...toListItemDto(mixedRoom), room_name: '목록 전용 이름' }]
    server.use(roomListHandler(items))
    const res = await fetch(LIST)
    expect(res.status).toBe(200)
    expect(roomListDtoSchema.parse(await res.json())).toEqual(items)
    // 상세 경로는 목록 핸들러가 아니라 기본 핸들러가 받는다
    const detail = (await (await fetch(GET)).json()) as { seats?: unknown; room_name: string }
    expect(detail.seats).toBeDefined()
    expect(detail.room_name).not.toBe('목록 전용 이름')
  })

  test('함수를 받으면 요청마다 다시 계산한다', async () => {
    let n = 0
    server.use(roomListHandler(() => [{ ...toListItemDto(mixedRoom), available_seats: (n += 1) }]))
    const first = roomListDtoSchema.parse(await (await fetch(LIST)).json())
    const second = roomListDtoSchema.parse(await (await fetch(LIST)).json())
    expect([first[0]!.available_seats, second[0]!.available_seats]).toEqual([1, 2])
  })

  test('상세 핸들러는 목록 경로를 처리하지 않는다', async () => {
    server.use(roomHandler({ [ROOM_ID]: { ...mixedRoom, room_name: '상세 전용 이름' } }))
    const body = (await (await fetch(LIST)).json()) as Array<{ room_name: string }>
    expect(Array.isArray(body)).toBe(true)
    expect(body.every((i) => i.room_name !== '상세 전용 이름')).toBe(true)
  })

  test('liveRoom 의 목록 응답은 setRoom 뒤 새 집계를 따라간다', async () => {
    const live = liveRoom(startupRoomDto)
    server.use(...live.handlers)
    const before = roomListDtoSchema.parse(await (await fetch(LIST)).json())
    expect(before[0]).toEqual(toListItemDto(startupRoomDto))
    live.setRoom(v1RoomDto)
    const after = roomListDtoSchema.parse(await (await fetch(LIST)).json())
    expect(after[0]).toEqual(toListItemDto(v1RoomDto))
    expect(after[0]).not.toEqual(before[0])
  })

  test('목록 GET 은 liveRoom log 에 남지 않는다', async () => {
    const live = liveRoom(startupRoomDto)
    server.use(...live.handlers)
    await fetch(LIST)
    await fetch(GET)
    await fetch(LIST)
    expect(live.log).toEqual(['get'])
  })
})
