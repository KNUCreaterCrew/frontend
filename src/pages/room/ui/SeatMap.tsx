import { useState } from 'react'
import type { Seat } from '@/entities/room'
import { useElementWidth } from '@/shared/lib'
import {
  cellStage,
  computeViewBox,
  minCellPx,
  seatRect,
  sortSeatsForReading,
  zoomScale,
} from '../lib/geometry'
import type { CellStage } from '../lib/geometry'
import { MapZoomControls } from './MapZoomControls'
import { SeatButton } from './SeatButton'

export function SeatMap({ seats }: { seats: Seat[] }) {
  const [boxRef, width] = useElementWidth<HTMLDivElement>()
  const [zoomed, setZoomed] = useState(false)

  const layouts = seats.map((s) => s.layout)
  const vb = computeViewBox(layouts)
  if (!vb) return null

  const px = width === null ? null : minCellPx(layouts, vb, width)
  const fitStage: CellStage = px === null ? 'compact' : cellStage(px)
  const canZoom = fitStage === 'zoom' && px !== null
  const scale = canZoom && zoomed ? zoomScale(px) : 1
  const stage: CellStage = canZoom && zoomed ? 'compact' : fitStage

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
      {canZoom && (
        <MapZoomControls
          zoomed={zoomed}
          onZoomIn={() => setZoomed(true)}
          onZoomOut={() => setZoomed(false)}
        />
      )}
    </div>
  )
}
