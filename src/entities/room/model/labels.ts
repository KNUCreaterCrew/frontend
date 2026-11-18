import type { CongestionLevel, Seat, SeatStatus } from './types'

const STATUS_LABEL: Record<SeatStatus, string> = {
  EMPTY: '빈자리',
  OCCUPIED: '사용 중',
  AWAY: '짐 있음',
  UNKNOWN: '확인 불가',
  UNRECOGNIZED: '알 수 없는 상태',
}

const CONGESTION_LABEL: Record<CongestionLevel, string> = {
  LOW: '여유',
  MODERATE: '보통',
  HIGH: '혼잡',
  UNRECOGNIZED: '알 수 없음',
}

export function seatStatusLabel(status: SeatStatus): string {
  return STATUS_LABEL[status]
}

export function congestionLabel(level: CongestionLevel): string {
  return CONGESTION_LABEL[level]
}

export function seatAccessibleName(seat: Seat): string {
  const base = `${seat.label} ${seatStatusLabel(seat.status)}`
  return seat.hasOutlet ? `${base}, 콘센트 있음` : base
}
