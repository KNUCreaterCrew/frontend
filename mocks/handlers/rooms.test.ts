import { v1Events, v1RoomDto, startupRoomDto } from '../fixtures/interfacesFlow'
import { server } from '../node'
import { ROOM_ID } from '../fixtures/rooms'
import { liveRoom } from './rooms'

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

test('closeAfterOpen 은 첫 연결만 연 직후 그 코드로 닫는다', async () => {
  const live = liveRoom(startupRoomDto, { closeAfterOpen: 1013 })
  server.use(...live.handlers)
  const codes: number[] = []
  const first = new WebSocket(WS)
  first.addEventListener('close', (e) => codes.push(e.code))
  await until(() => codes.length === 1)
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
