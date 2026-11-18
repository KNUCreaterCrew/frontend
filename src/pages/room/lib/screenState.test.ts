import { ApiError } from '@/shared/api'
import { getLoadingStage, getRoomScreenState } from './screenState'

describe('getLoadingStage', () => {
  test('경과 시간에 따라 단계가 바뀐다', () => {
    expect(getLoadingStage(4999)).toBe('initial')
    expect(getLoadingStage(5000)).toBe('waking')
    expect(getLoadingStage(59_999)).toBe('waking')
    expect(getLoadingStage(60_000)).toBe('slow')
  })
})

describe('getRoomScreenState', () => {
  const notFound = new ApiError('http', { status: 404 })
  const serverError = new ApiError('http', { status: 500 })

  test('데이터가 있고 오류가 있으면 refreshFailed', () => {
    expect(
      getRoomScreenState({
        status: 'error',
        hasData: true,
        error: serverError,
        elapsedMs: 0,
        fetchStatus: 'idle',
      }),
    ).toBe('refreshFailed')
  })
  test('데이터가 있으면 ready', () => {
    expect(
      getRoomScreenState({
        status: 'success',
        hasData: true,
        error: null,
        elapsedMs: 0,
        fetchStatus: 'idle',
      }),
    ).toBe('ready')
  })
  test('404 는 notFound', () => {
    expect(
      getRoomScreenState({
        status: 'error',
        hasData: false,
        error: notFound,
        elapsedMs: 0,
        fetchStatus: 'idle',
      }),
    ).toBe('notFound')
  })
  test('그 밖의 오류는 error', () => {
    expect(
      getRoomScreenState({
        status: 'error',
        hasData: false,
        error: serverError,
        elapsedMs: 0,
        fetchStatus: 'idle',
      }),
    ).toBe('error')
  })
  test('대기 중이면 loading, 90초가 지나면 error', () => {
    expect(
      getRoomScreenState({
        status: 'pending',
        hasData: false,
        error: null,
        elapsedMs: 89_999,
        fetchStatus: 'fetching',
      }),
    ).toBe('loading')
    expect(
      getRoomScreenState({
        status: 'pending',
        hasData: false,
        error: null,
        elapsedMs: 90_000,
        fetchStatus: 'fetching',
      }),
    ).toBe('error')
  })
  test('오프라인으로 멈춘 조회는 시간이 지나도 loading', () => {
    expect(
      getRoomScreenState({
        status: 'pending',
        hasData: false,
        error: null,
        elapsedMs: 120_000,
        fetchStatus: 'paused',
      }),
    ).toBe('loading')
  })
})
