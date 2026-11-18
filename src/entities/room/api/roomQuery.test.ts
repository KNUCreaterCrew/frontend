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
})
