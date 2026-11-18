import type { Room, RoomEvent, Seat } from '@/entities/room'
import { EventLog, isNewer, rebase } from './reconcile'

function seat(seatId: string, status: Seat['status'] = 'EMPTY'): Seat {
  return {
    seatId,
    label: seatId,
    status,
    rawStatus: status,
    reason: null,
    statusSince: '2026-11-24T10:00:00+09:00',
    lastObservedAt: null,
    hasOutlet: true,
    isWindow: false,
    layout: { x: 0, y: 0, width: 64, height: 48 },
  }
}

function room(version: number, statuses: Seat['status'][] = ['EMPTY', 'EMPTY']): Room {
  return {
    roomId: 'IT4-101',
    roomName: '제1실습실',
    totalSeats: 2,
    availableSeats: statuses.filter((s) => s === 'EMPTY').length,
    unknownSeats: 0,
    congestionLevel: 'LOW',
    edgeOnline: false,
    version,
    seats: statuses.map((status, i) => seat(i === 0 ? 'A-01' : 'A-02', status)),
  }
}

function seatEvent(
  version: number,
  seatId: string,
  prev: Seat['status'],
  next: Seat['status'],
): RoomEvent {
  return {
    type: 'SEAT_UPDATED',
    roomId: 'IT4-101',
    version,
    availableSeats: 0,
    unknownSeats: 0,
    congestionLevel: 'LOW',
    changes: [
      {
        seatId,
        prevStatus: prev,
        prevRawStatus: prev,
        status: next,
        rawStatus: next,
        reason: null,
        statusSince: '2026-11-24T10:05:00+09:00',
        lastObservedAt: null,
      },
    ],
  }
}

function edgeEvent(version: number, edgeOnline: boolean): RoomEvent {
  return { type: 'EDGE_STATUS_CHANGED', roomId: 'IT4-101', version, edgeOnline }
}

describe('isNewer', () => {
  it('기준보다 큰 version 만 참이다', () => {
    expect(isNewer(room(2), edgeEvent(3, true))).toBe(true)
    expect(isNewer(room(2), edgeEvent(2, true))).toBe(false)
    expect(isNewer(room(2), edgeEvent(1, true))).toBe(false)
  })
})

describe('rebase', () => {
  it('기준 이하 이벤트는 버리고 큰 것만 얹는다', () => {
    const v1 = seatEvent(1, 'A-01', 'EMPTY', 'OCCUPIED')
    const v2 = seatEvent(2, 'A-02', 'EMPTY', 'AWAY')
    const v3 = seatEvent(3, 'A-01', 'OCCUPIED', 'EMPTY')
    const result = rebase(room(2, ['OCCUPIED', 'AWAY']), [v1, v2, v3])
    expect(result.seats.map((s) => s.status)).toEqual(['EMPTY', 'AWAY'])
  })

  it('기준 v0 에 같은 version 의 EDGE 와 SEAT 를 둘 다 얹는다', () => {
    const result = rebase(room(0), [edgeEvent(1, true), seatEvent(1, 'A-01', 'EMPTY', 'OCCUPIED')])
    expect(result.edgeOnline).toBe(true)
    expect(result.seats[0]?.status).toBe('OCCUPIED')
  })

  it('결과 version 은 snapshot.version 그대로다', () => {
    const result = rebase(room(0), [seatEvent(5, 'A-01', 'EMPTY', 'OCCUPIED')])
    expect(result.version).toBe(0)
  })

  it('서버 재시작으로 작아진 기준 뒤의 v1 이벤트를 반영한다', () => {
    const fresh = room(0)
    const result = rebase(fresh, [seatEvent(1, 'A-01', 'EMPTY', 'OCCUPIED')])
    expect(result.seats[0]?.status).toBe('OCCUPIED')
  })

  it('다시 조회가 필요한 이벤트는 건너뛰고 뒤 이벤트는 계속 얹는다', () => {
    const unknownSeat = seatEvent(1, 'Z-99', 'EMPTY', 'OCCUPIED')
    const ok = seatEvent(2, 'A-02', 'EMPTY', 'AWAY')
    const result = rebase(room(0), [unknownSeat, ok])
    expect(result.seats.map((s) => s.status)).toEqual(['EMPTY', 'AWAY'])
  })

  it('이벤트가 없으면 같은 객체를 돌려준다', () => {
    const snapshot = room(3)
    expect(rebase(snapshot, [])).toBe(snapshot)
  })
})

describe('EventLog', () => {
  const a = edgeEvent(1, true)
  const b = edgeEvent(2, false)
  const c = edgeEvent(3, true)

  it('표시 뒤에 받은 이벤트만 받은 순서로 돌려준다', () => {
    const log = new EventLog()
    log.push(a)
    const m = log.mark()
    log.push(b)
    log.push(c)
    expect(log.since(m)).toEqual([b, c])
  })

  it('활성 표시가 모두 해제되면 기록을 비운다', () => {
    const log = new EventLog()
    const m = log.mark()
    log.push(a)
    log.release(m)
    expect(log.since(log.mark())).toEqual([])
  })

  it('표시가 겹쳐도 각자 자기 뒤 기록을 본다', () => {
    const log = new EventLog()
    const m1 = log.mark()
    log.push(a)
    const m2 = log.mark()
    log.push(b)
    expect(log.since(m1)).toEqual([a, b])
    expect(log.since(m2)).toEqual([b])
  })

  it('먼저 만든 표시만 해제해도 남은 표시의 기록은 남는다', () => {
    const log = new EventLog()
    const m1 = log.mark()
    log.push(a)
    const m2 = log.mark()
    log.push(b)
    log.release(m1)
    expect(log.since(m2)).toEqual([b])
  })

  it('활성 표시가 없을 때 push 한 이벤트는 쌓이지 않는다', () => {
    const log = new EventLog()
    log.push(a)
    log.push(b)
    expect(log.size()).toBe(0)
  })
})
