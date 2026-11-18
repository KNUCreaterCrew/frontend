import type { SeatLayout } from '@/entities/room'

export interface ViewBox {
  minX: number
  minY: number
  width: number
  height: number
}

export type CellStage = 'full' | 'compact' | 'zoom'

const FULL_MIN_PX = 64
const COMPACT_MIN_PX = 40
const TAP_PX = 44

export function computeViewBox(layouts: SeatLayout[]): ViewBox | null {
  if (layouts.length === 0) return null
  const minX = Math.min(...layouts.map((l) => l.x))
  const minY = Math.min(...layouts.map((l) => l.y))
  const maxX = Math.max(...layouts.map((l) => l.x + l.width))
  const maxY = Math.max(...layouts.map((l) => l.y + l.height))
  return { minX, minY, width: maxX - minX, height: maxY - minY }
}

export function viewBoxString(vb: ViewBox): string {
  return `${vb.minX} ${vb.minY} ${vb.width} ${vb.height}`
}

export function seatRect(layout: SeatLayout, vb: ViewBox) {
  return {
    left: ((layout.x - vb.minX) / vb.width) * 100,
    top: ((layout.y - vb.minY) / vb.height) * 100,
    width: (layout.width / vb.width) * 100,
    height: (layout.height / vb.height) * 100,
  }
}

export function minCellPx(layouts: SeatLayout[], vb: ViewBox, containerWidth: number): number {
  const smallest = Math.min(...layouts.map((l) => l.width))
  return (smallest / vb.width) * containerWidth
}

export function cellStage(px: number): CellStage {
  if (px >= FULL_MIN_PX) return 'full'
  if (px >= COMPACT_MIN_PX) return 'compact'
  return 'zoom'
}

export function zoomScale(px: number): number {
  return Math.max(1, TAP_PX / px)
}

export function sortSeatsForReading<T extends { layout: SeatLayout }>(seats: T[]): T[] {
  return [...seats].sort((a, b) => a.layout.y - b.layout.y || a.layout.x - b.layout.x)
}
