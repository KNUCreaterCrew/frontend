import { memo } from 'react'
import { seatAccessibleName, seatStatusLabel } from '@/entities/room'
import type { Seat, SeatStatus } from '@/entities/room'
import { OutletIcon } from '@/shared/ui'
import type { CellStage } from '../lib/geometry'

const FACE: Record<SeatStatus, string> = {
  // 빈자리는 밝은 민트 면에 틸 테두리를 두르고 그림자로 떠 있다(비어 있는 칸).
  // 사용 중은 진한 면으로 채운다(누가 있는 칸). 나머지는 바닥판에 붙은 흰 면과 테두리로 구분한다
  EMPTY: 'bg-empty-tint text-empty shadow-seat',
  OCCUPIED: 'bg-occupied text-on-occupied',
  AWAY: 'border border-line-strong bg-surface text-ink',
  UNKNOWN: 'pattern-unknown border border-line-strong bg-surface text-ink',
  UNRECOGNIZED: 'pattern-unknown border border-line-strong bg-surface text-ink',
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
  /** 누르면 seatId 를 알린다. 참조가 바뀌면 모든 버튼이 다시 그려지니 안정된 함수를 넘긴다 */
  onSelect?: (seatId: string) => void
  /** 지금 상세 시트가 열려 있는 좌석 */
  selected?: boolean
}

// 상태 줄이 있는 칸(full)이 96px 이상이면 "방금 사용 중", 그보다 작으면 "방금"
const JUST_CHANGED_WIDE_PX = 96

function sameRect(a: SeatRect, b: SeatRect): boolean {
  return a.left === b.left && a.top === b.top && a.width === b.width && a.height === b.height
}

function SeatButtonView({
  seat,
  stage,
  rect,
  justChanged,
  cellPx,
  onSelect,
  selected = false,
}: SeatButtonProps) {
  const style = {
    left: `${rect.left}%`,
    top: `${rect.top}%`,
    width: `${rect.width}%`,
    height: `${rect.height}%`,
  }
  const showText = stage !== 'zoom'
  const hatched = isHatched(seat.status)
  const away = seat.status === 'AWAY'
  // 빈자리 칸의 2px 틸 테두리(shadow-seat 의 inset)만큼 글자 영역을 안으로 들인다
  const ring = seat.status === 'EMPTY' ? 2 : 0
  const chip = hatched ? 'self-start rounded-chip bg-surface px-2 py-px' : ''

  const justLabel =
    justChanged === undefined
      ? null
      : cellPx >= JUST_CHANGED_WIDE_PX
        ? `방금 ${seatStatusLabel(justChanged)}`
        : '방금'

  return (
    <>
      <button
        type="button"
        aria-label={seatAccessibleName(seat)}
        aria-haspopup="dialog"
        data-seat-id={seat.seatId}
        onClick={() => onSelect?.(seat.seatId)}
        style={style}
        className={`absolute overflow-hidden rounded-seat text-left transition focus-visible:z-20 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-accent motion-safe:hover:-translate-y-px ${FACE[seat.status]} ${selected ? 'outline-4 outline-offset-3 outline-ink' : ''} ${justChanged !== undefined ? 'motion-safe:animate-flip' : ''}`}
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
            className={`absolute flex flex-col justify-between ${stage === 'full' ? 'p-2' : 'p-1'}`}
            style={{ top: ring, left: ring, right: ring, bottom: away ? '25%' : ring }}
          >
            <span
              className={`num font-bold ${stage === 'full' ? 'text-number' : 'text-label'} ${chip}`}
            >
              {seat.label}
            </span>
            {stage === 'full' && (
              <span
                className={`text-label font-medium ${
                  justLabel === null ? chip : 'self-start rounded-chip bg-live px-1 text-on-live'
                }`}
              >
                {justLabel ?? seatStatusLabel(seat.status)}
              </span>
            )}
            {seat.hasOutlet && (
              <span
                className={`absolute ${stage === 'full' ? 'top-2 right-2' : 'top-1 right-1'} ${hatched ? 'rounded-chip bg-surface p-px' : ''}`}
              >
                <OutletIcon className={stage === 'full' ? 'size-4' : 'size-3'} />
              </span>
            )}
          </span>
        )}
      </button>
      {/* 칸 바깥에 바닥판 색 틈을 두고 두른다. 밝기가 비슷한 빈자리 틸 면 위에서도 테두리가 구별된다.
          버튼 뒤에 그려야 이웃 칸에 가려지지 않는다 */}
      {justChanged !== undefined && (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute z-10 rounded-seat outline-4 outline-offset-2 outline-live motion-safe:animate-live"
          style={style}
        />
      )}
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
    prev.onSelect === next.onSelect &&
    prev.selected === next.selected &&
    sameRect(prev.rect, next.rect),
)
