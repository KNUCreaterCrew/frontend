import { useEffect, useState } from 'react'
import type { Seat } from '@/entities/room'
import { useElementWidth } from '@/shared/lib'
import {
  cellStage,
  computeViewBox,
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

// 좌석도 상자의 오른쪽 안쪽 여백(className 의 p-2 = 8px). 확대하면 내용이 이 여백까지 보인다.
const BOX_PAD_PX = 8

interface SeatMapProps {
  seats: Seat[]
  /** 지금 보이는 칸이 콘센트 아이콘을 숨기는지(범례 안내용) */
  onOutletsHiddenChange?: (hidden: boolean) => void
}

export function SeatMap({ seats, onOutletsHiddenChange }: SeatMapProps) {
  const [boxRef, width] = useElementWidth<HTMLDivElement>()
  const [zoomed, setZoomed] = useState(false)

  const layouts = seats.map((s) => s.layout)
  const vb = computeViewBox(layouts)

  const px = vb && width !== null ? minCellPx(layouts, vb, width) : null
  const fitStage: CellStage = px === null ? 'compact' : cellStage(px)
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
      <div ref={boxRef} className="overflow-x-auto border-t-6 border-ink p-2">
        <div
          className="relative"
          style={{ aspectRatio: `${vb.width} / ${vb.height}`, width: `${scale * 100}%` }}
        >
          {sortSeatsForReading(seats).map((seat) => {
            const rect = seatRect(seat.layout, vb)
            return (
              <SeatButton
                key={seat.seatId}
                seat={seat}
                stage={stage}
                style={{
                  left: `${rect.left}%`,
                  top: `${rect.top}%`,
                  width: `${rect.width}%`,
                  height: `${rect.height}%`,
                }}
              />
            )
          })}
        </div>
      </div>
      {canZoom && <MapZoomToggle zoomed={zoomed} onToggle={() => setZoomed((z) => !z)} />}
    </div>
  )
}
