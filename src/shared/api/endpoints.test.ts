import { endpoints } from '@/shared/api'

test('방 ID 를 경로 조각으로 인코딩한다', () => {
  expect(endpoints.room('IT4-101')).toBe('/api/v1/rooms/IT4-101')
  expect(endpoints.room('A B/C')).toBe('/api/v1/rooms/A%20B%2FC')
  expect(endpoints.room('제1실')).toBe('/api/v1/rooms/%EC%A0%9C1%EC%8B%A4')
})
