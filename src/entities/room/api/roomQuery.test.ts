import { ApiError } from '@/shared/api'
import { server } from '@mocks/node'
import { HttpResponse, http as mswHttp } from 'msw'
import { deployedRoomJson } from '../model/__fixtures__'
import {
  fetchRoom,
  fetchRoomList,
  roomKeys,
  roomListQueryOptions,
  roomQueryOptions,
} from './roomQuery'

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

describe('roomListQuery', () => {
  it('roomKeys.list 는 상세 키와 다른 고정 키이다', () => {
    expect(roomKeys.list()).toEqual(['rooms', 'list'])
    expect(roomKeys.list()).not.toEqual(roomKeys.detail('x'))
    expect(roomListQueryOptions().queryKey).toEqual(['rooms', 'list'])
  })

  it('30초마다 다시 조회한다', () => {
    expect(roomListQueryOptions().refetchInterval).toBe(30000)
  })

  it('fetchRoomList 는 응답을 RoomListItem 배열로 바꾼다', async () => {
    server.use(
      mswHttp.get('*/api/v1/rooms', () =>
        HttpResponse.json([
          {
            room_id: 'IT4-101',
            room_name: '제1실습실 (예시)',
            total_seats: 4,
            available_seats: 1,
            unknown_seats: 1,
            congestion_level: 'MODERATE',
            edge_online: true,
          },
        ]),
      ),
    )
    expect(await fetchRoomList()).toEqual([
      {
        roomId: 'IT4-101',
        roomName: '제1실습실 (예시)',
        totalSeats: 4,
        availableSeats: 1,
        unknownSeats: 1,
        congestionLevel: 'MODERATE',
        edgeOnline: true,
      },
    ])
  })
})
