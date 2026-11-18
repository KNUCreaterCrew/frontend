import type { RoomEvent, SeatChange } from '@/entities/room'
import {
  addHighlights,
  dropVersion,
  HIGHLIGHT_MS,
  highlightTargets,
  MAX_HIGHLIGHTS,
  pruneHighlights,
} from './highlight'
import type { Highlight } from './highlight'

function change(
  seatId: string,
  prev: SeatChange['prevStatus'],
  next: SeatChange['status'],
): SeatChange {
  return {
    seatId,
    prevStatus: prev,
    prevRawStatus: prev,
    status: next,
    rawStatus: next,
    reason: null,
    statusSince: '2026-11-24T10:05:00+09:00',
    lastObservedAt: null,
  }
}

function seatEvent(version: number, changes: SeatChange[]): RoomEvent {
  return {
    type: 'SEAT_UPDATED',
    roomId: 'IT4-101',
    version,
    availableSeats: 0,
    unknownSeats: 0,
    congestionLevel: 'LOW',
    changes,
  }
}

describe('highlightTargets', () => {
  it('상태가 바뀐 좌석만 대상이 된다', () => {
    const event = seatEvent(4, [change('A-01', 'OCCUPIED', 'EMPTY')])
    expect(highlightTargets(event, new Set())).toEqual([
      { seatId: 'A-01', status: 'EMPTY', version: 4 },
    ])
  })

  it('사유만 바뀐 변경은 대상이 아니다', () => {
    const event = seatEvent(4, [change('A-01', 'UNKNOWN', 'UNKNOWN')])
    expect(highlightTargets(event, new Set())).toEqual([])
  })

  it('같은 version 의 EDGE 변경이 있었으면 대상이 아니다', () => {
    const event = seatEvent(4, [change('A-01', 'OCCUPIED', 'UNKNOWN')])
    expect(highlightTargets(event, new Set([4]))).toEqual([])
  })

  it('EDGE 이벤트는 대상이 없다', () => {
    const event: RoomEvent = {
      type: 'EDGE_STATUS_CHANGED',
      roomId: 'IT4-101',
      version: 4,
      edgeOnline: true,
    }
    expect(highlightTargets(event, new Set())).toEqual([])
  })
})

describe('addHighlights', () => {
  const target = (seatId: string, version = 1) => ({ seatId, status: 'EMPTY' as const, version })

  it('until 은 now 에서 HIGHLIGHT_MS 뒤다', () => {
    expect(addHighlights([], [target('A-01')], 1000)).toEqual([
      { seatId: 'A-01', status: 'EMPTY', version: 1, until: 1000 + HIGHLIGHT_MS },
    ])
    expect(HIGHLIGHT_MS).toBe(5000)
  })

  it('3석이 차례로 강조되면 마지막 2석만 남는다', () => {
    let list: Highlight[] = []
    list = addHighlights(list, [target('A-01')], 0)
    list = addHighlights(list, [target('A-02')], 10)
    list = addHighlights(list, [target('A-03')], 20)
    expect(MAX_HIGHLIGHTS).toBe(2)
    expect(list.map((h) => h.seatId)).toEqual(['A-02', 'A-03'])
  })

  it('같은 좌석이 다시 바뀌면 until 을 새로 잡고 개수는 늘지 않는다', () => {
    let list = addHighlights([], [target('A-01', 1)], 0)
    list = addHighlights(list, [target('A-01', 2)], 3000)
    expect(list).toEqual([{ seatId: 'A-01', status: 'EMPTY', version: 2, until: 8000 }])
  })
})

describe('pruneHighlights, dropVersion', () => {
  const list: Highlight[] = [
    { seatId: 'A-01', status: 'EMPTY', version: 7, until: 5000 },
    { seatId: 'A-02', status: 'AWAY', version: 8, until: 9000 },
  ]

  it('until 이 now 이하인 항목을 지운다', () => {
    expect(pruneHighlights(list, 4999)).toHaveLength(2)
    expect(pruneHighlights(list, 5000).map((h) => h.seatId)).toEqual(['A-02'])
  })

  it('그 version 의 항목만 지운다', () => {
    expect(dropVersion(list, 7).map((h) => h.seatId)).toEqual(['A-02'])
  })
})
