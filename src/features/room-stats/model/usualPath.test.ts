import { describe, expect, it } from 'vitest'
import { usualPath } from './usualPath'

const RANGE = { start: 480, end: 1440 }

describe('usualPath', () => {
  it('이어진 두 시간은 세로 이음이 있는 한 줄이다', () => {
    const d = usualPath(
      [
        { startMinute: 600, pct: 50 },
        { startMinute: 660, pct: 25 },
      ],
      RANGE.start,
      RANGE.end,
    )
    expect(d).toBe('M12.5 50H18.75V75H25')
    expect(d.match(/M/g)).toHaveLength(1)
  })

  it('비어 있는 시간이 있으면 이어 붙이지 않고 새로 시작한다', () => {
    const d = usualPath(
      [
        { startMinute: 600, pct: 50 },
        { startMinute: 720, pct: 25 },
      ],
      RANGE.start,
      RANGE.end,
    )
    expect(d).toBe('M12.5 50H18.75M25 75H31.25')
    expect(d.match(/M/g)).toHaveLength(2)
  })

  it('값이 없으면 빈 문자열이다', () => {
    expect(usualPath([], RANGE.start, RANGE.end)).toBe('')
  })
})
