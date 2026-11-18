import { congestionLabel, seatAccessibleName, seatReasonLabel, seatStatusLabel } from './labels'
import type { Seat } from './types'

function seat(label: string, status: Seat['status'], hasOutlet: boolean): Seat {
  return {
    seatId: label,
    label,
    status,
    rawStatus: status,
    reason: null,
    statusSince: '2026-11-18T10:00:00+09:00',
    lastObservedAt: null,
    hasOutlet,
    isWindow: false,
    layout: { x: 0, y: 0, width: 64, height: 48 },
  }
}

describe('labels', () => {
  it('좌석 상태 말', () => {
    expect(seatStatusLabel('EMPTY')).toBe('빈자리')
    expect(seatStatusLabel('OCCUPIED')).toBe('사용 중')
    expect(seatStatusLabel('AWAY')).toBe('짐 있음')
    expect(seatStatusLabel('UNKNOWN')).toBe('확인 불가')
    expect(seatStatusLabel('UNRECOGNIZED')).toBe('알 수 없는 상태')
  })

  it('혼잡도 말', () => {
    expect(congestionLabel('LOW')).toBe('여유')
    expect(congestionLabel('MODERATE')).toBe('보통')
    expect(congestionLabel('HIGH')).toBe('혼잡')
    expect(congestionLabel('UNRECOGNIZED')).toBe('알 수 없음')
  })

  it('접근 가능한 이름', () => {
    expect(seatAccessibleName(seat('A1', 'EMPTY', true))).toBe('A1 빈자리, 콘센트 있음')
    expect(seatAccessibleName(seat('A2', 'OCCUPIED', false))).toBe('A2 사용 중')
    expect(seatAccessibleName(seat('B2', 'UNKNOWN', false))).toBe('B2 확인 불가')
    expect(seatAccessibleName(seat('A1', 'UNRECOGNIZED', true))).toBe(
      'A1 알 수 없는 상태, 콘센트 있음',
    )
  })
})

describe('seatReasonLabel', () => {
  it.each([
    ['OCCLUDED', '무언가에 가려 자리가 보이지 않아요'],
    ['LOW_CONFIDENCE', '자리가 잘 보이지 않아 판단하지 못했어요'],
    ['MODEL_CONFLICT', '판단이 엇갈려 확인하지 못했어요'],
    ['VLM_TIMEOUT', '확인하는 데 시간이 오래 걸려 아직 몰라요'],
    ['STALE_OBSERVATION', '한동안 새로 확인하지 못했어요'],
    ['EDGE_OFFLINE', '장치 연결이 끊겨 지금은 확인할 수 없어요'],
    ['UNRECOGNIZED', '이유를 알 수 없어요'],
    [null, '이유 정보가 없어요'],
  ] as const)('%s', (reason, text) => {
    expect(seatReasonLabel(reason)).toBe(text)
  })
})
