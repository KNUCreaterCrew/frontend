import { useEffect, useMemo, useState } from 'react'
import type { Seat, SeatStatus } from '@/entities/room'
import { useElementWidth } from '@/shared/lib'
import {
  cellStage,
  computeViewBox,
  fitStageWidth,
  maxStageWidth,
  minCellPx,
  minCellSidePx,
  seatRect,
  sortSeatsForReading,
  zoomScale,
  zoomScaleWithCutEdge,
} from '../lib/geometry'
import type { CellStage } from '../lib/geometry'
import { MapZoomToggle } from './MapZoomToggle'
import { SeatButton } from './SeatButton'

// 좌석도 상자의 오른쪽 안쪽 여백(className 의 p-3 = 12px). 확대하면 내용이 이 여백까지 보인다.
const BOX_PAD_PX = 12

interface SeatMapProps {
  seats: Seat[]
  /** 방금 바뀐 좌석과 바뀐 뒤 상태 */
  highlights?: ReadonlyMap<string, SeatStatus>
  /** 지금 보이는 칸이 콘센트 아이콘을 숨기는지(범례 안내용) */
  onOutletsHiddenChange?: (hidden: boolean) => void
  /** 좌석을 누르면 seatId 를 알린다(안정된 함수) */
  onSelect?: (seatId: string) => void
  /** 상세 시트가 열려 있는 좌석 */
  selectedSeatId?: string | null
}

// 기준 글자 크기 / 16px. 아주 넓은 화면에서 global.css 가 기준 글자를 키우면 좌석 칸 상한도 따라 커진다
function rootRemScale(): number {
  const px = parseFloat(getComputedStyle(document.documentElement).fontSize)
  return Number.isFinite(px) && px > 0 ? px / 16 : 1
}

// 강조한 상태가 좌석의 지금 상태와 같을 때만 강조한다(다시 조회해 다른 상태가 된 좌석 등)
function justChanged(
  highlights: ReadonlyMap<string, SeatStatus> | undefined,
  seat: Seat,
): SeatStatus | undefined {
  const status = highlights?.get(seat.seatId)
  return status === seat.status ? status : undefined
}

export function SeatMap({
  seats,
  highlights,
  onOutletsHiddenChange,
  onSelect,
  selectedSeatId = null,
}: SeatMapProps) {
  const [boxRef, width] = useElementWidth<HTMLDivElement>()
  const [zoomed, setZoomed] = useState(false)

  const layouts = useMemo(() => seats.map((s) => s.layout), [seats])
  const vb = useMemo(() => computeViewBox(layouts), [layouts])
  const placed = useMemo(
    () =>
      vb
        ? sortSeatsForReading(seats).map((seat) => ({ seat, rect: seatRect(seat.layout, vb) }))
        : [],
    [seats, vb],
  )

  // 넓은 화면에서는 칸이 MAX_CELL_PX 를 넘지 않게 무대 폭을 줄여 가운데 둔다
  const remScale = rootRemScale()
  const stageWidth = vb && width !== null ? fitStageWidth(layouts, vb, width, remScale) : null
  const px = vb && stageWidth !== null ? minCellPx(layouts, vb, stageWidth) : null
  const shortPx = vb && stageWidth !== null ? minCellSidePx(layouts, vb, stageWidth) : null
  const fitStage: CellStage =
    px === null || shortPx === null ? 'compact' : cellStage(px, remScale, shortPx)
  const canZoom = fitStage === 'zoom' && width !== null
  const stage: CellStage = canZoom && zoomed ? 'compact' : fitStage
  const outletsHidden = stage === 'zoom'

  const measured = width !== null
  useEffect(() => {
    if (!measured) return
    onOutletsHiddenChange?.(outletsHidden)
    return () => onOutletsHiddenChange?.(false)
  }, [measured, outletsHidden, onOutletsHiddenChange])

  if (!vb) return null

  const scale =
    canZoom && zoomed
      ? zoomScaleWithCutEdge(
          layouts,
          vb,
          zoomScale(minCellSidePx(layouts, vb, width)),
          width,
          width + BOX_PAD_PX,
        )
      : 1

  return (
    <div>
      <div className="rounded-panel bg-surface pattern-floor shadow-plate lg:px-8 lg:py-12">
        <div ref={boxRef} className="overflow-x-auto p-3">
          <div
            className="relative mx-auto"
            style={{
              aspectRatio: `${vb.width} / ${vb.height}`,
              width: `${scale * 100}%`,
              maxWidth: scale === 1 ? `${maxStageWidth(layouts, vb, remScale)}px` : undefined,
            }}
          >
            {placed.map(({ seat, rect }) => (
              <SeatButton
                key={seat.seatId}
                seat={seat}
                stage={stage}
                rect={rect}
                justChanged={justChanged(highlights, seat)}
                cellPx={(px ?? 0) * scale}
                onSelect={onSelect}
                selected={seat.seatId === selectedSeatId}
              />
            ))}
          </div>
        </div>
      </div>
      {canZoom && <MapZoomToggle zoomed={zoomed} onToggle={() => setZoomed((z) => !z)} />}
    </div>
  )
}
