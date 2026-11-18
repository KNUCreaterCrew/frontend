import { memo } from 'react'
import { seatAccessibleName, seatStatusLabel } from '@/entities/room'
import type { Seat, SeatStatus } from '@/entities/room'
import { OutletIcon } from '@/shared/ui'
import type { CellStage } from '../lib/geometry'

const FACE: Record<SeatStatus, string> = {
  EMPTY: 'bg-empty text-on-empty',
  OCCUPIED: 'bg-ink text-paper',
  AWAY: 'border-3 border-ink bg-paper text-ink',
  UNKNOWN: 'pattern-unknown border-2 border-ink bg-paper text-ink',
  UNRECOGNIZED: 'pattern-unknown border-2 border-ink bg-paper text-ink',
}

function isHatched(status: SeatStatus): boolean {
  return status === 'UNKNOWN' || status === 'UNRECOGNIZED'
}

export interface SeatRect {
  left: number
  top: number
  width: number
  height: number
}

interface SeatButtonProps {
  seat: Seat
  stage: CellStage
  /** 좌석도 안에서의 위치와 크기(% 숫자) */
  rect: SeatRect
  /** 방금 바뀐 좌석이면 바뀐 뒤 상태 */
  justChanged?: SeatStatus
  /** 이 좌석도에서 가장 작은 칸의 한 변(px). 확대 중이면 배율이 곱해진 값 */
  cellPx: number
}

// 상태 줄이 있는 칸(full)이 96px 이상이면 "방금 사용 중", 그보다 작으면 "방금"
const JUST_CHANGED_WIDE_PX = 96

function sameRect(a: SeatRect, b: SeatRect): boolean {
  return a.left === b.left && a.top === b.top && a.width === b.width && a.height === b.height
}

function SeatButtonView({ seat, stage, rect, justChanged, cellPx }: SeatButtonProps) {
  const style = {
    left: `${rect.left}%`,
    top: `${rect.top}%`,
    width: `${rect.width}%`,
    height: `${rect.height}%`,
  }
  const showText = stage !== 'zoom'
  const hatched = isHatched(seat.status)
  const away = seat.status === 'AWAY'
  const chip = hatched ? 'self-start bg-paper px-1' : ''

  const justLabel =
    justChanged === undefined
      ? null
      : cellPx >= JUST_CHANGED_WIDE_PX
        ? `방금 ${seatStatusLabel(justChanged)}`
        : '방금'

  return (
    <>
      {justChanged !== undefined && (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute border-4 border-live motion-safe:animate-live"
          style={style}
        />
      )}
      <button
        type="button"
        aria-label={seatAccessibleName(seat)}
        style={style}
        className={`absolute overflow-hidden text-left focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-ink ${FACE[seat.status]}`}
      >
        {away && (
          <span
            aria-hidden="true"
            className="absolute inset-x-0 bottom-0 bg-ink"
            style={{ height: '25%' }}
          />
        )}
        {showText && (
          <span
            className="absolute inset-x-0 top-0 flex flex-col justify-between p-1"
            style={{ bottom: away ? '25%' : 0 }}
          >
            <span
              className={`font-num font-extrabold tabular-nums ${stage === 'full' ? 'text-number' : 'text-label'} ${chip}`}
            >
              {seat.label}
            </span>
            {stage === 'full' && (
              <span
                className={`text-label font-bold ${
                  justLabel === null ? chip : 'self-start bg-live px-1 text-on-live'
                }`}
              >
                {justLabel ?? seatStatusLabel(seat.status)}
              </span>
            )}
            {seat.hasOutlet && (
              <span className={`absolute top-1 right-1 ${hatched ? 'bg-paper p-px' : ''}`}>
                <OutletIcon className="size-3" />
              </span>
            )}
          </span>
        )}
      </button>
    </>
  )
}

export const SeatButton = memo(
  SeatButtonView,
  (prev, next) =>
    prev.seat === next.seat &&
    prev.stage === next.stage &&
    prev.justChanged === next.justChanged &&
    prev.cellPx === next.cellPx &&
    sameRect(prev.rect, next.rect),
)
