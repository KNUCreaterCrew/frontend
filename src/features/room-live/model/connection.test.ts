import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  FIRST_FETCH_GRACE_MS,
  reconnectDelayMs,
  RoomLiveConnection,
  type ConnectionDeps,
  type RoomCheck,
  type RoomRequestReason,
  type SocketLike,
} from './connection'

class FakeSocket implements SocketLike {
  onopen: (() => void) | null = null
  onclose: (() => void) | null = null
  onmessage: ((ev: { data: unknown }) => void) | null = null
  closedWith: number | undefined
  closed = false
  close(code?: number) {
    this.closed = true
    this.closedWith = code
  }
  open() {
    this.onopen?.()
  }
  serverClose() {
    this.closed = true
    this.onclose?.()
  }
  message(text: unknown) {
    this.onmessage?.({ data: text })
  }
}

function setup(initial: { visible?: boolean; online?: boolean } = {}) {
  const sockets: FakeSocket[] = []
  const pending: Array<(check: RoomCheck) => void> = []
  const env = { visible: initial.visible ?? true, online: initial.online ?? true }
  const messages: string[] = []
  const deps = {
    url: 'ws://test/ws/rooms/IT4-101',
    createSocket: vi.fn((url: string) => {
      void url
      const socket = new FakeSocket()
      sockets.push(socket)
      return socket
    }),
    onMessage: (text: string) => messages.push(text),
    allowFirstFetch: vi.fn(),
    requestRoom: vi.fn(
      (reason: RoomRequestReason) =>
        new Promise<RoomCheck>((resolve) => {
          void reason
          pending.push(resolve)
        }),
    ),
    isVisible: () => env.visible,
    isOnline: () => env.online,
  } satisfies ConnectionDeps
  const conn = new RoomLiveConnection(deps)
  /** 대기 중인 requestRoom 하나에 결과를 주고 마이크로태스크를 비운다 */
  const answer = async (check: RoomCheck) => {
    const resolve = pending.shift()
    if (!resolve) throw new Error('대기 중인 requestRoom 이 없다')
    resolve(check)
    await vi.advanceTimersByTimeAsync(0)
  }
  return { conn, deps, sockets, env, messages, answer, pending }
}

beforeEach(() => {
  vi.useFakeTimers()
})
afterEach(() => {
  vi.useRealTimers()
})

describe('reconnectDelayMs', () => {
  it('1초부터 두 배씩 늘고 10초에서 멈춘다', () => {
    expect([0, 1, 2, 3, 4, 5, 6, 20].map(reconnectDelayMs)).toEqual([
      1000, 2000, 4000, 8000, 10000, 10000, 10000, 10000,
    ])
  })
})

