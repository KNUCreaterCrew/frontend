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
// 넓은 화면에서 좌석 칸 한 변의 최대 크기(기준 글자 16px 일 때). 이보다 커지면 좌석도가 화면을 덮어
// 요약과 범례를 밀어낸다. 아주 넓은 화면에서 기준 글자가 커지면 같은 비율로 커진다(remScale).
export const MAX_CELL_PX = 128

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

// 좌석도 무대의 폭(px). 가장 작은 칸이 MAX_CELL_PX 를 넘지 않을 때까지만 상자 폭을 쓴다.
export function fitStageWidth(
  layouts: SeatLayout[],
  vb: ViewBox,
  containerWidth: number,
  remScale = 1,
): number {
  return Math.min(containerWidth, maxStageWidth(layouts, vb, remScale))
}

export function maxStageWidth(layouts: SeatLayout[], vb: ViewBox, remScale = 1): number {
  const smallest = Math.min(...layouts.map((l) => l.width))
  return (vb.width / smallest) * MAX_CELL_PX * remScale
}

// 칸의 짧은 변(너비와 높이 중 작은 쪽). 확대 배율은 이 값이 44px 가 되도록 정한다.
export function minCellSidePx(layouts: SeatLayout[], vb: ViewBox, containerWidth: number): number {
  const smallest = Math.min(...layouts.map((l) => Math.min(l.width, l.height)))
  return (smallest / vb.width) * containerWidth
}

// full 칸은 번호와 상태 두 줄(짐 있음이면 아래 25% 띠까지)이 들어가야 한다. 짧은 변이 이보다 작으면 compact
const FULL_MIN_SHORT_PX = 56

/**
 * 칸 단계. 누르기 쉬운지(zoom)는 실제 화면 px 로, 글자가 들어가는지(full)는 기준 글자 크기로 나눈 값으로 본다.
 * 아주 넓은 화면에서 기준 글자를 키우면(remScale > 1) 글자도 커지므로 같은 px 칸이라도 full 이 아닐 수 있다.
 */
export function cellStage(px: number, remScale = 1, shortPx = Infinity): CellStage {
  if (px < COMPACT_MIN_PX) return 'zoom'
  if (px / remScale >= FULL_MIN_PX && shortPx / remScale >= FULL_MIN_SHORT_PX) return 'full'
  return 'compact'
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
