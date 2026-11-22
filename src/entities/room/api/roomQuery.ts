import { queryOptions } from '@tanstack/react-query'
import { endpoints, http, isNotFoundError } from '@/shared/api'
import { roomDtoSchema, roomListDtoSchema } from '../model/dto'
import { toRoom, toRoomListItem } from '../model/mapping'
import type { Room, RoomListItem } from '../model/types'

export const roomKeys = {
  all: ['rooms'] as const,
  list: () => ['rooms', 'list'] as const,
  detail: (roomId: string) => ['rooms', 'detail', roomId] as const,
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
