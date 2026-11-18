import { ApiError, isRetryableError } from '@/shared/api'

test.each([
  ['network', new ApiError('network')],
  ['http 502', new ApiError('http', { status: 502 })],
  ['http 503', new ApiError('http', { status: 503 })],
  ['http 504', new ApiError('http', { status: 504 })],
])('%s 는 다시 시도한다', (_name, error) => {
  expect(isRetryableError(error)).toBe(true)
})

test.each([
  ['http 404', new ApiError('http', { status: 404 })],
  ['http 500', new ApiError('http', { status: 500 })],
  ['parse', new ApiError('parse')],
  ['timeout', new ApiError('timeout')],
  ['일반 Error', new Error('x')],
  ['undefined', undefined],
])('%s 는 다시 시도하지 않는다', (_name, error) => {
  expect(isRetryableError(error)).toBe(false)
})
