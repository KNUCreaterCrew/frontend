import { describe, expect, it } from 'vitest'
import {
  formatKstHour,
  formatKstTime,
  formatRelative,
  freshnessWarning,
  kstClock,
  lastObservedParts,
  timeParts,
} from './time'

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

describe('timeParts', () => {
  it('null 은 null', () => {
    expect(timeParts(null, now)).toBeNull()
  })
  it('오프셋 표기와 Z 표기가 같은 KST 시각', () => {
    expect(timeParts('2026-11-18T14:02:36+09:00', now)?.time).toBe('14:02:36')
    expect(timeParts('2026-11-18T05:02:36Z', now)?.time).toBe('14:02:36')
  })
  it('12초 뒤면 12초 전', () => {
    expect(timeParts('2026-11-18T05:02:36Z', now)?.relative).toBe('12초 전')
  })
  it('lastObservedParts 는 같은 함수', () => {
    expect(lastObservedParts).toBe(timeParts)
  })
})

describe('freshnessWarning', () => {
  it('갱신 시각이 없으면 null', () => {
    expect(freshnessWarning(null, false, now)).toBeNull()
  })
  it('59.999초는 경고 없음', () => {
    expect(freshnessWarning(now - 59_999, false, now)).toBeNull()
  })
  it('60초부터 1분 넘게 경고', () => {
    expect(freshnessWarning(now - 60_000, false, now)).toBe('1분 넘게 갱신되지 않았어요')
  })
  it('갱신 실패는 마지막으로 성공한 시각을 붙인다', () => {
    expect(freshnessWarning(now - 40_000, true, now)).toBe('갱신하지 못했어요, 40초 전 정보')
  })
  it('갱신 시각이 없는 실패는 시각 없이', () => {
    expect(freshnessWarning(null, true, now)).toBe('갱신하지 못했어요')
  })
  it('갱신 실패가 우선', () => {
    expect(freshnessWarning(now, true, now)).toBe('갱신하지 못했어요, 방금 정보')
  })
})

describe('kstClock', () => {
  it('UTC 01:15 는 KST 10:15 화요일', () => {
    expect(kstClock(Date.parse('2026-11-24T01:15:00Z'))).toEqual({
      date: '2026-11-24',
      weekday: 'TUE',
      hour: 10,
      minuteOfDay: 615,
    })
  })

  it('KST 자정은 다음 날 0시', () => {
    expect(kstClock(Date.parse('2026-11-23T15:00:00Z'))).toEqual({
      date: '2026-11-24',
      weekday: 'TUE',
      hour: 0,
      minuteOfDay: 0,
    })
  })

  it('자정 1분 전은 같은 날 23시 59분', () => {
    expect(kstClock(Date.parse('2026-11-23T14:59:00Z'))).toEqual({
      date: '2026-11-23',
      weekday: 'MON',
      hour: 23,
      minuteOfDay: 1439,
    })
  })
})

describe('formatKstHour', () => {
  it('시를 "9시" 로 쓴다', () => {
    expect(formatKstHour(9)).toBe('9시')
  })
})
