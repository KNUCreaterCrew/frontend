import { queryOptions } from '@tanstack/react-query'
import { endpoints, http, isNotFoundError } from '@/shared/api'
import { roomDtoSchema, roomListDtoSchema } from '../model/dto'
import { toRoom, toRoomListItem } from '../model/mapping'
import type { Room, RoomListItem } from '../model/types'

export const roomKeys = {
  all: ['rooms'] as const,
  list: () => ['rooms', 'list'] as const,
  detail: (roomId: string) => ['rooms', 'detail', roomId] as const,
  // 방 목록 머리 영역의 좌석 배치. 방 화면의 실시간 캐시(detail)와 섞이지 않게 키를 나눈다
  preview: (roomId: string) => ['rooms', 'preview', roomId] as const,
  stats: (roomId: string) => ['rooms', 'stats', roomId] as const,
  dailyStats: (roomId: string, date: string) => ['rooms', 'stats', roomId, 'daily', date] as const,
  weeklyStats: (roomId: string, weeks: number) =>
    ['rooms', 'stats', roomId, 'weekly', weeks] as const,
}

export async function fetchRoom(roomId: string, signal?: AbortSignal): Promise<Room> {
  const dto = await http.get(endpoints.room(roomId), roomDtoSchema, {
    signal,
    timeoutMs: 90_000,
  })
  return toRoom(dto)
}

// retry 는 queryClient 기본값에 맡긴다.
// 404 로 실패한 조회는 포커스, 재연결, 다시 마운트에서 다시 부르지 않는다(다시 부르면 대기 상태로 돌아가 화면이 비는다).
export const unlessNotFound = (query: { state: { error: unknown } }) =>
  !isNotFoundError(query.state.error)

export function roomQueryOptions(roomId: string) {
  return queryOptions({
    queryKey: roomKeys.detail(roomId),
    queryFn: ({ signal }) => fetchRoom(roomId, signal),
    refetchOnWindowFocus: unlessNotFound,
    refetchOnReconnect: unlessNotFound,
    retryOnMount: unlessNotFound,
  })
}

// 방 목록 머리 영역용. 목록처럼 30초마다 다시 조회하고 WebSocket 은 받지 않는다.
// 404 면 주기 조회도 멈춘다
export function roomPreviewQueryOptions(roomId: string) {
  return queryOptions({
    queryKey: roomKeys.preview(roomId),
    queryFn: ({ signal }) => fetchRoom(roomId, signal),
    refetchInterval: (query) => (unlessNotFound(query) ? 30_000 : false),
    refetchOnWindowFocus: unlessNotFound,
    refetchOnReconnect: unlessNotFound,
    retryOnMount: unlessNotFound,
  })
}

export async function fetchRoomList(signal?: AbortSignal): Promise<RoomListItem[]> {
  const dtos = await http.get(endpoints.rooms(), roomListDtoSchema, {
    signal,
    timeoutMs: 90_000,
  })
  return dtos.map(toRoomListItem)
}

// 목록 응답으로 방 상세 캐시를 채우지 않는다.
export function roomListQueryOptions() {
  return queryOptions({
    queryKey: roomKeys.list(),
    queryFn: ({ signal }) => fetchRoomList(signal),
    refetchInterval: 30_000,
  })
}
