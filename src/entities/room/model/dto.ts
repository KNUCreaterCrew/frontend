import { z } from 'zod'

export const seatStatusSchema = z.enum(['EMPTY', 'OCCUPIED', 'AWAY', 'UNKNOWN'])
export const seatReasonSchema = z.enum([
  'OCCLUDED',
  'LOW_CONFIDENCE',
  'MODEL_CONFLICT',
  'VLM_TIMEOUT',
  'STALE_OBSERVATION',
  'EDGE_OFFLINE',
])
export const congestionLevelSchema = z.enum(['LOW', 'MODERATE', 'HIGH'])

const isoTime = z.iso.datetime({ offset: true })

const seatLayoutDtoSchema = z.object({
  x: z.int(),
  y: z.int(),
  width: z.int().positive(),
  height: z.int().positive(),
})

// status, reason, congestion_level 은 서버가 새 값을 보내도 화면 전체가 실패하지 않게 문자열로 받는다.
const seatDtoSchema = z.object({
  seat_id: z.string(),
  label: z.string(),
  status: z.string(),
  reason: z.string().nullable(),
  status_since: isoTime,
  last_observed_at: isoTime.nullable(),
  has_outlet: z.boolean(),
  is_window: z.boolean(),
  layout: seatLayoutDtoSchema,
})

export const roomDtoSchema = z.object({
  room_id: z.string(),
  room_name: z.string(),
  total_seats: z.int(),
  available_seats: z.int(),
  unknown_seats: z.int(),
  congestion_level: z.string(),
  edge_online: z.boolean(),
  version: z.int(),
  seats: z.array(seatDtoSchema),
})

export type RoomDto = z.infer<typeof roomDtoSchema>
