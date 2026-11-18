import { act, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useElapsed } from './useElapsed'

beforeEach(() => vi.useFakeTimers())
afterEach(() => vi.useRealTimers())

const advance = (ms: number) => act(() => void vi.advanceTimersByTime(ms))

describe('useElapsed', () => {
  it('active 가 거짓이면 0', () => {
    const { result } = renderHook(() => useElapsed(false, 0))
    advance(5000)
    expect(result.current).toBe(0)
  })

  it('active 뒤 5000ms 진행하면 5000 이상', () => {
    const { result } = renderHook(() => useElapsed(true, 0))
    advance(5000)
    expect(result.current).toBeGreaterThanOrEqual(5000)
  })

  it('restartKey 가 바뀌면 0 근처로 돌아간다', () => {
    const { result, rerender } = renderHook(({ k }) => useElapsed(true, k), {
      initialProps: { k: 0 },
    })
    advance(5000)
    rerender({ k: 1 })
    expect(result.current).toBeLessThan(1000)
  })
})
