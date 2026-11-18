import { deployedRoomJson, interfacesRoomJson } from './__fixtures__'
import { roomDtoSchema, roomListDtoSchema } from './dto'

describe('roomDtoSchema', () => {
  it('배포 응답 원문(Z, 마이크로초)을 받아들인다', () => {
    expect(roomDtoSchema.safeParse(deployedRoomJson).success).toBe(true)
  })

  it('INTERFACES 예시(+09:00)를 받아들인다', () => {
    expect(roomDtoSchema.safeParse(interfacesRoomJson).success).toBe(true)
  })

  it('좌석에 layout 이 없으면 실패한다', () => {
    const [first, ...rest] = interfacesRoomJson.seats
    const withoutLayout: Record<string, unknown> = { ...first! }
    delete withoutLayout.layout
    const result = roomDtoSchema.safeParse({
      ...interfacesRoomJson,
      seats: [withoutLayout, ...rest],
    })
    expect(result.success).toBe(false)
  })

  it('시간대 없는 status_since 는 실패한다', () => {
    const [first, ...rest] = interfacesRoomJson.seats
    const result = roomDtoSchema.safeParse({
      ...interfacesRoomJson,
      seats: [{ ...first!, status_since: '2026-11-18 08:22' }, ...rest],
    })
    expect(result.success).toBe(false)
  })

  it('모르는 status, reason, 혼잡도 문자열은 받아들인다', () => {
    const [first, ...rest] = interfacesRoomJson.seats
    const result = roomDtoSchema.safeParse({
      ...interfacesRoomJson,
      congestion_level: 'FULL',
      seats: [{ ...first!, status: 'RESERVED', reason: 'NEW_REASON' }, ...rest],
    })
    expect(result.success).toBe(true)
  })
})

describe('roomListDtoSchema', () => {
  const item = {
    room_id: 'IT4-101',
    room_name: '제1실습실 (예시)',
    total_seats: 1,
    available_seats: 0,
    unknown_seats: 0,
    congestion_level: 'HIGH',
    edge_online: true,
  }

  it('요약 항목 배열을 받아들인다', () => {
    expect(roomListDtoSchema.safeParse([item]).success).toBe(true)
  })

  it('빈 배열을 받아들인다', () => {
    expect(roomListDtoSchema.safeParse([]).success).toBe(true)
  })

  it('전부 확인 불가이고 연결이 끊긴 항목을 받아들인다', () => {
    const offline = {
      ...item,
      total_seats: 4,
      available_seats: 0,
      unknown_seats: 4,
      edge_online: false,
    }
    expect(roomListDtoSchema.safeParse([offline]).success).toBe(true)
  })

  it('edge_online 이 빠진 항목은 실패한다', () => {
    const rest: Record<string, unknown> = { ...item }
    delete rest.edge_online
    expect(roomListDtoSchema.safeParse([rest]).success).toBe(false)
  })

  it('모르는 congestion_level 도 받아들인다', () => {
    expect(roomListDtoSchema.safeParse([{ ...item, congestion_level: 'SOMETHING' }]).success).toBe(
      true,
    )
  })
})
