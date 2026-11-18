import { act, screen, waitFor } from '@testing-library/react'
import { HttpResponse, http } from 'msw'
import { renderApp } from '@/shared/test/renderApp'
import { server } from '@mocks/node'
import { liveRoom, type LiveRoom } from '@mocks/handlers/rooms'
import {
  startupRoomDto,
  v1Events,
  v1RoomDto,
  v2Events,
  v3Events,
} from '@mocks/fixtures/interfacesFlow'
import type { RoomEventDto } from '@/entities/room'

const PATH = '/rooms/IT4-101'
const ROOM_NAME = '제1실습실 (예시)'
const BANNER = '장치 연결이 끊겼어요'

const advance = (ms: number) => act(() => vi.advanceTimersByTimeAsync(ms))

function liveRegion(container: HTMLElement): HTMLElement {
  const el = container.querySelector('[aria-live="polite"][aria-atomic="true"]')
  if (!el) throw new Error('live region 이 없어요')
  return el as HTMLElement
}

function sendAll(live: LiveRoom, events: RoomEventDto[]) {
  act(() => {
    for (const event of events) live.send(event)
  })
}

const gets = (live: LiveRoom) => live.log.filter((entry) => entry === 'get').length
const sockets = (live: LiveRoom) => live.log.filter((entry) => entry === 'ws').length

function ready() {
  return screen.findByRole('heading', { level: 1, name: ROOM_NAME })
}

