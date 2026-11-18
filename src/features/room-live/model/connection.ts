export interface SocketLike {
  onopen: (() => void) | null
  onclose: (() => void) | null
  onmessage: ((ev: { data: unknown }) => void) | null
  close(code?: number): void
}

export type RoomCheck = 'ok' | 'notFound' | 'stop'

export interface ConnectionDeps {
  url: string
  createSocket(url: string): SocketLike
  onMessage(text: string): void
  /** 첫 조회를 켠다. 한 번만 부른다 */
  allowFirstFetch(): void
  /** 방을 (다시) 조회하고 결과를 알린다 */
  requestRoom(): Promise<RoomCheck>
  isVisible(): boolean
  isOnline(): boolean
}

export type ConnectionState =
  'connecting' | 'open' | 'waitingForRoom' | 'backoff' | 'paused' | 'stopped'

export const FIRST_FETCH_GRACE_MS = 10_000

export function reconnectDelayMs(attempt: number): number {
  return Math.min(1000 * 2 ** attempt, 10_000)
}

/**
 * 방 WebSocket 연결의 상태 머신. React 와 쿼리 캐시를 모른다.
 * 닫힘은 이유를 가리지 않고 한 경로로 처리한다: 방을 조회해 없는 방이면 멈추고,
 * 아니면 보임과 온라인일 때 지수 대기 뒤 다시 연결한다.
 */
export class RoomLiveConnection {
  private current: ConnectionState = 'stopped'
  private socket: SocketLike | null = null
  private attempt = 0
  private firstFetchAllowed = false
  private disposed = false
  private graceTimer: ReturnType<typeof setTimeout> | null = null
  private backoffTimer: ReturnType<typeof setTimeout> | null = null
  /** 닫힘 처리 한 번마다 올려서, 늦게 도착한 조회 결과를 버린다 */
  private closeToken = 0

  constructor(private readonly deps: ConnectionDeps) {}

  get state(): ConnectionState {
    return this.current
  }

  start(): void {
    if (this.disposed || this.current !== 'stopped' || this.socket) return
    this.graceTimer = setTimeout(() => {
      this.graceTimer = null
      this.allowFirstFetchOnce()
    }, FIRST_FETCH_GRACE_MS)
    this.connect()
  }

  dispose(): void {
    this.disposed = true
    this.clearTimers()
    this.closeToken += 1
    const socket = this.socket
    this.socket = null
    this.current = 'stopped'
    if (socket) {
      socket.onopen = null
      socket.onclose = null
      socket.onmessage = null
      socket.close(1000)
    }
  }

  restart(): void {
    if (this.disposed || this.current !== 'stopped') return
    this.attempt = 0
    this.connect()
  }

  setVisible(visible: boolean): void {
    this.onEnvironmentChange(visible)
  }

  setOnline(online: boolean): void {
    this.onEnvironmentChange(online)
  }

  private onEnvironmentChange(improved: boolean): void {
    if (this.disposed) return
    if (improved) {
      if (this.current !== 'paused' && this.current !== 'backoff') return
      if (!this.canConnect()) return
      this.clearBackoffTimer()
      this.attempt = 0
      this.connect()
      return
    }
    if (this.current === 'backoff') {
      this.clearBackoffTimer()
      this.current = 'paused'
    }
  }

  private canConnect(): boolean {
    return this.deps.isVisible() && this.deps.isOnline()
  }

  private connect(): void {
    this.current = 'connecting'
    const socket = this.deps.createSocket(this.deps.url)
    this.socket = socket
    socket.onopen = () => {
      if (this.socket !== socket) return
      this.handleOpen()
    }
    socket.onmessage = (ev) => {
      if (this.socket !== socket) return
      this.deps.onMessage(String(ev.data))
    }
    socket.onclose = () => {
      if (this.socket !== socket) return
      this.handleClose()
    }
  }

  private handleOpen(): void {
    this.current = 'open'
    this.attempt = 0
    this.clearGraceTimer()
    if (!this.firstFetchAllowed) {
      this.allowFirstFetchOnce()
      return
    }
    // 연결 뒤 재조회: 서버가 없는 방은 업그레이드 전에 거절하므로 결과로 상태를 바꾸지 않는다
    this.deps.requestRoom().catch(() => undefined)
  }

  private handleClose(): void {
    this.socket = null
    this.clearGraceTimer()
    this.allowFirstFetchOnce()
    this.current = 'waitingForRoom'
    const token = (this.closeToken += 1)
    this.deps
      .requestRoom()
      .catch((): RoomCheck => 'ok')
      .then((check) => {
        if (this.disposed || token !== this.closeToken) return
        this.afterRoomCheck(check)
      })
      .catch(() => undefined)
  }

  private afterRoomCheck(check: RoomCheck): void {
    if (check !== 'ok') {
      this.current = 'stopped'
      return
    }
    if (!this.canConnect()) {
      this.current = 'paused'
      return
    }
    this.current = 'backoff'
    const delay = reconnectDelayMs(this.attempt)
    this.attempt += 1
    this.backoffTimer = setTimeout(() => {
      this.backoffTimer = null
      this.connect()
    }, delay)
  }

  private allowFirstFetchOnce(): void {
    if (this.firstFetchAllowed) return
    this.firstFetchAllowed = true
    this.deps.allowFirstFetch()
  }

  private clearGraceTimer(): void {
    if (this.graceTimer === null) return
    clearTimeout(this.graceTimer)
    this.graceTimer = null
  }

  private clearBackoffTimer(): void {
    if (this.backoffTimer === null) return
    clearTimeout(this.backoffTimer)
    this.backoffTimer = null
  }

  private clearTimers(): void {
    this.clearGraceTimer()
    this.clearBackoffTimer()
  }
}
