import { act, screen, waitFor, within } from '@testing-library/react'
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
import type { RoomDto, RoomEventDto } from '@/entities/room'

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

const emptySeats: RoomDto['seats'] = ['A-01', 'A-02', 'A-03'].map((id, i) => ({
  ...v1RoomDto.seats[0]!,
  seat_id: id,
  label: `A${i + 1}`,
  status: 'EMPTY',
  reason: null,
  layout: { x: 120, y: 80 + i * 60, width: 64, height: 48 },
}))
const threeSeatRoom: RoomDto = {
  ...v1RoomDto,
  total_seats: 3,
  available_seats: 3,
  seats: emptySeats,
}

function seatChange(version: number, seatId: string): RoomEventDto {
  return {
    event: 'SEAT_UPDATED',
    room_id: 'IT4-101',
    version,
    available_seats: 2,
    unknown_seats: 0,
    congestion_level: 'LOW',
    changes: [
      {
        seat_id: seatId,
        prev_status: 'EMPTY',
        curr_status: 'OCCUPIED',
        reason: null,
        status_since: '2026-11-24T10:20:00+09:00',
        last_observed_at: '2026-11-24T10:20:00+09:00',
      },
    ],
  }
}

// 같은 version 의 장치 끊김과 그 때문에 확인 불가가 된 좌석 변경
function edgeOffline(version: number, seatId: string): RoomEventDto[] {
  return [
    { event: 'EDGE_STATUS_CHANGED', room_id: 'IT4-101', version, edge_online: false },
    {
      event: 'SEAT_UPDATED',
      room_id: 'IT4-101',
      version,
      available_seats: 2,
      unknown_seats: 1,
      congestion_level: 'LOW',
      changes: [
        {
          seat_id: seatId,
          prev_status: 'OCCUPIED',
          curr_status: 'UNKNOWN',
          reason: 'EDGE_OFFLINE',
          status_since: '2026-11-24T10:21:00+09:00',
          last_observed_at: '2026-11-24T10:20:00+09:00',
        },
      ],
    },
  ]
}

function unknownSeatEvent(): RoomEventDto {
  const seatEvent = v2Events[1]
  if (seatEvent?.event !== 'SEAT_UPDATED') throw new Error('fixture')
  return { ...seatEvent, changes: seatEvent.changes.map((c) => ({ ...c, seat_id: 'Z-99' })) }
}

// 첫 소켓의 open 을 붙잡아 둔다(첫 연결이 늦게 열리는 상황). 돌려준 함수를 부르면 열린다.
function holdFirstOpen(): () => void {
  const Real = globalThis.WebSocket
  let onopen: ((ev: Event) => void) | null = null
  let held = false
  function HeldWebSocket(url: string | URL): WebSocket {
    const socket = new Real(url)
    if (!held) {
      held = true
      Object.defineProperty(socket, 'onopen', {
        configurable: true,
        get: () => onopen,
        set: (fn: ((ev: Event) => void) | null) => {
          onopen = fn
        },
      })
    }
    return socket
  }
  vi.stubGlobal('WebSocket', HeldWebSocket)
  return () => onopen?.(new Event('open'))
}

