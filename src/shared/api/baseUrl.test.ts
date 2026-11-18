import { httpUrl, wsUrl, wsUrlFrom } from '@/shared/api'

test('https 출처는 wss 주소가 된다', () => {
  expect(wsUrlFrom('https://example.test', '/ws/rooms/IT4-101')).toBe(
    'wss://example.test/ws/rooms/IT4-101',
  )
})

test('http 출처는 ws 주소가 된다', () => {
  expect(wsUrlFrom('http://localhost:3000', '/ws/rooms/IT4-101')).toBe(
    'ws://localhost:3000/ws/rooms/IT4-101',
  )
})

test('wsUrl 은 현재 location 의 출처를 쓴다', () => {
  expect(wsUrl('/ws/rooms/IT4-101')).toBe(wsUrlFrom(location.origin, '/ws/rooms/IT4-101'))
})

test('httpUrl 은 현재 출처 기준의 URL 이다', () => {
  expect(httpUrl('/api/v1/rooms/IT4-101').href).toBe(
    new URL('/api/v1/rooms/IT4-101', location.origin).href,
  )
})
