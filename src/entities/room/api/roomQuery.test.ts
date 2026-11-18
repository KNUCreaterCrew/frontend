import { ApiError } from '@/shared/api'
import { server } from '@mocks/node'
import { HttpResponse, http as mswHttp } from 'msw'
import { deployedRoomJson } from '../model/__fixtures__'
import { fetchRoom, roomKeys, roomQueryOptions } from './roomQuery'

describe('roomQuery', () => {
  it('roomKeys.detail 은 고정된 키를 만든다', () => {
    expect(roomKeys.detail('IT4-101')).toEqual(['rooms', 'detail', 'IT4-101'])
    expect(roomQueryOptions('IT4-101').queryKey).toEqual(['rooms', 'detail', 'IT4-101'])
  })

  it('fetchRoom 은 응답을 도메인 Room 으로 바꾼다', async () => {
    server.use(mswHttp.get('*/api/v1/rooms/:roomId', () => HttpResponse.json(deployedRoomJson)))
    const room = await fetchRoom('IT4-101')
    expect(room.roomName).toBe('제1실습실 (예시)')
    expect(room.seats).toHaveLength(4)
  })

  it('404 로 실패한 조회는 포커스, 재연결, 다시 마운트에서 다시 부르지 않는다', () => {
    const opts = roomQueryOptions('IT4-101')
    const q = (error: unknown) => ({ state: { error } }) as never
    const notFound = q(new ApiError('http', { status: 404 }))
    const serverError = q(new ApiError('http', { status: 500 }))
    for (const key of ['refetchOnWindowFocus', 'refetchOnReconnect', 'retryOnMount'] as const) {
      const fn = opts[key] as unknown as (query: never) => boolean
      expect(fn(notFound), key).toBe(false)
      expect(fn(serverError), key).toBe(true)
    }
  })
})
