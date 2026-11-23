import { memo } from 'react'
import { seatAccessibleName, seatStatusLabel } from '@/entities/room'
import type { Seat, SeatStatus } from '@/entities/room'
import { BagIcon, OutletIcon, QuestionIcon } from '@/shared/ui'
import type { CellStage } from '../lib/geometry'

// 밝기 순서가 곧 뜻이다. 빈자리는 가장 밝은 흰 유리에 에메랄드 테두리와 빛,
// 짐 있음은 중간 톤 회청색, 사용 중은 진한 스모크, 확인 불가는 면 없이 점선 윤곽
const FACE: Record<SeatStatus, string> = {
  EMPTY: 'seat-empty',
  OCCUPIED: 'seat-occupied',
  AWAY: 'seat-away',
  UNKNOWN: 'seat-unknown',
  UNRECOGNIZED: 'seat-unknown',
}

function isUnknown(status: SeatStatus): boolean {
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
  const full = stage === 'full'
  const unknown = isUnknown(seat.status)
  // 상태 아이콘: 짐 있음은 가방, 확인 불가는 물음표. 콘센트가 있으면 그 옆에 나란히 둔다
  const StatusIcon = seat.status === 'AWAY' ? BagIcon : unknown ? QuestionIcon : null
  // 빈자리 칸의 2px 테두리(안쪽 그림자)만큼 글자 영역을 안으로 들인다. 점선 테두리는 상자 안에 있다
  const ring = seat.status === 'EMPTY' ? 2 : 0
  const icon = full ? 'size-4' : 'size-3'

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
        data-status={seat.status}
        onClick={() => onSelect?.(seat.seatId)}
        style={style}
        className={`absolute overflow-hidden text-left transition focus-visible:z-20 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-accent motion-safe:hover:-translate-y-px ${stage === 'zoom' ? 'rounded-seat-sm' : 'rounded-seat'} ${FACE[seat.status]} ${selected ? 'outline-4 outline-offset-3 outline-ink' : ''} ${justChanged !== undefined ? 'motion-safe:animate-flip' : ''}`}
      >
        {showText && (
          <span
            className={`absolute flex flex-col justify-between ${full ? 'p-2' : 'p-1'}`}
            style={{ inset: ring }}
          >
            <span className={`num leading-none font-bold ${full ? 'text-number' : 'text-label'}`}>
              {seat.label}
            </span>
            {full && (
              <span
                className={`text-label leading-none font-medium ${
                  justLabel === null
                    ? ''
                    : 'self-start rounded-chip bg-live px-1 py-px text-on-live'
                }`.trim()}
              >
                {justLabel ?? seatStatusLabel(seat.status)}
              </span>
            )}
            {(StatusIcon !== null || seat.hasOutlet) && (
              <span
                data-seat-icons=""
                className={`absolute flex gap-1 ${full ? 'top-2 right-2' : 'right-1 bottom-1'} ${unknown ? 'text-ink-soft' : ''}`.trim()}
              >
                {seat.hasOutlet && <OutletIcon className={icon} />}
                {StatusIcon !== null && <StatusIcon className={icon} />}
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
          className={`pointer-events-none absolute z-10 ${stage === 'zoom' ? 'rounded-seat-sm' : 'rounded-seat'} outline-4 outline-offset-2 outline-live motion-safe:animate-live`}
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
