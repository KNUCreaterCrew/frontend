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

afterEach(() => vi.unstubAllEnvs())

const ORIGIN = 'https://zeroframe-backend-p1wa.onrender.com'

test('VITE_API_ORIGIN 이 있으면 REST 와 WebSocket 이 그 출처로 간다', () => {
  vi.stubEnv('VITE_API_ORIGIN', ORIGIN)
  expect(httpUrl('/api/v1/rooms/IT4-101').href).toBe(`${ORIGIN}/api/v1/rooms/IT4-101`)
  expect(wsUrl('/ws/rooms/IT4-101')).toBe(
    'wss://zeroframe-backend-p1wa.onrender.com/ws/rooms/IT4-101',
  )
})

test('값 끝의 / 는 결과를 바꾸지 않는다', () => {
  vi.stubEnv('VITE_API_ORIGIN', `${ORIGIN}/`)
  expect(httpUrl('/api/v1/rooms').href).toBe(`${ORIGIN}/api/v1/rooms`)
})

test('빈 문자열은 값이 없는 것으로 보고 location 출처를 쓴다', () => {
  vi.stubEnv('VITE_API_ORIGIN', '')
  expect(httpUrl('/api/v1/rooms').origin).toBe(location.origin)
  expect(wsUrl('/ws/rooms/IT4-101')).toBe(wsUrlFrom(location.origin, '/ws/rooms/IT4-101'))
})
