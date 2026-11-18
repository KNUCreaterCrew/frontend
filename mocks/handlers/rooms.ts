import { HttpResponse, http, ws } from 'msw'
import type { RequestHandler, WebSocketHandler } from 'msw'
import type { RoomDto, RoomEventDto } from '@/entities/room'

export type MockHandler = RequestHandler | WebSocketHandler

export function roomHandler(rooms: Record<string, RoomDto>) {
  return http.get('*/api/v1/rooms/:roomId', ({ params }) => {
    const id = String(params.roomId)
    const room = Object.hasOwn(rooms, id) ? rooms[id] : undefined
    if (!room) return HttpResponse.json({ detail: '등록되지 않은 방입니다.' }, { status: 404 })
    return HttpResponse.json(room)
  })
}

export const ROOM_SOCKET_URL = '*/ws/rooms/:roomId'

// 연결을 받기만 하고 아무것도 보내지 않는다.
export function quietRoomSocket(): WebSocketHandler {
  return ws.link(ROOM_SOCKET_URL).addEventListener('connection', () => {})
}

// 연결 즉시 닫는다. 서버가 열기 전에 거절하는 것을 흉내 낸다.
export function rejectingRoomSocket(): WebSocketHandler {
  return ws.link(ROOM_SOCKET_URL).addEventListener('connection', ({ client }) => {
    client.close(1006)
  })
}

export interface LiveRoomOptions {
  rejectFirst?: boolean
  /** 연 직후 이 코드로 닫는다. 첫 연결만 */
  closeAfterOpen?: number
  alwaysReject?: boolean
  /** 열린 연결 수가 바뀔 때 부른다(시연 시나리오의 타이머용) */
  onClientsChange?: (count: number) => void
}

export interface LiveRoom {
  handlers: MockHandler[]
  send(event: RoomEventDto): void
  sendRaw(text: string): void
  openClients(): number
  setRoom(dto: RoomDto): void
  holdNextGet(): () => void
  log: Array<'ws' | 'get'>
}

export function liveRoom(initial: RoomDto, options: LiveRoomOptions = {}): LiveRoom {
  let room = initial
  let connections = 0
  let held: Promise<void> | null = null
  const clients = new Set<{ send(data: string): void }>()
  const log: Array<'ws' | 'get'> = []
  const link = ws.link(ROOM_SOCKET_URL)

  const notify = () => options.onClientsChange?.(clients.size)

  const getHandler = http.get('*/api/v1/rooms/:roomId', async () => {
    log.push('get')
    const wait = held
    held = null
    if (wait) await wait
    return HttpResponse.json(room)
  })

  const socketHandler = link.addEventListener('connection', ({ client }) => {
    log.push('ws')
    connections += 1
    const first = connections === 1
    if (options.alwaysReject || (options.rejectFirst && first)) {
      client.close(1006)
      return
    }
    clients.add(client)
    notify()
    client.addEventListener('close', () => {
      clients.delete(client)
      notify()
    })
    if (options.closeAfterOpen !== undefined && first) {
      // 연결 리스너 안에서 바로 닫으면 open 없이 닫히므로 open 이 지난 뒤에 닫는다.
      const code = options.closeAfterOpen
      setTimeout(() => client.close(code), 0)
    }
  })

  return {
    handlers: [getHandler, socketHandler],
    send: (event) => {
      for (const c of clients) c.send(JSON.stringify(event))
    },
    sendRaw: (text) => {
      for (const c of clients) c.send(text)
    },
    openClients: () => clients.size,
    setRoom: (dto) => {
      room = dto
    },
    holdNextGet: () => {
      let release: () => void = () => {}
      held = new Promise<void>((resolve) => {
        release = resolve
      })
      return release
    },
    log,
  }
}
