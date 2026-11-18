import { v2Events } from './__fixtures__'
import { parseRoomEvent } from './events'

const seatEvent = v2Events[1]
const change = {
  seat_id: 'A-01',
  prev_status: 'OCCUPIED',
  curr_status: 'UNKNOWN',
  reason: 'EDGE_OFFLINE',
  status_since: '2026-11-24T10:16:11+09:00',
  last_observed_at: '2026-11-24T10:15:29+09:00',
}

function seatText(patch: Record<string, unknown> = {}, changePatch: Record<string, unknown> = {}) {
  return JSON.stringify({ ...seatEvent, ...patch, changes: [{ ...change, ...changePatch }] })
}

describe('parseRoomEvent', () => {
  it('EDGE_STATUS_CHANGED 를 도메인 값으로 바꾼다', () => {
    expect(parseRoomEvent(JSON.stringify(v2Events[0]))).toEqual({
      type: 'EDGE_STATUS_CHANGED',
      roomId: 'IT4-101',
      version: 2,
      edgeOnline: false,
    })
  })

  it('SEAT_UPDATED 를 도메인 값으로 바꾼다', () => {
    expect(parseRoomEvent(JSON.stringify(seatEvent))).toEqual({
      type: 'SEAT_UPDATED',
      roomId: 'IT4-101',
      version: 2,
      availableSeats: 0,
      unknownSeats: 1,
      congestionLevel: 'HIGH',
      changes: [
        {
          seatId: 'A-01',
          prevStatus: 'OCCUPIED',
          prevRawStatus: 'OCCUPIED',
          status: 'UNKNOWN',
          rawStatus: 'UNKNOWN',
          reason: 'EDGE_OFFLINE',
          statusSince: '2026-11-24T10:16:11+09:00',
          lastObservedAt: '2026-11-24T10:15:29+09:00',
        },
      ],
    })
  })

  it('소수점 초가 있는 UTC 시각을 받는다', () => {
    const event = parseRoomEvent(seatText({}, { status_since: '2026-11-24T01:16:11.004213Z' }))
    expect(event).toMatchObject({ changes: [{ statusSince: '2026-11-24T01:16:11.004213Z' }] })
  })

  it('last_observed_at 이 null 이면 null 로 둔다', () => {
    const event = parseRoomEvent(seatText({}, { last_observed_at: null }))
    expect(event).toMatchObject({ changes: [{ lastObservedAt: null }] })
  })

  it('모르는 status 는 UNRECOGNIZED 로 두고 원문을 남긴다', () => {
    const event = parseRoomEvent(seatText({}, { curr_status: 'SLEEPING', prev_status: 'NAPPING' }))
    expect(event).toMatchObject({
      changes: [
        {
          status: 'UNRECOGNIZED',
          rawStatus: 'SLEEPING',
          prevStatus: 'UNRECOGNIZED',
          prevRawStatus: 'NAPPING',
        },
      ],
    })
  })

  it('모르는 reason 과 congestion 은 UNRECOGNIZED 로 둔다', () => {
    const event = parseRoomEvent(
      seatText({ congestion_level: 'JAMMED' }, { reason: 'SOLAR_FLARE' }),
    )
    expect(event).toMatchObject({
      congestionLevel: 'UNRECOGNIZED',
      changes: [{ reason: 'UNRECOGNIZED' }],
    })
  })

  it.each([
    ['모르는 event 종류', '{"event":"ROOM_RENAMED"}'],
    ['JSON 이 아닌 글', 'not json'],
    ['필드가 빠진 SEAT_UPDATED', '{"event":"SEAT_UPDATED"}'],
    ['시각 형식이 틀린 변경', seatText({}, { status_since: 'yesterday' })],
  ])('%s 는 null', (_name, text) => {
    expect(parseRoomEvent(text)).toBeNull()
  })
})