describe('실시간 반영', () => {
  test('WebSocket 연결이 먼저, 방 조회가 그다음', async () => {
    const live = liveRoom(v1RoomDto)
    server.use(...live.handlers)
    renderApp(PATH)
    await ready()
    expect(live.log[0]).toBe('ws')
    expect(live.log[1]).toBe('get')
  })

  test('예시 흐름: 시작 → v1 → v2 → v3', async () => {
    const live = liveRoom(startupRoomDto)
    server.use(...live.handlers)
    const { container } = renderApp(PATH)
    const h1 = await ready()
    expect(screen.getByRole('heading', { level: 2, name: BANNER })).toBeVisible()
    await waitFor(() => expect(live.openClients()).toBe(1))

    sendAll(live, v1Events)
    await waitFor(() => expect(screen.queryByRole('heading', { name: BANNER })).toBeNull())
    expect(screen.getByRole('button', { name: /^A1 사용 중/ })).toBeInTheDocument()
    expect(liveRegion(container)).toHaveTextContent('장치 연결이 돌아왔어요')

    sendAll(live, v2Events)
    const banner = await screen.findByRole('heading', { level: 2, name: BANNER })
    expect(banner.compareDocumentPosition(h1) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    expect(screen.getByRole('button', { name: /^A1 확인 불가/ })).toBeInTheDocument()
    expect(screen.getByText('모름', { selector: '[aria-hidden="true"]' })).toBeVisible()
    expect(liveRegion(container)).toHaveTextContent(BANNER)

    sendAll(live, v3Events)
    await waitFor(() => expect(screen.queryByRole('heading', { name: BANNER })).toBeNull())
    expect(screen.getByRole('button', { name: /^A1 사용 중/ })).toBeInTheDocument()
  })

  test('기준 version 이하 이벤트는 버리고 재조회도 없다', async () => {
    const live = liveRoom(v1RoomDto)
    server.use(...live.handlers)
    renderApp(PATH)
    await ready()
    await waitFor(() => expect(live.openClients()).toBe(1))
    const before = gets(live)
    sendAll(live, v1Events)
    await new Promise((r) => setTimeout(r, 50))
    expect(screen.getByRole('button', { name: /^A1 사용 중/ })).toBeInTheDocument()
    expect(gets(live)).toBe(before)
  })

  test('깨진 메시지는 화면을 그대로 두고 재조회 한 번', async () => {
    const live = liveRoom(v1RoomDto)
    server.use(...live.handlers)
    renderApp(PATH)
    await ready()
    await waitFor(() => expect(live.openClients()).toBe(1))
    const before = gets(live)
    act(() => live.sendRaw('oops'))
    await waitFor(() => expect(gets(live)).toBe(before + 1))
    await new Promise((r) => setTimeout(r, 50))
    expect(gets(live)).toBe(before + 1)
    expect(screen.getByRole('button', { name: /^A1 사용 중/ })).toBeInTheDocument()
  })

  test('모르는 좌석 이벤트는 화면을 그대로 두고 재조회 한 번', async () => {
    const live = liveRoom(v1RoomDto)
    server.use(...live.handlers)
    renderApp(PATH)
    await ready()
    await waitFor(() => expect(live.openClients()).toBe(1))
    const before = gets(live)
    const seatEvent = v2Events[1]
    if (seatEvent?.event !== 'SEAT_UPDATED') throw new Error('fixture')
    sendAll(live, [
      { ...seatEvent, changes: seatEvent.changes.map((c) => ({ ...c, seat_id: 'Z-99' })) },
    ])
    await waitFor(() => expect(gets(live)).toBe(before + 1))
    await new Promise((r) => setTimeout(r, 50))
    expect(gets(live)).toBe(before + 1)
    expect(screen.getByRole('button', { name: /^A1 사용 중/ })).toBeInTheDocument()
  })

  test('StrictMode 에서도 연결은 하나이고 이벤트는 한 번만 반영된다', async () => {
    const live = liveRoom(v1RoomDto)
    server.use(...live.handlers)
    renderApp(PATH, { strict: true })
    await ready()
    await waitFor(() => expect(live.openClients()).toBe(1))
    sendAll(live, v2Events)
    expect(await screen.findByRole('button', { name: /^A1 확인 불가/ })).toBeInTheDocument()
    expect(live.openClients()).toBe(1)
  })

  describe('가짜 시계', () => {
    beforeEach(() => vi.useFakeTimers({ shouldAdvanceTime: true }))
    afterEach(() => vi.useRealTimers())

    test('조회 중에 온 이벤트가 응답 위에 다시 얹힌다', async () => {
      const live = liveRoom(v1RoomDto)
      server.use(...live.handlers)
      renderApp(PATH)
      await ready()
      await waitFor(() => expect(live.openClients()).toBe(1))
      const release = live.holdNextGet()
      await advance(30_000)
      await waitFor(() => expect(gets(live)).toBe(2))
      sendAll(live, v2Events)
      expect(await screen.findByRole('button', { name: /^A1 확인 불가/ })).toBeInTheDocument()
      release()
      await advance(200)
      expect(screen.getByRole('button', { name: /^A1 확인 불가/ })).toBeInTheDocument()
      expect(screen.queryByRole('button', { name: /^A1 사용 중/ })).toBeNull()
    })

    test('not-found: 연결도 조회도 한 번이고 다시 시도하지 않는다', async () => {
      const live = liveRoom(v1RoomDto)
      let calls = 0
      server.use(
        http.get('*/api/v1/rooms/:roomId', () => {
          calls += 1
          return HttpResponse.json({ detail: '없음' }, { status: 404 })
        }),
        ...live.handlers,
      )
      renderApp(PATH)
      const title = await screen.findByRole('heading', {
        level: 1,
        name: '이 방을 찾을 수 없어요',
      })
      await advance(60_000)
      expect(title).toBeVisible()
      expect(calls).toBe(1)
      expect(sockets(live)).toBe(1)
    })

    test('ws-down: 30초마다 조회하고 새 값이 반영된다', async () => {
      const live = liveRoom(v1RoomDto, { alwaysReject: true })
      server.use(...live.handlers)
      renderApp(PATH)
      await ready()
      const before = gets(live)
      live.setRoom({
        ...v1RoomDto,
        available_seats: 1,
        version: 2,
        seats: v1RoomDto.seats.map((s) => ({ ...s, status: 'EMPTY', reason: null })),
      })
      await advance(30_000)
      await waitFor(() => expect(gets(live)).toBeGreaterThan(before))
      expect(await screen.findByRole('button', { name: /^A1 빈자리/ })).toBeInTheDocument()
    })

    test('ws-reject: 첫 연결 실패 뒤 1초 대기, 두 번째 연결이 열리면 한 번 더 조회', async () => {
      const live = liveRoom(v1RoomDto, { rejectFirst: true })
      server.use(...live.handlers)
      renderApp(PATH)
      await ready()
      expect(gets(live)).toBe(1)
      expect(sockets(live)).toBe(1)
      await advance(1000)
      await waitFor(() => expect(sockets(live)).toBe(2))
      await waitFor(() => expect(gets(live)).toBe(2))
    })

    test('ws-slow-close: 열린 직후 닫히면 조회하고 1초 뒤 다시 연결', async () => {
      const live = liveRoom(v1RoomDto, { closeAfterOpen: 1013 })
      server.use(...live.handlers)
      renderApp(PATH)
      await ready()
      await waitFor(() => expect(gets(live)).toBeGreaterThanOrEqual(1))
      await advance(1000)
      await waitFor(() => expect(sockets(live)).toBe(2))
      await waitFor(() => expect(gets(live)).toBeGreaterThanOrEqual(2))
    })
  })
})
