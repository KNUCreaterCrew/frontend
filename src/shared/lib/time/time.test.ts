import { describe, expect, it } from 'vitest'
import { formatKstTime, lastObservedParts, formatRelative } from './time'

const now = Date.parse('2026-11-18T05:02:48Z')

describe('formatRelative', () => {
  it('1초 미만은 방금', () => {
    expect(formatRelative(now - 500, now)).toBe('방금')
  })
  it('60초 미만은 N초 전', () => {
    expect(formatRelative(now - 12_000, now)).toBe('12초 전')
  })
  it('60분 미만은 N분 전', () => {
    expect(formatRelative(now - 180_000, now)).toBe('3분 전')
  })
  it('그 밖은 N시간 전', () => {
    expect(formatRelative(now - 7_200_000, now)).toBe('2시간 전')
  })
  it('ISO 문자열도 같은 결과', () => {
    expect(formatRelative(new Date(now - 12_000).toISOString(), now)).toBe('12초 전')
  })
})

describe('formatKstTime', () => {
  it('UTC 를 KST HH:MM:SS 로', () => {
    expect(formatKstTime('2026-11-18T05:02:48Z')).toBe('14:02:48')
  })
  it('소수 초를 무시한다', () => {
    expect(formatKstTime('2026-11-18T08:22:33.079046Z')).toBe('17:22:33')
  })
  it('오프셋이 있는 입력', () => {
    expect(formatKstTime('2026-11-24T10:15:29+09:00')).toBe('10:15:29')
  })
})

describe('lastObservedParts', () => {
  it('null 은 null', () => {
    expect(lastObservedParts(null, now)).toBeNull()
  })
  it('상대 시각과 절대 시각을 나눠서 준다', () => {
    expect(lastObservedParts('2026-11-18T05:02:36Z', now)).toEqual({
      relative: '12초 전',
      time: '14:02:36',
    })
  })
})
