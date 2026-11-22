import { endpoints } from '@/shared/api'

test('방 ID 를 경로 조각으로 인코딩한다', () => {
  expect(endpoints.room('IT4-101')).toBe('/api/v1/rooms/IT4-101')
  expect(endpoints.room('A B/C')).toBe('/api/v1/rooms/A%20B%2FC')
  expect(endpoints.room('제1실')).toBe('/api/v1/rooms/%EC%A0%9C1%EC%8B%A4')
})

test('방 소켓 경로도 방 ID 를 인코딩한다', () => {
  expect(endpoints.roomSocket('IT4-101')).toBe('/ws/rooms/IT4-101')
  expect(endpoints.roomSocket('A B/C')).toBe('/ws/rooms/A%20B%2FC')
})

test('방 목록 경로는 끝에 슬래시가 없다', () => {
  expect(endpoints.rooms()).toBe('/api/v1/rooms')
})

test('일별 통계 경로는 방 ID 를 인코딩하고 date 쿼리를 붙인다', () => {
  expect(endpoints.roomDailyStats('IT4 101', '2026-11-24')).toBe(
    '/api/v1/rooms/IT4%20101/stats/daily?date=2026-11-24',
  )
})

test('주간 통계 경로는 weeks 쿼리를 붙인다', () => {
  expect(endpoints.roomWeeklyStats('IT4-101', 4)).toBe('/api/v1/rooms/IT4-101/stats/weekly?weeks=4')
})
