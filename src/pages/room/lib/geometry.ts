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

// 칸의 짧은 변(너비와 높이 중 작은 쪽). 확대 배율은 이 값이 44px 가 되도록 정한다.
export function minCellSidePx(layouts: SeatLayout[], vb: ViewBox, containerWidth: number): number {
  const smallest = Math.min(...layouts.map((l) => Math.min(l.width, l.height)))
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

// 확대했을 때 오른쪽 끝에서 칸이 반드시 일부 잘려 보이게 배율을 조금 키운다.
// 끝이 이미 어떤 칸을 25% 에서 75% 만 보이게 자르면 그대로 둔다. 배율은 줄지 않는다.
// contentWidthPx 는 무대 폭의 기준(상자 안쪽 폭), visibleWidthPx 는 스크롤 0 에서 실제로 보이는 폭
// (오른쪽 안쪽 여백까지 내용이 보인다).
export function zoomScaleWithCutEdge(
  layouts: SeatLayout[],
  vb: ViewBox,
  s0: number,
  contentWidthPx: number,
  visibleWidthPx: number,
): number {
  const visibleUnits = vb.width * (visibleWidthPx / contentWidthPx)
  const edge = visibleUnits / s0
  const cells = layouts.map((l) => ({ left: l.x - vb.minX, width: l.width }))
  for (const c of cells) {
    if (c.left < edge && edge < c.left + c.width) {
      const visible = (edge - c.left) / c.width
      if (visible >= 0.25 && visible <= 0.75) return s0
    }
  }
  const fits = cells.filter((c) => c.left + 0.5 * c.width <= edge)
  if (fits.length === 0) return s0
  const target = fits.reduce((a, b) => (b.left > a.left ? b : a))
  return Math.max(s0, visibleUnits / (target.left + 0.5 * target.width))
}

export function sortSeatsForReading<T extends { layout: SeatLayout }>(seats: T[]): T[] {
  return [...seats].sort((a, b) => a.layout.y - b.layout.y || a.layout.x - b.layout.x)
}
