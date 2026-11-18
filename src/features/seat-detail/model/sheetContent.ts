import { seatReasonLabel, seatStatusLabel } from '@/entities/room'
import type { Seat } from '@/entities/room'
import { timeParts } from '@/shared/lib'

export type SheetBand = 'empty' | 'ink' | 'hatched'

export interface SheetRow {
  key: 'place' | 'outlet' | 'lastObserved' | 'statusSince'
  label: string
  value: string
}

export interface SheetContent {
  seatLabel: string
  statusLabel: string
  statusTone: 'empty' | 'ink'
  title: string
  reason: string | null
  band: SheetBand
  rows: SheetRow[]
}

const BAND: Record<Seat['status'], SheetBand> = {
  EMPTY: 'empty',
  OCCUPIED: 'ink',
  AWAY: 'ink',
  UNKNOWN: 'hatched',
  UNRECOGNIZED: 'hatched',
}

function timeValue(iso: string | null, now: number): string {
  const parts = timeParts(iso, now)
  return parts === null ? '아직 확인하지 못함' : `${parts.relative} (${parts.time})`
}

export function sheetContent(seat: Seat, now: number): SheetContent {
  const statusLabel = seatStatusLabel(seat.status)
  return {
    seatLabel: seat.label,
    statusLabel,
    statusTone: seat.status === 'EMPTY' ? 'empty' : 'ink',
    title: `${seat.label} ${statusLabel}`,
    reason: seat.status === 'UNKNOWN' ? seatReasonLabel(seat.reason) : null,
    band: BAND[seat.status],
    rows: [
      { key: 'place', label: '자리', value: seat.isWindow ? '창가' : '창가 아님' },
      { key: 'outlet', label: '콘센트', value: seat.hasOutlet ? '있음' : '없음' },
      { key: 'lastObserved', label: '마지막 확인', value: timeValue(seat.lastObservedAt, now) },
      { key: 'statusSince', label: '상태가 바뀐 때', value: timeValue(seat.statusSince, now) },
    ],
  }
}

export function seatChangeNotice(prev: Seat, next: Seat): string | null {
  if (prev.status === next.status) return null
  return `${next.label} 지금 ${seatStatusLabel(next.status)}`
}