const rings = (container: HTMLElement) => container.querySelectorAll('span.outline-live')
// 요약 줄의 "방금"(상대 시각)과 구별하려고 좌석 칸 안의 칩만 센다
const chips = (container: HTMLElement) => container.querySelectorAll('button .bg-live')

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

  test('모르는 event 종류는 무시하고 재조회하지 않는다', async () => {
    const live = liveRoom(v1RoomDto)
    server.use(...live.handlers)
    renderApp(PATH)
    await ready()
    await waitFor(() => expect(live.openClients()).toBe(1))
    const before = gets(live)
    act(() => live.sendRaw('{"event":"ROOM_RENAMED"}'))
    await new Promise((r) => setTimeout(r, 50))
    expect(gets(live)).toBe(before)
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
    afterEach(() => {
      vi.useRealTimers()
      vi.unstubAllGlobals()
    })

    test('첫 연결이 10초 뒤 진행 중인 조회 사이에 열리면 그 조회가 끝난 뒤 한 번 더 조회한다', async () => {
      const live = liveRoom(v1RoomDto)
      server.use(...live.handlers)
      const openFirstSocket = holdFirstOpen()
      const releaseGet = live.holdNextGet()
      renderApp(PATH)
      await waitFor(() => expect(sockets(live)).toBe(1))
      await advance(10_000)
      await waitFor(() => expect(gets(live)).toBe(1))
      act(() => openFirstSocket())
      const atOpen = live.log.length
      releaseGet()
      await ready()
      await waitFor(() => expect(gets(live)).toBe(2))
      expect(live.log.slice(atOpen)).toEqual(['get'])
      await advance(1000)
      expect(gets(live)).toBe(2)
    })

    test('조회 중에 재조회가 필요한 이벤트가 오면 그 조회가 끝난 뒤 한 번 더 조회한다', async () => {
      const live = liveRoom(v1RoomDto)
      server.use(...live.handlers)
      renderApp(PATH)
      await ready()
      await waitFor(() => expect(live.openClients()).toBe(1))
      const release = live.holdNextGet()
      await advance(30_000)
      await waitFor(() => expect(gets(live)).toBe(2))
      sendAll(live, [unknownSeatEvent()])
      await advance(50)
      expect(gets(live)).toBe(2)
      release()
      await waitFor(() => expect(gets(live)).toBe(3))
      await advance(1000)
      expect(gets(live)).toBe(3)
    })

    test('연결과 첫 조회가 실패해 멈춘 뒤 주기 조회가 성공하면 연결을 다시 시작한다', async () => {
      const live = liveRoom(v1RoomDto, { rejectFirst: true })
      server.use(
        http.get(
          '*/api/v1/rooms/:roomId',
          () => HttpResponse.json({ detail: '서버 오류' }, { status: 500 }),
          { once: true },
        ),
        ...live.handlers,
      )
      renderApp(PATH)
      await screen.findByRole('heading', { name: '방 정보를 불러오지 못했어요' })
      expect(sockets(live)).toBe(1)
      await advance(30_000)
      await ready()
      await waitFor(() => expect(sockets(live)).toBe(2))
      await waitFor(() => expect(live.openClients()).toBe(1))
    })

    test('강조된 좌석이 장치 끊김으로 확인 불가가 되면 테두리와 방금 표시가 사라진다', async () => {
      const live = liveRoom(threeSeatRoom)
      server.use(...live.handlers)
      const { container } = renderApp(PATH)
      await ready()
      await waitFor(() => expect(live.openClients()).toBe(1))
      sendAll(live, [seatChange(2, 'A-02')])
      expect(await screen.findByText('방금 사용 중')).toBeVisible()
      sendAll(live, edgeOffline(3, 'A-02'))
      const seat = await screen.findByRole('button', { name: /^A2 확인 불가/ })
      expect(rings(container)).toHaveLength(0)
      expect(chips(container)).toHaveLength(0)
      expect(within(seat).getByText('확인 불가')).toBeVisible()
    })

    test('끊김으로 지워진 강조는 5초 안에 같은 상태로 복구돼도 다시 나타나지 않는다', async () => {
      const live = liveRoom(threeSeatRoom)
      server.use(...live.handlers)
      const { container } = renderApp(PATH)
      await ready()
      await waitFor(() => expect(live.openClients()).toBe(1))
      sendAll(live, [seatChange(2, 'A-02')])
      expect(await screen.findByText('방금 사용 중')).toBeVisible()
      sendAll(live, edgeOffline(3, 'A-02'))
      await screen.findByRole('button', { name: /^A2 확인 불가/ })
      await advance(1000)
      // 같은 version 의 복구 쌍: 확인 불가였던 좌석이 이전 상태(사용 중)로 돌아온다
      sendAll(live, [
        { event: 'EDGE_STATUS_CHANGED', room_id: 'IT4-101', version: 4, edge_online: true },
        {
          event: 'SEAT_UPDATED',
          room_id: 'IT4-101',
          version: 4,
          available_seats: 2,
          unknown_seats: 0,
          congestion_level: 'LOW',
          changes: [
            {
              seat_id: 'A-02',
              prev_status: 'UNKNOWN',
              curr_status: 'OCCUPIED',
              reason: null,
              status_since: '2026-11-24T10:20:00+09:00',
              last_observed_at: '2026-11-24T10:22:00+09:00',
            },
          ],
        },
      ])
      const seat = await screen.findByRole('button', { name: /^A2 사용 중/ })
      expect(rings(container)).toHaveLength(0)
      expect(chips(container)).toHaveLength(0)
      expect(within(seat).queryByText(/^방금/)).toBeNull()
    })

    test('장치 알림 문구는 5초 뒤 지워진다', async () => {
      const live = liveRoom(v1RoomDto)
      server.use(...live.handlers)
      const { container } = renderApp(PATH)
      await ready()
      await waitFor(() => expect(live.openClients()).toBe(1))
      sendAll(live, v2Events)
      await waitFor(() => expect(liveRegion(container)).toHaveTextContent(BANNER))
      await advance(5000)
      await waitFor(() => expect(liveRegion(container).textContent).toBe(''))
    })

    test('다시 조회해서 장치가 돌아왔으면 끊김 문구를 남기지 않고, 다음 끊김을 다시 알린다', async () => {
      const live = liveRoom(v1RoomDto)
      server.use(...live.handlers)
      const { container } = renderApp(PATH)
      await ready()
      await waitFor(() => expect(live.openClients()).toBe(1))
      sendAll(live, v2Events)
      await waitFor(() => expect(liveRegion(container)).toHaveTextContent(BANNER))
      // 복구 이벤트를 놓치고 재조회로 장치가 돌아온 것을 알게 된다
      live.setRoom({ ...v1RoomDto, version: 3 })
      act(() => live.sendRaw('oops'))
      await waitFor(() => expect(screen.queryByRole('heading', { name: BANNER })).toBeNull())
      expect(liveRegion(container).textContent).toBe('')
      sendAll(
        live,
        v2Events.map((event) => ({ ...event, version: 4 })),
      )
      await screen.findByRole('heading', { level: 2, name: BANNER })
      expect(liveRegion(container)).toHaveTextContent(BANNER)
    })

    test('서버가 다시 시작해 기준 version 이 작아지면 이전 장치 변경 version 을 잊는다', async () => {
      const live = liveRoom({ ...threeSeatRoom, version: 5 })
      server.use(...live.handlers)
      const { container } = renderApp(PATH)
      await ready()
      await waitFor(() => expect(live.openClients()).toBe(1))
      sendAll(live, [
        { event: 'EDGE_STATUS_CHANGED', room_id: 'IT4-101', version: 6, edge_online: true },
      ])
      live.setRoom({ ...threeSeatRoom, version: 1, room_name: '다시 시작한 방' })
      act(() => live.sendRaw('oops'))
      await screen.findByRole('heading', { level: 1, name: '다시 시작한 방' })
      sendAll(live, [seatChange(6, 'A-02')])
      expect(await screen.findByText('방금 사용 중')).toBeVisible()
      expect(rings(container)).toHaveLength(1)
    })

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
      // 붙잡힌 응답은 v1 스냅샷이지만 방 이름이 달라서, 응답이 반영됐는지 화면에서 알 수 있다
      live.setRoom({ ...v1RoomDto, room_name: '응답 도착 확인용 이름' })
      release()
      await advance(200)
      expect(
        await screen.findByRole('heading', { level: 1, name: '응답 도착 확인용 이름' }),
      ).toBeVisible()
      expect(screen.getByRole('button', { name: /^A1 확인 불가/ })).toBeInTheDocument()
      expect(screen.queryByRole('button', { name: /^A1 사용 중/ })).toBeNull()
    })

    test('평소 좌석 변경은 "방금 사용 중"으로 5초 보이고 사라진다', async () => {
      const live = liveRoom(threeSeatRoom)
      server.use(...live.handlers)
      const { container } = renderApp(PATH)
      await ready()
      await waitFor(() => expect(live.openClients()).toBe(1))
      expect(chips(container)).toHaveLength(0)
      sendAll(live, [seatChange(2, 'A-02')])
      expect(await screen.findByText('방금 사용 중')).toBeVisible()
      expect(rings(container)).toHaveLength(1)
      expect(screen.getByRole('button', { name: /^A2 사용 중/ })).toBeInTheDocument()
      await advance(5000)
      await waitFor(() => expect(rings(container)).toHaveLength(0))
      expect(chips(container)).toHaveLength(0)
    })

    test('장치 끊김 흐름에서는 방금 표시가 없다', async () => {
      const live = liveRoom(v1RoomDto)
      server.use(...live.handlers)
      const { container } = renderApp(PATH)
      await ready()
      await waitFor(() => expect(live.openClients()).toBe(1))
      sendAll(live, v2Events)
      await screen.findByRole('heading', { level: 2, name: BANNER })
      expect(chips(container)).toHaveLength(0)
      expect(rings(container)).toHaveLength(0)
    })

    test('3석이 연달아 바뀌면 테두리는 최근 2석만 남는다', async () => {
      const live = liveRoom(threeSeatRoom)
      server.use(...live.handlers)
      const { container } = renderApp(PATH)
      await ready()
      await waitFor(() => expect(live.openClients()).toBe(1))
      sendAll(live, [seatChange(2, 'A-01'), seatChange(3, 'A-02'), seatChange(4, 'A-03')])
      await waitFor(() => expect(rings(container)).toHaveLength(2))
    })

    test('not-found: 연결도 조회도 한 번이고 다시 시도하지 않는다', async () => {
      const live = liveRoom(v1RoomDto, { alwaysReject: true })
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
