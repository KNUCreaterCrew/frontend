import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useQuery, useQueryClient, type UseQueryResult } from '@tanstack/react-query'
import {
  applyRoomEvent,
  fetchRoom,
  parseRoomMessage,
  roomKeys,
  roomQueryOptions,
} from '@/entities/room'
import type { Room, SeatStatus } from '@/entities/room'
import { endpoints, isNotFoundError, wsUrl } from '@/shared/api'
import {
  RoomLiveConnection,
  type RoomCheck,
  type RoomRequestReason,
  type SocketLike,
} from '../model/connection'
import {
  addHighlights,
  dropVersion,
  HIGHLIGHT_MS,
  highlightTargets,
  keepMatching,
  pruneHighlights,
  type Highlight,
} from '../model/highlight'
import { EventLog, isNewer, rebase } from '../model/reconcile'

export interface RoomLive {
  query: UseQueryResult<Room>
  /** seatId → 강조할 새 상태 */
  highlights: ReadonlyMap<string, SeatStatus>
  /** 실시간으로 장치 연결이 바뀐 직후의 안내 문구 */
  edgeNotice: string | null
  /** 오류 화면 "다시 시도" */
  restart(): void
}

const REFETCH_INTERVAL_MS = 30_000
const MAX_EDGE_VERSIONS = 100

// StrictMode 는 마운트 직후 효과를 한 번 정리하고 다시 실행한다. 연결을 마이크로태스크로 미루어
// 그 사이에 닫히면 소켓을 만들지 않는다(연결 중에 닫는 일을 피한다).
function openSocket(url: string): SocketLike {
  let socket: WebSocket | null = null
  let closed = false
  const adapter: SocketLike = {
    onopen: null,
    onclose: null,
    onmessage: null,
    close: (code) => {
      closed = true
      socket?.close(code)
    },
  }
  queueMicrotask(() => {
    if (closed) return
    const created = new WebSocket(url)
    socket = created
    created.onopen = () => adapter.onopen?.()
    created.onclose = () => adapter.onclose?.()
    created.onmessage = (ev) => adapter.onmessage?.({ data: ev.data })
  })
  return adapter
}

// 조회를 시작한 뒤 받은 이벤트를 응답 위에 다시 얹는다.
function fetchOptions(roomId: string, log: EventLog) {
  return {
    ...roomQueryOptions(roomId),
    queryFn: async ({ signal }: { signal: AbortSignal }): Promise<Room> => {
      const mark = log.mark()
      try {
        const room = await fetchRoom(roomId, signal)
        return rebase(room, log.since(mark))
      } finally {
        log.release(mark)
      }
    },
  }
}