describe('RoomLiveConnection', () => {
  it('start 하면 소켓을 만들고 connecting 이다', () => {
    const { conn, sockets, deps } = setup()
    conn.start()
    expect(sockets).toHaveLength(1)
    expect(deps.createSocket).toHaveBeenCalledWith('ws://test/ws/rooms/IT4-101')
    expect(conn.state).toBe('connecting')
  })

  it('처음 열리면 첫 조회만 켜고 방 재조회는 하지 않는다', () => {
    const { conn, sockets, deps } = setup()
    conn.start()
    sockets[0]!.open()
    expect(conn.state).toBe('open')
    expect(deps.allowFirstFetch).toHaveBeenCalledTimes(1)
    expect(deps.requestRoom).not.toHaveBeenCalled()
  })

  it('재연결로 다시 열리면 방을 한 번 다시 조회한다', async () => {
    const { conn, sockets, deps, answer } = setup()
    conn.start()
    sockets[0]!.open()
    sockets[0]!.serverClose()
    await answer('ok')
    await vi.advanceTimersByTimeAsync(1000)
    sockets[1]!.open()
    expect(deps.allowFirstFetch).toHaveBeenCalledTimes(1)
    expect(deps.requestRoom).toHaveBeenCalledTimes(2)
  })

  it('닫힘 뒤 조회와 열림 뒤 조회를 구별해 알린다', async () => {
    const { conn, sockets, deps, answer } = setup()
    conn.start()
    sockets[0]!.open()
    sockets[0]!.serverClose()
    expect(deps.requestRoom).toHaveBeenLastCalledWith('close')
    await answer('ok')
    await vi.advanceTimersByTimeAsync(1000)
    sockets[1]!.open()
    expect(deps.requestRoom).toHaveBeenLastCalledWith('open')
  })

  it('재연결 뒤 조회가 거절돼도 상태는 그대로이고 예외가 새지 않는다', async () => {
    const { conn, sockets, deps } = setup()
    conn.start()
    sockets[0]!.open()
    deps.requestRoom.mockImplementationOnce(() => Promise.resolve('ok' as const))
    sockets[0]!.serverClose()
    await vi.advanceTimersByTimeAsync(0)
    await vi.advanceTimersByTimeAsync(1000)
    deps.requestRoom.mockImplementationOnce(() => Promise.reject(new Error('조회 실패')))
    sockets[1]!.open()
    await vi.advanceTimersByTimeAsync(0)
    expect(conn.state).toBe('open')
  })

  it('열리기 전에 닫히면 첫 조회를 켜고 방을 조회하며, 결과 전에는 새 소켓이 없다', async () => {
    const { conn, sockets, deps } = setup()
    conn.start()
    sockets[0]!.serverClose()
    expect(deps.allowFirstFetch).toHaveBeenCalledTimes(1)
    expect(deps.requestRoom).toHaveBeenCalledTimes(1)
    expect(conn.state).toBe('waitingForRoom')
    await vi.advanceTimersByTimeAsync(60_000)
    expect(sockets).toHaveLength(1)
  })

  it('방 조회가 notFound 이면 멈추고 다시 연결하지 않는다', async () => {
    const { conn, sockets, answer } = setup()
    conn.start()
    sockets[0]!.serverClose()
    await answer('notFound')
    await vi.advanceTimersByTimeAsync(60_000)
    expect(sockets).toHaveLength(1)
    expect(conn.state).toBe('stopped')
  })

  it('방 조회가 stop 이어도 멈춘다', async () => {
    const { conn, sockets, answer } = setup()
    conn.start()
    sockets[0]!.serverClose()
    await answer('stop')
    await vi.advanceTimersByTimeAsync(60_000)
    expect(sockets).toHaveLength(1)
    expect(conn.state).toBe('stopped')
  })

  it('ok 이면 1초, 2초 뒤로 다시 연결하고 대기는 10초에서 멈춘다', async () => {
    const { conn, sockets, answer } = setup()
    conn.start()
    sockets[0]!.serverClose()
    await answer('ok')
    expect(conn.state).toBe('backoff')
    await vi.advanceTimersByTimeAsync(999)
    expect(sockets).toHaveLength(1)
    await vi.advanceTimersByTimeAsync(1)
    expect(sockets).toHaveLength(2)

    sockets[1]!.serverClose()
    await answer('ok')
    await vi.advanceTimersByTimeAsync(1999)
    expect(sockets).toHaveLength(2)
    await vi.advanceTimersByTimeAsync(1)
    expect(sockets).toHaveLength(3)

    // 4초, 8초, 10초, 10초
    for (const [delay, count] of [
      [4000, 4],
      [8000, 5],
      [10_000, 6],
      [10_000, 7],
    ] as const) {
      sockets.at(-1)!.serverClose()
      await answer('ok')
      await vi.advanceTimersByTimeAsync(delay - 1)
      expect(sockets).toHaveLength(count - 1)
      await vi.advanceTimersByTimeAsync(1)
      expect(sockets).toHaveLength(count)
    }
  })

  it('연결에 성공하면 다음 대기는 다시 1초이다', async () => {
    const { conn, sockets, answer } = setup()
    conn.start()
    for (let i = 0; i < 3; i += 1) {
      sockets.at(-1)!.serverClose()
      await answer('ok')
      await vi.advanceTimersByTimeAsync(reconnectDelayMs(i))
    }
    expect(sockets).toHaveLength(4)
    sockets[3]!.open()
    await answer('ok') // 재연결 뒤 재조회
    sockets[3]!.serverClose()
    await answer('ok')
    await vi.advanceTimersByTimeAsync(1000)
    expect(sockets).toHaveLength(5)
  })

  it('첫 조회 유예: 열리지 않은 채 10초가 지나면 첫 조회를 켜고, 그 뒤 열리면 방을 조회한다', async () => {
    const { conn, sockets, deps } = setup()
    conn.start()
    await vi.advanceTimersByTimeAsync(FIRST_FETCH_GRACE_MS - 1)
    expect(deps.allowFirstFetch).not.toHaveBeenCalled()
    await vi.advanceTimersByTimeAsync(1)
    expect(deps.allowFirstFetch).toHaveBeenCalledTimes(1)
    sockets[0]!.open()
    expect(deps.allowFirstFetch).toHaveBeenCalledTimes(1)
    expect(deps.requestRoom).toHaveBeenCalledTimes(1)
  })

  it('열리면 유예 타이머가 풀려 첫 조회가 두 번 켜지지 않는다', async () => {
    const { conn, sockets, deps } = setup()
    conn.start()
    sockets[0]!.open()
    await vi.advanceTimersByTimeAsync(FIRST_FETCH_GRACE_MS * 2)
    expect(deps.allowFirstFetch).toHaveBeenCalledTimes(1)
  })

  it('메시지 문자열이 onMessage 로 그대로 간다', () => {
    const { conn, sockets, messages } = setup()
    conn.start()
    sockets[0]!.open()
    sockets[0]!.message('{"event":"x"}')
    expect(messages).toEqual(['{"event":"x"}'])
  })

  it('dispose 는 소켓을 1000 으로 닫고 이후 서버 닫힘에 새 소켓을 만들지 않는다', async () => {
    const { conn, sockets, deps } = setup()
    conn.start()
    sockets[0]!.open()
    conn.dispose()
    expect(sockets[0]!.closedWith).toBe(1000)
    expect(conn.state).toBe('stopped')
    sockets[0]!.serverClose()
    await vi.advanceTimersByTimeAsync(60_000)
    expect(sockets).toHaveLength(1)
    expect(deps.requestRoom).not.toHaveBeenCalled()
  })

  it('조회 결과를 기다리는 중 dispose 되면 결과가 와도 아무것도 하지 않는다', async () => {
    const { conn, sockets, answer } = setup()
    conn.start()
    sockets[0]!.serverClose()
    conn.dispose()
    await answer('ok')
    await vi.advanceTimersByTimeAsync(60_000)
    expect(sockets).toHaveLength(1)
    expect(conn.state).toBe('stopped')
  })

  it('start, dispose, start 를 새 인스턴스 둘로 하면 닫히지 않은 소켓은 1개이다', () => {
    const sockets: FakeSocket[] = []
    const make = () =>
      new RoomLiveConnection({
        url: 'ws://test',
        createSocket: () => {
          const socket = new FakeSocket()
          sockets.push(socket)
          return socket
        },
        onMessage: () => {},
        allowFirstFetch: () => {},
        requestRoom: () => Promise.resolve('ok'),
        isVisible: () => true,
        isOnline: () => true,
      })
    const first = make()
    first.start()
    first.dispose()
    const second = make()
    second.start()
    expect(sockets.filter((s) => !s.closed)).toHaveLength(1)
  })

  it('숨겨진 채 끊기면 paused 로 두고 타이머를 쓰지 않으며, 보이면 즉시 연결한다', async () => {
    const { conn, sockets, env, answer } = setup()
    conn.start()
    sockets[0]!.open()
    env.visible = false
    sockets[0]!.serverClose()
    await answer('ok')
    expect(conn.state).toBe('paused')
    await vi.advanceTimersByTimeAsync(30_000)
    expect(sockets).toHaveLength(1)
    env.visible = true
    conn.setVisible(true)
    expect(sockets).toHaveLength(2)
    expect(conn.state).toBe('connecting')
  })

  it('오프라인인 채 끊기면 paused 로 두고, 온라인이 되면 즉시 연결한다', async () => {
    const { conn, sockets, env, answer } = setup()
    conn.start()
    sockets[0]!.open()
    env.online = false
    sockets[0]!.serverClose()
    await answer('ok')
    expect(conn.state).toBe('paused')
    await vi.advanceTimersByTimeAsync(30_000)
    expect(sockets).toHaveLength(1)
    env.online = true
    conn.setOnline(true)
    expect(sockets).toHaveLength(2)
  })

  it('보이지만 오프라인이면 setVisible(true) 로 다시 연결하지 않는다', async () => {
    const { conn, sockets, env, answer } = setup()
    conn.start()
    sockets[0]!.open()
    env.visible = false
    env.online = false
    sockets[0]!.serverClose()
    await answer('ok')
    env.visible = true
    conn.setVisible(true)
    expect(sockets).toHaveLength(1)
    expect(conn.state).toBe('paused')
  })

  it('backoff 중 보이게 되면 대기 없이 바로 연결한다', async () => {
    const { conn, sockets, answer } = setup()
    conn.start()
    sockets[0]!.serverClose()
    await answer('ok')
    expect(conn.state).toBe('backoff')
    conn.setVisible(true)
    expect(sockets).toHaveLength(2)
    await vi.advanceTimersByTimeAsync(60_000)
    expect(sockets).toHaveLength(2)
  })

  it('backoff 중 숨겨지면 타이머를 지우고 paused 가 된다', async () => {
    const { conn, sockets, env, answer } = setup()
    conn.start()
    sockets[0]!.serverClose()
    await answer('ok')
    env.visible = false
    conn.setVisible(false)
    expect(conn.state).toBe('paused')
    await vi.advanceTimersByTimeAsync(60_000)
    expect(sockets).toHaveLength(1)
  })

  it('열린 소켓은 보임과 온라인 변화에 건드리지 않는다', () => {
    const { conn, sockets, env } = setup()
    conn.start()
    sockets[0]!.open()
    env.visible = false
    conn.setVisible(false)
    env.online = false
    conn.setOnline(false)
    env.visible = true
    env.online = true
    conn.setVisible(true)
    conn.setOnline(true)
    expect(sockets).toHaveLength(1)
    expect(sockets[0]!.closed).toBe(false)
    expect(conn.state).toBe('open')
  })

  it('조회 결과를 기다리는 동안의 보임 변화는 아무것도 하지 않는다', async () => {
    const { conn, sockets, answer } = setup()
    conn.start()
    sockets[0]!.serverClose()
    conn.setVisible(true)
    expect(sockets).toHaveLength(1)
    expect(conn.state).toBe('waitingForRoom')
    await answer('ok')
    expect(conn.state).toBe('backoff')
  })

  it('restart 는 stopped 일 때만 다시 연결하고 첫 조회 유예를 다시 걸지 않는다', async () => {
    const { conn, sockets, deps, answer } = setup()
    conn.start()
    conn.restart()
    expect(sockets).toHaveLength(1)
    sockets[0]!.serverClose()
    await answer('notFound')
    expect(conn.state).toBe('stopped')
    conn.restart()
    expect(sockets).toHaveLength(2)
    expect(conn.state).toBe('connecting')
    await vi.advanceTimersByTimeAsync(FIRST_FETCH_GRACE_MS * 2)
    expect(deps.allowFirstFetch).toHaveBeenCalledTimes(1)
    sockets[1]!.open()
    expect(deps.requestRoom).toHaveBeenCalledTimes(2)
  })

  it('dispose 된 인스턴스는 restart 로 되살아나지 않는다', () => {
    const { conn, sockets } = setup()
    conn.start()
    conn.dispose()
    conn.restart()
    expect(sockets).toHaveLength(1)
    expect(conn.state).toBe('stopped')
  })
})
