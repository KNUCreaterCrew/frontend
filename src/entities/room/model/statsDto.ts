import { z } from 'zod'

const averages = {
  observed_minutes: z.int().nonnegative(),
  avg_available_seats: z.number().nullable(),
  avg_unknown_seats: z.number().nullable(),
  congestion_level: z.string().nullable(),
}

const bucketDtoSchema = z.object({
  start: z.iso.datetime({ offset: true }),
  ...averages,
})

const cellDtoSchema = z.object({
  weekday: z.string(),
  hour: z.int().min(0).max(23),
  observed_days: z.int().nonnegative(),
  ...averages,
})

export const dailyStatsDtoSchema = z.object({
  room_id: z.string(),
  date: z.iso.date(),
  bucket_minutes: z.int(),
  total_seats: z.int(),
  data_source: z.string().nullable(),
  buckets: z.array(bucketDtoSchema),
})

export const weeklyStatsDtoSchema = z.object({
  room_id: z.string(),
  start_date: z.iso.date(),
  end_date: z.iso.date(),
  weeks: z.int(),
  bucket_minutes: z.int(),
  total_seats: z.int(),
  data_source: z.string().nullable(),
  cells: z.array(cellDtoSchema),
})

export type DailyStatsDto = z.infer<typeof dailyStatsDtoSchema>
export type WeeklyStatsDto = z.infer<typeof weeklyStatsDtoSchema>
