import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useQuery, useQueryClient, type UseQueryResult } from '@tanstack/react-query'
import {
  applyRoomEvent,
  fetchRoom,
  parseRoomEvent,
  roomKeys,
  roomQueryOptions,
} from '@/entities/room'
import type { Room, SeatStatus } from '@/entities/room'
import { endpoints, isNotFoundError, wsUrl } from '@/shared/api'
import { RoomLiveConnection, type RoomCheck, type SocketLike } from '../model/connection'
import {
  addHighlights,
  dropVersion,
  highlightTargets,
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
  const [highlightList, setHighlightList] = useState<Highlight[]>([])
  const [edgeNotice, setEdgeNotice] = useState<string | null>(null)
  const connectionRef = useRef<RoomLiveConnection | null>(null)

  const query = useQuery({
    ...fetchOptions(roomId, log),
    enabled: (q) => firstFetchAllowed && !isNotFoundError(q.state.error),
    // 404 로 끝난 조회는 주기 조회도 하지 않는다
    refetchInterval: (q) => (isNotFoundError(q.state.error) ? false : REFETCH_INTERVAL_MS),
  })

  useEffect(() => {
    const key = roomKeys.detail(roomId)
    const edgeVersions = new Set<number>()

    // 진행 중인 조회가 있으면 겹치지 않게 건너뛴다.
    const requestRefetch = () => {
      if (queryClient.isFetching({ queryKey: key }) > 0) return
      queryClient.fetchQuery({ ...fetchOptions(roomId, log), staleTime: 0 }).catch(() => undefined)
    }

    const requestRoom = async (): Promise<RoomCheck> => {
      setFirstFetchAllowed(true)
      try {
        await queryClient.fetchQuery({ ...fetchOptions(roomId, log), staleTime: 0 })
        return 'ok'
      } catch (error) {
        if (isNotFoundError(error)) return 'notFound'
        return queryClient.getQueryData(key) === undefined ? 'stop' : 'ok'
      }
    }

    const onMessage = (text: string) => {
      const event = parseRoomEvent(text)
      if (!event) {
        requestRefetch()
        return
      }
      log.push(event)
      if (event.type === 'EDGE_STATUS_CHANGED') {
        edgeVersions.add(event.version)
        if (edgeVersions.size > MAX_EDGE_VERSIONS) {
          const oldest = edgeVersions.values().next().value
          if (oldest !== undefined) edgeVersions.delete(oldest)
        }
        setHighlightList((current) => dropVersion(current, event.version))
      }
      const room = queryClient.getQueryData<Room>(key)
      if (!room || !isNewer(room, event)) return
      const result = applyRoomEvent(room, event)
      if (result.needsRefetch) {
        requestRefetch()
        return
      }
      if (result.room !== room) queryClient.setQueryData(key, result.room)
      if (event.type === 'EDGE_STATUS_CHANGED') {
        if (result.room.edgeOnline !== room.edgeOnline) {
          setEdgeNotice(result.room.edgeOnline ? '장치 연결이 돌아왔어요' : '장치 연결이 끊겼어요')
        }
        return
      }
      const targets = highlightTargets(event, edgeVersions)
      if (targets.length > 0) {
        setHighlightList((current) => addHighlights(current, targets, Date.now()))
      }
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
      document.removeEventListener('visibilitychange', onVisibility)
      window.removeEventListener('online', onOnline)
      window.removeEventListener('offline', onOffline)
      connection.dispose()
      connectionRef.current = null
      setFirstFetchAllowed(false)
      setHighlightList([])
      setEdgeNotice(null)
    }
  }, [roomId, queryClient, log])

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
