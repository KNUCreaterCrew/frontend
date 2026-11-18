import { ApiError } from '@/shared/api'
import { createQueryClient, roomRetry, roomRetryDelay } from './queryClient'

const networkErr = new ApiError('network')
const notFoundErr = new ApiError('http', { status: 404 })

test('재시도는 최대 8번까지, 다시 시도할 수 없는 오류는 바로 포기한다', () => {
  expect(roomRetry(0, networkErr)).toBe(true)
  expect(roomRetry(7, networkErr)).toBe(true)
  expect(roomRetry(8, networkErr)).toBe(false)
  expect(roomRetry(0, notFoundErr)).toBe(false)
})

test('대기 시간은 1초에서 두 배씩 늘고 10초에서 멈춘다', () => {
  expect(roomRetryDelay(0)).toBe(1000)
  expect(roomRetryDelay(3)).toBe(8000)
  expect(roomRetryDelay(4)).toBe(10000)
  expect(roomRetryDelay(10)).toBe(10000)
})

test('기본 queries 옵션에 방 재시도 정책이 걸려 있다', () => {
  const queries = createQueryClient().getDefaultOptions().queries
  expect(queries?.retry).toBe(roomRetry)
  expect(queries?.retryDelay).toBe(roomRetryDelay)
})
