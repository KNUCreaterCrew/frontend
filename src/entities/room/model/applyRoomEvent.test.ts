import { startupRoomDto, v1Events, v1RoomDto, v2Events, v3Events } from './__fixtures__'
import { applyRoomEvent } from './applyRoomEvent'
import { parseRoomEvent } from './events'
import { toRoom } from './mapping'
import type { Room, RoomEvent } from './types'

function ev(dto: unknown): RoomEvent {
  const event = parseRoomEvent(JSON.stringify(dto))
  if (!event) throw new Error('fixture 이벤트를 읽지 못했다')
  return event
}

function applyAll(room: Room, events: readonly unknown[]): Room {
  return events.reduce<Room>((current, dto) => applyRoomEvent(current, ev(dto)).room, room)
}

function firstSeat(room: Room) {
  const seat = room.seats[0]
  if (!seat) throw new Error('좌석 없음')
  return seat
}

describe('applyRoomEvent 예시 흐름', () => {
  const startup = toRoom(startupRoomDto)
  const afterV1 = applyAll(startup, v1Events)

  it('10:15:30 v1 이벤트 두 개를 반영한다', () => {
    expect(afterV1.edgeOnline).toBe(true)
    expect(firstSeat(afterV1)).toMatchObject({
      status: 'OCCUPIED',
      reason: null,
      statusSince: '2026-11-24T10:15:29+09:00',
      lastObservedAt: '2026-11-24T10:15:29+09:00',
    })
    expect([afterV1.availableSeats, afterV1.unknownSeats, afterV1.congestionLevel]).toEqual([
      0,
      0,
      'HIGH',
    ])
    expect(afterV1.version).toBe(0)
  })

  it('10:15:40 반영 결과가 방 조회 응답과 같다(version 제외)', () => {
    const fetched = toRoom(v1RoomDto)
    expect({ ...afterV1, version: fetched.version }).toEqual(fetched)
  })

  it('10:16:11 v2 이벤트로 확인 불가가 된다', () => {
    const room = applyAll(afterV1, v2Events)
    expect(room.edgeOnline).toBe(false)
    expect(firstSeat(room)).toMatchObject({
      status: 'UNKNOWN',
      reason: 'EDGE_OFFLINE',
      statusSince: '2026-11-24T10:16:11+09:00',
      lastObservedAt: '2026-11-24T10:15:29+09:00',
    })
    expect([room.availableSeats, room.unknownSeats, room.congestionLevel]).toEqual([0, 1, 'HIGH'])
  })

  it('10:17:05 v3 이벤트로 다시 점유가 된다', () => {
    const room = applyAll(applyAll(afterV1, v2Events), v3Events)
    expect(room.edgeOnline).toBe(true)
    expect(firstSeat(room)).toMatchObject({
      status: 'OCCUPIED',
      reason: null,
      statusSince: '2026-11-24T10:17:04+09:00',
      lastObservedAt: '2026-11-24T10:17:04+09:00',
    })
  })

  it('같은 version 의 SEAT 가 EDGE 보다 먼저 와도 결과가 같다', () => {
    const [edge, seat] = v2Events
    expect(applyAll(afterV1, [seat, edge])).toEqual(applyAll(afterV1, [edge, seat]))
  })
})

describe('applyRoomEvent 경계', () => {
  const twoSeats: Room = (() => {
    const base = toRoom(v1RoomDto)
    const seat = firstSeat(base)
    return {
      ...base,
      totalSeats: 2,
      seats: [seat, { ...seat, seatId: 'A-02', label: 'A2' }],
    }
  })()

  it('한 좌석만 바뀌면 다른 좌석은 같은 참조다', () => {
    const { room, needsRefetch } = applyRoomEvent(twoSeats, ev(v2Events[1]))
    expect(needsRefetch).toBe(false)
    expect(room.seats[0]).not.toBe(twoSeats.seats[0])
    expect(room.seats[0]).toMatchObject({ status: 'UNKNOWN' })
    expect(room.seats[1]).toBe(twoSeats.seats[1])
    expect(room.totalSeats).toBe(2)
    expect(room.version).toBe(twoSeats.version)
  })

  it('바뀐 것 없는 EDGE 는 같은 Room 참조다', () => {
    const result = applyRoomEvent(twoSeats, ev(v1Events[0]))
    expect(result.room).toBe(twoSeats)
    expect(result.needsRefetch).toBe(false)
  })

  it('다른 방 이벤트는 무시한다', () => {
    const other = { ...v2Events[1], room_id: 'OTHER' }
    const result = applyRoomEvent(twoSeats, ev(other))
    expect(result.room).toBe(twoSeats)
    expect(result.needsRefetch).toBe(false)
  })

  it('모르는 seatId 는 반영하지 않고 재조회를 요청한다', () => {
    const seat = v2Events[1]
    const unknown = { ...seat, changes: [{ ...seat.changes[0], seat_id: 'Z-99' }] }
    const result = applyRoomEvent(twoSeats, ev(unknown))
    expect(result.room).toBe(twoSeats)
    expect(result.needsRefetch).toBe(true)
  })

  it('prev_status 가 맞지 않으면 반영하지 않고 재조회를 요청한다', () => {
    const seat = v2Events[1]
    const stale = { ...seat, changes: [{ ...seat.changes[0], prev_status: 'EMPTY' }] }
    const result = applyRoomEvent(twoSeats, ev(stale))
    expect(result.room).toBe(twoSeats)
    expect(result.needsRefetch).toBe(true)
  })

  it('변경 중 하나라도 맞지 않으면 이벤트 전체를 반영하지 않는다', () => {
    const seat = v2Events[1]
    const mixed = {
      ...seat,
      changes: [seat.changes[0], { ...seat.changes[0], seat_id: 'A-02', prev_status: 'EMPTY' }],
    }
    const result = applyRoomEvent(twoSeats, ev(mixed))
    expect(result.room).toBe(twoSeats)
    expect(result.needsRefetch).toBe(true)
  })
})
