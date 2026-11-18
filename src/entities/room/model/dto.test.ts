import { deployedRoomJson, interfacesRoomJson } from './__fixtures__'
import { roomDtoSchema } from './dto'

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
