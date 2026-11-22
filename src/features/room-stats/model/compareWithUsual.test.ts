import { describe, expect, it } from 'vitest'
import type { RoomSummary, WeeklyCell } from '@/entities/room'
import { compareWithUsual, comparisonSentence } from './compareWithUsual'

function known(available: number, unknown: number, total = 4): RoomSummary {
  return {
    kind: 'known',
    availableSeats: available,
    totalSeats: total,
    unknownSeats: unknown,
    congestionLevel: 'MODERATE',
  }
}

function cell(overrides: Partial<WeeklyCell> = {}): WeeklyCell {
  return {
    weekday: 'TUE',
    hour: 10,
    observedMinutes: 170,
    observedDays: 3,
    avgAvailableSeats: 2.1,
    avgUnknownSeats: 0,
    congestionLevel: 'MODERATE',
    ...overrides,
  }
}

describe('compareWithUsual', () => {
  it('4석 방에서 평소 2.1석이면 4석은 한산, 2석은 비슷, 1석은 붐빔', () => {
    expect(compareWithUsual(known(4, 0), cell(), 4)).toBe('quieter')
    expect(compareWithUsual(known(2, 0), cell(), 4)).toBe('similar')
    expect(compareWithUsual(known(1, 0), cell(), 4)).toBe('busier')
  })

  it('확인 불가 때문에 갈리면 null', () => {
    expect(compareWithUsual(known(1, 1), cell(), 4)).toBeNull()
  })

  it('평소 평균이 없으면 null', () => {
    expect(compareWithUsual(known(4, 0), cell({ avgAvailableSeats: null }), 4)).toBeNull()
    expect(compareWithUsual(known(4, 0), undefined, 4)).toBeNull()
  })

  it('관측 일수가 2 미만이면 null', () => {
    expect(compareWithUsual(known(4, 0), cell({ observedDays: 1 }), 4)).toBeNull()
  })

  it('통계 전체 좌석 수가 방과 다르면 null', () => {
    expect(compareWithUsual(known(4, 0), cell(), 5)).toBeNull()
  })

  it('방 전체가 확인 불가이면 null', () => {
    const summary: RoomSummary = {
      kind: 'allUnknown',
      totalSeats: 4,
      unknownSeats: 4,
      latestObservedAt: null,
    }
    expect(compareWithUsual(summary, cell(), 4)).toBeNull()
  })

  it('40석 방은 기준이 8석이다', () => {
    const usual = cell({ avgAvailableSeats: 20 })
    expect(compareWithUsual(known(28, 0, 40), usual, 40)).toBe('quieter')
    expect(compareWithUsual(known(27, 0, 40), usual, 40)).toBe('similar')
  })
})

describe('comparisonSentence', () => {
  it('요일 이름을 넣은 문장을 만든다', () => {
    expect(comparisonSentence('quieter', 'TUE')).toBe('지금은 평소 화요일 이 시간보다 한산해요.')
    expect(comparisonSentence('similar', 'TUE')).toBe('지금은 평소 화요일 이 시간과 비슷해요.')
    expect(comparisonSentence('busier', 'TUE')).toBe('지금은 평소 화요일 이 시간보다 붐벼요.')
  })
})
