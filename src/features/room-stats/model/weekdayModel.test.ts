import { describe, expect, it } from 'vitest'
import { wcell, weekly } from './fixtures'
import { weekdaySentence } from './weekdayModel'

describe('weekdaySentence', () => {
  it('가장 붐비는 시와 가장 한산한 시를 말한다(동률은 이른 시)', () => {
    const w = weekly([
      wcell('TUE', 8, 2.6),
      wcell('TUE', 9, 2.6),
      wcell('TUE', 12, 1.5),
      wcell('TUE', 16, 0.7),
      wcell('TUE', 19, 2.6),
      wcell('MON', 10, 0),
    ])
    expect(weekdaySentence(w, 'TUE')).toBe('화요일은 보통 16시쯤 가장 붐비고 8시쯤 가장 한산해요.')
  })

  it('차이가 0.5 미만이면 차이가 크지 않다고 말한다', () => {
    const w = weekly([wcell('SAT', 10, 3), wcell('SAT', 11, 3.4)])
    expect(weekdaySentence(w, 'SAT')).toBe('토요일은 시간대별 차이가 크지 않아요.')
  })

  it('기록이 없는 요일', () => {
    const w = weekly([wcell('TUE', 8, null), wcell('MON', 8, 2)])
    expect(weekdaySentence(w, 'TUE')).toBe('이 요일은 아직 기록이 없어요.')
  })
})
