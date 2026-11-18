import { act, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useDelayedVisibility } from './useDelayedVisibility'

beforeEach(() => vi.useFakeTimers())
afterEach(() => vi.useRealTimers())

const advance = (ms: number) => act(() => void vi.advanceTimersByTime(ms))

describe('useDelayedVisibility', () => {
  it('active 뒤 199ms 는 거짓, 200ms 는 참', () => {
    const { result } = renderHook(() => useDelayedVisibility(true))
    advance(199)
    expect(result.current).toBe(false)
    advance(1)
    expect(result.current).toBe(true)
  })

  it('보인 뒤 최소 400ms 는 유지한다', () => {
    const { result, rerender } = renderHook(({ a }) => useDelayedVisibility(a), {
      initialProps: { a: true },
    })
    advance(250)
    expect(result.current).toBe(true)
    rerender({ a: false })
    advance(349)
    expect(result.current).toBe(true)
    advance(1)
    expect(result.current).toBe(false)
  })

  it('200ms 전에 끝나면 끝까지 거짓', () => {
    const { result, rerender } = renderHook(({ a }) => useDelayedVisibility(a), {
      initialProps: { a: true },
    })
    advance(100)
    rerender({ a: false })
    advance(1000)
    expect(result.current).toBe(false)
  })

  it('최소 표시 시간은 처음 보인 때(200ms)부터 잰다', () => {
    const { result, rerender } = renderHook(({ a }) => useDelayedVisibility(a), {
      initialProps: { a: true },
    })
    advance(200)
    advance(250)
    rerender({ a: false })
    advance(149)
    expect(result.current).toBe(true)
    advance(1)
    expect(result.current).toBe(false)
  })

  it('최소 표시 시간 안에 다시 켜지면 깜빡이지 않고 유지한다', () => {
    const { result, rerender } = renderHook(({ a }) => useDelayedVisibility(a), {
      initialProps: { a: true },
    })
    advance(250)
    rerender({ a: false })
    advance(100)
    rerender({ a: true })
    advance(1000)
    expect(result.current).toBe(true)
  })
})
