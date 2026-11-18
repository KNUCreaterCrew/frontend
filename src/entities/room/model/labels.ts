import type { CongestionLevel, Seat, SeatReason, SeatStatus } from './types'

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

const REASON_LABEL: Record<SeatReason, string> = {
  OCCLUDED: '무언가에 가려 자리가 보이지 않아요',
  LOW_CONFIDENCE: '비어 보이지만 아직 빈자리로 확인하지 못했어요',
  MODEL_CONFLICT: '판단이 엇갈려 확인하지 못했어요',
  VLM_TIMEOUT: '확인하는 데 시간이 오래 걸려 아직 몰라요',
  STALE_OBSERVATION: '한동안 새로 확인하지 못했어요',
  EDGE_OFFLINE: '장치 연결이 끊겨 지금은 확인할 수 없어요',
  UNRECOGNIZED: '이유를 알 수 없어요',
}

export function seatReasonLabel(reason: SeatReason | null): string {
  return reason === null ? '이유 정보가 없어요' : REASON_LABEL[reason]
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