export function useRoomLive(roomId: string): RoomLive {
  const queryClient = useQueryClient()
  const [log] = useState(() => new EventLog())
  const [firstFetchAllowed, setFirstFetchAllowed] = useState(false)
  const [highlightList, setHighlightList] = useState<readonly Highlight[]>([])
  // 실시간으로 바뀐 장치 연결. 같은 값이 다시 와도 새 객체라 알림 시간이 다시 잡힌다
  const [edgeChange, setEdgeChange] = useState<{ online: boolean } | null>(null)
  const connectionRef = useRef<RoomLiveConnection | null>(null)
  const lastCheckRef = useRef<RoomCheck | null>(null)

  const query = useQuery({
    ...fetchOptions(roomId, log),
    enabled: (q) => firstFetchAllowed && !isNotFoundError(q.state.error),
    // 404 로 끝난 조회는 주기 조회도 하지 않는다
    refetchInterval: (q) => (isNotFoundError(q.state.error) ? false : REFETCH_INTERVAL_MS),
  })

  useEffect(() => {
    const key = roomKeys.detail(roomId)
    const edgeVersions = new Set<number>()
    let baseVersion: number | null = null
    let disposed = false
    let followUp: Promise<void> | null = null

    // 진행 중인 조회가 있으면 새로 보내지 않고 그 조회에 붙는다
    const fetchNow = () =>
      queryClient.fetchQuery({ ...fetchOptions(roomId, log), staleTime: 0 }).then(() => undefined)

    // 진행 중인 조회의 응답은 그 뒤의 연결이나 재조회 요청을 담지 못할 수 있으므로,
    // 그 조회가 끝난 뒤 한 번 더 조회한다. 뒤따르는 조회는 하나만 둔다.
    const fetchAfterCurrent = (): Promise<void> => {
      if (followUp) return followUp
      if (queryClient.isFetching({ queryKey: key }) === 0) return fetchNow()
      const next = fetchNow()
        .catch(() => undefined)
        .then(() => {
          followUp = null
          return disposed ? undefined : fetchNow()
        })
      followUp = next
      return next
    }

    const requestRefetch = () => {
      fetchAfterCurrent().catch(() => undefined)
    }

    const checkRoom = async (reason: RoomRequestReason): Promise<RoomCheck> => {
      try {
        // 닫힘 뒤에는 없는 방인지만 보면 되므로 진행 중인 조회에 붙는다
        await (reason === 'open' ? fetchAfterCurrent() : fetchNow())
        return 'ok'
      } catch (error) {
        if (isNotFoundError(error)) return 'notFound'
        return queryClient.getQueryData(key) === undefined ? 'stop' : 'ok'
      }
    }

    const requestRoom = async (reason: RoomRequestReason): Promise<RoomCheck> => {
      setFirstFetchAllowed(true)
      const check = await checkRoom(reason)
      lastCheckRef.current = check
      return check
    }

    const onMessage = (text: string) => {
      const message = parseRoomMessage(text)
      if (message.kind === 'ignore') return
      if (message.kind === 'invalid') {
        requestRefetch()
        return
      }
      const event = message.event
      log.push(event)
      const room = queryClient.getQueryData<Room>(key)
      // 서버가 다시 시작해 기준이 작아지면 그 전 version 의 장치 변경 기록은 뜻이 없다
      if (room && baseVersion !== null && room.version < baseVersion) edgeVersions.clear()
      if (room) baseVersion = room.version
      if (event.type === 'EDGE_STATUS_CHANGED') {
        edgeVersions.add(event.version)
        if (edgeVersions.size > MAX_EDGE_VERSIONS) {
          const oldest = edgeVersions.values().next().value
          if (oldest !== undefined) edgeVersions.delete(oldest)
        }
        setHighlightList((current) => dropVersion(current, event.version))
      }
      if (!room || !isNewer(room, event)) return
      const result = applyRoomEvent(room, event)
      if (result.needsRefetch) {
        requestRefetch()
        return
      }
      if (result.room === room) return
      queryClient.setQueryData(key, result.room)
      if (event.type === 'EDGE_STATUS_CHANGED') {
        if (result.room.edgeOnline !== room.edgeOnline) {
          setEdgeChange({ online: result.room.edgeOnline })
        }
        return
      }
      const targets = highlightTargets(event, edgeVersions)
      const now = Date.now()
      // 강조 없이 다시 바뀐 좌석(예: 장치 끊김으로 확인 불가)의 강조는 지운다
      setHighlightList((current) =>
        targets.length > 0
          ? addHighlights(keepMatching(current, result.room.seats), targets, now)
          : keepMatching(current, result.room.seats),
      )
    }

    const connection = new RoomLiveConnection({
      url: wsUrl(endpoints.roomSocket(roomId)),
      createSocket: openSocket,
      onMessage,
      // 관찰자가 켜지기를 기다리지 않고 바로 조회를 시작한다(렌더 사이 지연을 없앤다)
      allowFirstFetch: () => {
        setFirstFetchAllowed(true)
        requestRefetch()
      },
      requestRoom,
      isVisible: () => document.visibilityState === 'visible',
      isOnline: () => navigator.onLine,
    })
    connectionRef.current = connection

    const onVisibility = () => connection.setVisible(document.visibilityState === 'visible')
    const onOnline = () => connection.setOnline(true)
    const onOffline = () => connection.setOnline(false)
    document.addEventListener('visibilitychange', onVisibility)
    window.addEventListener('online', onOnline)
    window.addEventListener('offline', onOffline)
    connection.start()

    return () => {
      disposed = true
      document.removeEventListener('visibilitychange', onVisibility)
      window.removeEventListener('online', onOnline)
      window.removeEventListener('offline', onOffline)
      connection.dispose()
      connectionRef.current = null
      setFirstFetchAllowed(false)
      setHighlightList([])
      setEdgeChange(null)
    }
  }, [roomId, queryClient, log])

  // 데이터 없이 조회가 실패해 연결을 멈춘 뒤, 주기 조회나 창 포커스로 조회가 살아나면 연결도 다시 시작한다.
  // restart 는 멈춘 연결만 다시 시작하므로 살아날 때마다 한 번이다.
  const recoveredAt = query.status === 'success' ? query.dataUpdatedAt : 0
  useEffect(() => {
    if (recoveredAt === 0 || lastCheckRef.current !== 'stop') return
    const connection = connectionRef.current
    if (connection?.state === 'stopped') connection.restart()
  }, [recoveredAt])

  // 장치 알림은 강조와 같은 시간만 두고 지운다(다음 같은 알림도 다시 읽히게)
  useEffect(() => {
    if (edgeChange === null) return
    const timer = setTimeout(() => setEdgeChange(null), HIGHLIGHT_MS)
    return () => clearTimeout(timer)
  }, [edgeChange])

  // 지금 데이터와 어긋나는 알림(놓친 복구를 재조회로 알게 된 경우 등)은 내보내지 않는다
  const edgeNotice =
    edgeChange !== null && edgeChange.online === query.data?.edgeOnline
      ? edgeChange.online
        ? '장치 연결이 돌아왔어요'
        : '장치 연결이 끊겼어요'
      : null

  // 가장 이른 만료 시각에 한 번 정리한다.
  useEffect(() => {
    if (highlightList.length === 0) return
    const earliest = Math.min(...highlightList.map((item) => item.until))
    const timer = setTimeout(
      () => setHighlightList((current) => pruneHighlights(current, Date.now())),
      Math.max(0, earliest - Date.now()),
    )
    return () => clearTimeout(timer)
  }, [highlightList])

  const highlights = useMemo(
    () => new Map(highlightList.map((item) => [item.seatId, item.status] as const)),
    [highlightList],
  )

  const restart = useCallback(() => {
    connectionRef.current?.restart()
    void queryClient.resetQueries({ queryKey: roomKeys.detail(roomId) })
  }, [queryClient, roomId])

  // 오류는 http 래퍼가 ApiError 로만 던지므로 Error 로 좁힌다
  return { query: query as UseQueryResult<Room>, highlights, edgeNotice, restart }
}
