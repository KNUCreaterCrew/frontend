import { toRoom } from '@/entities/room'
import type { Seat } from '@/entities/room'
import { mixedRoom } from '@mocks/fixtures/rooms'
import { v1RoomDto } from '@mocks/fixtures/interfacesFlow'
import { seatChangeNotice, sheetContent } from './sheetContent'

const NOW = Date.parse('2026-11-18T05:02:48Z')
const a1 = toRoom(mixedRoom).seats[0]!

function withSeat(patch: Partial<Seat>): Seat {
  return { ...a1, ...patch }
}

test('빈자리 A1 은 fixture 값대로 내용이 만들어진다', () => {
  expect(sheetContent(a1, NOW)).toEqual({
    seatLabel: 'A1',
    statusLabel: '빈자리',
    statusTone: 'empty',
    title: 'A1 빈자리',
    reason: null,
    tone: 'empty',
    rows: [
      { key: 'place', label: '자리', value: '창가' },
      { key: 'outlet', label: '콘센트', value: '있음' },
      { key: 'lastObserved', label: '마지막 확인', value: '12초 전 (14:02:36)' },
      { key: 'statusSince', label: '상태가 바뀐 때', value: '2분 전 (14:00:00)' },
    ],
  })
})

test('창가 아님과 콘센트 없음', () => {
  const rows = sheetContent(withSeat({ isWindow: false, hasOutlet: false }), NOW).rows
  expect(rows[0]?.value).toBe('창가 아님')
  expect(rows[1]?.value).toBe('없음')
})

test('lastObservedAt 이 null 이면 아직 확인하지 못함', () => {
  const row = sheetContent(withSeat({ lastObservedAt: null }), NOW).rows[2]
  expect(row).toEqual({ key: 'lastObserved', label: '마지막 확인', value: '아직 확인하지 못함' })
})

test('INTERFACES v2 좌석은 장치 연결 끊김 이유와 빗금 띠', () => {
  const dto = {
    ...v1RoomDto,
    seats: [
      {
        ...v1RoomDto.seats[0]!,
        status: 'UNKNOWN',
        reason: 'EDGE_OFFLINE',
        status_since: '2026-11-24T10:16:11+09:00',
        last_observed_at: '2026-11-24T10:15:29+09:00',
      },
    ],
  }
  const seat = toRoom(dto).seats[0]!
  const content = sheetContent(seat, Date.parse('2026-11-24T10:16:20+09:00'))
  expect(content.reason).toBe('장치 연결이 끊겨 지금은 확인할 수 없어요')
  expect(content.tone).toBe('unknown')
  expect(content.statusTone).toBe('ink')
  expect(content.title).toBe('A1 확인 불가')
  expect(content.rows[2]?.value).toBe('51초 전 (10:15:29)')
  expect(content.rows[3]?.value).toBe('9초 전 (10:16:11)')
})

test('UNKNOWN 인데 이유가 없으면 이유 정보 없음 문구', () => {
  expect(sheetContent(withSeat({ status: 'UNKNOWN', reason: null }), NOW).reason).toBe(
    '이유 정보가 없어요',
  )
})

test('UNKNOWN 인데 모르는 이유 코드는 이유를 알 수 없음', () => {
  expect(sheetContent(withSeat({ status: 'UNKNOWN', reason: 'UNRECOGNIZED' }), NOW).reason).toBe(
    '이유를 알 수 없어요',
  )
})

test('UNRECOGNIZED 상태는 이유 없이 빗금 띠', () => {
  const content = sheetContent(
    withSeat({ status: 'UNRECOGNIZED', rawStatus: 'BROKEN', reason: 'OCCLUDED' }),
    NOW,
  )
  expect(content.reason).toBeNull()
  expect(content.tone).toBe('unknown')
  expect(content.statusLabel).toBe('알 수 없는 상태')
  expect(content.statusTone).toBe('ink')
})

test.each([
  ['OCCUPIED', 'occupied'],
  ['AWAY', 'away'],
] as const)('%s 는 %s 견본과 ink 글자', (status, tone) => {
  const content = sheetContent(withSeat({ status }), NOW)
  expect(content.tone).toBe(tone)
  expect(content.statusTone).toBe('ink')
  expect(content.reason).toBeNull()
})

test('상태가 같으면 알림이 없다', () => {
  expect(seatChangeNotice(a1, withSeat({ lastObservedAt: null }))).toBeNull()
})

test('OCCUPIED 에서 UNKNOWN 으로 바뀌면 알림', () => {
  const prev = withSeat({ status: 'OCCUPIED' })
  expect(seatChangeNotice(prev, withSeat({ status: 'UNKNOWN', reason: 'OCCLUDED' }))).toBe(
    'A1 지금 확인 불가',
  )
})

test('이유만 바뀌면 알림이 없다', () => {
  const prev = withSeat({ status: 'UNKNOWN', reason: 'OCCLUDED' })
  expect(seatChangeNotice(prev, withSeat({ status: 'UNKNOWN', reason: 'EDGE_OFFLINE' }))).toBeNull()
})
