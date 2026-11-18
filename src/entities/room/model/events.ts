import { z } from 'zod'
import { toCongestion, toReason, toStatus } from './mapping'
import type { RoomEvent } from './types'

const isoTime = z.iso.datetime({ offset: true })

// status, reason, congestion_level 은 서버가 새 값을 보내도 이벤트가 버려지지 않게 문자열로 받는다.
const seatChangeDtoSchema = z.object({
  seat_id: z.string(),
  prev_status: z.string(),
  curr_status: z.string(),
  reason: z.string().nullable(),
  status_since: isoTime,
  last_observed_at: isoTime.nullable(),
})

const edgeStatusChangedDtoSchema = z.object({
  event: z.literal('EDGE_STATUS_CHANGED'),
  room_id: z.string(),
  version: z.int(),
  edge_online: z.boolean(),
})

const seatUpdatedDtoSchema = z.object({
  event: z.literal('SEAT_UPDATED'),
  room_id: z.string(),
  version: z.int(),
  available_seats: z.int(),
  unknown_seats: z.int(),
  congestion_level: z.string(),
  changes: z.array(seatChangeDtoSchema),
})

const roomEventDtoSchema = z.discriminatedUnion('event', [
  edgeStatusChangedDtoSchema,
  seatUpdatedDtoSchema,
])

export type RoomEventDto = z.infer<typeof roomEventDtoSchema>

function toRoomEvent(dto: RoomEventDto): RoomEvent {
  if (dto.event === 'EDGE_STATUS_CHANGED') {
    return {
      type: 'EDGE_STATUS_CHANGED',
      roomId: dto.room_id,
      version: dto.version,
      edgeOnline: dto.edge_online,
    }
  }
  return {
    type: 'SEAT_UPDATED',
    roomId: dto.room_id,
    version: dto.version,
    availableSeats: dto.available_seats,
    unknownSeats: dto.unknown_seats,
    congestionLevel: toCongestion(dto.congestion_level),
    changes: dto.changes.map((change) => ({
      seatId: change.seat_id,
      prevStatus: toStatus(change.prev_status),
      prevRawStatus: change.prev_status,
      status: toStatus(change.curr_status),
      rawStatus: change.curr_status,
      reason: toReason(change.reason),
      statusSince: change.status_since,
      lastObservedAt: change.last_observed_at,
    })),
  }
}

const KNOWN_EVENTS: ReadonlySet<string> = new Set(['EDGE_STATUS_CHANGED', 'SEAT_UPDATED'])

export type RoomMessage =
  | { kind: 'event'; event: RoomEvent }
  /** JSON 이지만 모르는 event 종류: 조용히 무시한다 */
  | { kind: 'ignore' }
  /** 읽을 수 없거나 아는 종류인데 모양이 틀린 메시지: 방을 다시 조회한다 */
  | { kind: 'invalid' }

export function parseRoomMessage(text: string): RoomMessage {
  let json: unknown
  try {
    json = JSON.parse(text)
  } catch {
    return { kind: 'invalid' }
  }
  if (typeof json !== 'object' || json === null || Array.isArray(json)) return { kind: 'invalid' }
  const kind: unknown = (json as Record<string, unknown>).event
  if (typeof kind !== 'string') return { kind: 'invalid' }
  if (!KNOWN_EVENTS.has(kind)) return { kind: 'ignore' }
  const parsed = roomEventDtoSchema.safeParse(json)
  return parsed.success ? { kind: 'event', event: toRoomEvent(parsed.data) } : { kind: 'invalid' }
}

// 읽을 수 없거나 모르는 종류의 메시지는 null
export function parseRoomEvent(text: string): RoomEvent | null {
  const message = parseRoomMessage(text)
  return message.kind === 'event' ? message.event : null
}
