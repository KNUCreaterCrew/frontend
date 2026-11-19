import { toRoom } from '@/entities/room'
import { manySeatsRoom, mixedRoom } from '@mocks/fixtures/rooms'
import {
  cellStage,
  computeViewBox,
  minCellPx,
  minCellSidePx,
  seatRect,
  sortSeatsForReading,
  viewBoxString,
  zoomScale,
  zoomScaleWithCutEdge,
} from './geometry'

const mixed = toRoom(mixedRoom).seats.map((s) => s.layout)
const many = toRoom(manySeatsRoom).seats.map((s) => s.layout)

describe('computeViewBox', () => {
  it('배포 4석은 0 0 144 112', () => {
    const vb = computeViewBox(mixed)
    expect(vb).not.toBeNull()
    expect(viewBoxString(vb!)).toBe('0 0 144 112')
  })

  it('좌석 한 개는 그 칸 자체가 viewBox', () => {
    const one = { x: 120, y: 80, width: 64, height: 48 }
    const vb = computeViewBox([one])!
    expect(viewBoxString(vb)).toBe('120 80 64 48')
    expect(seatRect(one, vb)).toEqual({ left: 0, top: 0, width: 100, height: 100 })
  })

  it('좌석이 없으면 null', () => {
    expect(computeViewBox([])).toBeNull()
  })
})

describe('seatRect', () => {
  it('A2 는 % 로 환산된다', () => {
    const vb = computeViewBox(mixed)!
    const rect = seatRect(mixed[1]!, vb)
    expect(rect.left).toBeCloseTo(55.56, 2)
    expect(rect.width).toBeCloseTo(44.44, 2)
  })
})

describe('cellStage', () => {
  it('경계값', () => {
    expect(cellStage(64)).toBe('full')
    expect(cellStage(63.9)).toBe('compact')
    expect(cellStage(40)).toBe('compact')
    expect(cellStage(39.9)).toBe('zoom')
  })

  it('짧은 변이 56px 보다 작으면 두 줄이 들어가지 않으니 compact', () => {
    expect(cellStage(64, 1, 56)).toBe('full')
    expect(cellStage(64, 1, 55.9)).toBe('compact')
  })

  it('기준 글자를 키운 넓은 화면에서는 글자 크기로 나눈 값으로 full 을 정하고, zoom 은 실제 px 로 정한다', () => {
    // 4K 배율 100%(기준 글자 150%)에서 40석 방의 칸 약 95x71px
    expect(cellStage(95, 1.5, 71)).toBe('compact')
    expect(cellStage(192, 1.5, 144)).toBe('full')
    expect(cellStage(45, 1.5, 34)).toBe('compact')
  })
})

describe('minCellPx와 zoomScale', () => {
  it('4석 328px 는 full', () => {
    const px = minCellPx(mixed, computeViewBox(mixed)!, 328)
    expect(px).toBeCloseTo(145.8, 1)
    expect(cellStage(px)).toBe('full')
  })

  it('40석 328px 는 단계는 너비로 정해 zoom, 짧은 변은 약 25.23', () => {
    const vb = computeViewBox(many)!
    const px = minCellPx(many, vb, 328)
    expect(px).toBeCloseTo(33.64, 2)
    expect(cellStage(px)).toBe('zoom')
    const side = minCellSidePx(many, vb, 328)
    expect(side).toBeCloseTo(25.23, 2)
    expect(zoomScale(side)).toBeCloseTo(1.744, 3)
  })

  it('높이가 너비보다 큰 칸은 너비를 짧은 변으로 본다', () => {
    const tall = [
      { x: 0, y: 0, width: 20, height: 60 },
      { x: 40, y: 0, width: 40, height: 60 },
    ]
    expect(minCellSidePx(tall, computeViewBox(tall)!, 400)).toBeCloseTo(100, 5)
  })

  it('이미 충분히 크면 배율 1', () => {
    expect(zoomScale(100)).toBe(1)
  })
})

describe('zoomScaleWithCutEdge', () => {
  const vb = computeViewBox(many)!
  // 좌석도 상자의 오른쪽 안쪽 여백(p-3)만큼 내용이 더 보인다.
  const PAD = 12

  function visibleFractionAtEdge(scale: number, content: number, visible: number): number | null {
    const edge = (vb.width * (visible / content)) / scale
    for (const l of many) {
      const left = l.x - vb.minX
      if (left < edge && edge < left + l.width) return (edge - left) / l.width
    }
    return null
  }

  it.each([312, 342, 280, 300, 330])(
    '내용 폭 %ipx, 보이는 폭 +12px: 끝 칸이 25% 에서 75% 만 보이고 배율은 줄지 않는다',
    (w) => {
      const s0 = zoomScale(minCellSidePx(many, vb, w))
      const s = zoomScaleWithCutEdge(many, vb, s0, w, w + PAD)
      expect(s).toBeGreaterThanOrEqual(s0)
      const f = visibleFractionAtEdge(s, w, w + PAD)
      expect(f).not.toBeNull()
      expect(f!).toBeGreaterThanOrEqual(0.25)
      expect(f!).toBeLessThanOrEqual(0.75)
    },
  )

  it('보이는 폭이 내용 폭과 다르면 보이는 폭 기준으로 25% 에서 75% 를 맞춘다', () => {
    const w = 330
    const s0 = zoomScale(minCellSidePx(many, vb, w))
    // 내용 폭 기준으로는 이미 가운데가 잘려 보이지만, 실제 보이는 338px 기준으로는 76% 가 보인다
    expect(visibleFractionAtEdge(s0, w, 338)).toBeGreaterThan(0.75)
    const s = zoomScaleWithCutEdge(many, vb, s0, w, 338)
    expect(s).toBeGreaterThan(s0)
    const f = visibleFractionAtEdge(s, w, 338)!
    expect(f).toBeGreaterThanOrEqual(0.25)
    expect(f).toBeLessThanOrEqual(0.75)
  })

  it('이미 가운데가 잘려 있으면 그대로 둔다', () => {
    const s0 = vb.width / (80 * 4 + 32)
    expect(zoomScaleWithCutEdge(many, vb, s0, 300, 300)).toBe(s0)
  })

  it('끝이 칸 사이 틈에 닿으면 그 앞 칸의 가운데로 맞춘다', () => {
    const s0 = vb.width / (80 * 4 + 70)
    expect(zoomScaleWithCutEdge(many, vb, s0, 300, 300)).toBeCloseTo(vb.width / (80 * 4 + 32), 6)
  })
})

describe('sortSeatsForReading', () => {
  it('y 다음 x 순서로 정렬하고 원본은 그대로', () => {
    const l = (label: string, x: number, y: number) => ({
      label,
      layout: { x, y, width: 64, height: 48 },
    })
    const input = [l('B2', 80, 64), l('A2', 80, 0), l('B1', 0, 64), l('A1', 0, 0)]
    const sorted = sortSeatsForReading(input)
    expect(sorted.map((s) => s.label)).toEqual(['A1', 'A2', 'B1', 'B2'])
    expect(input.map((s) => s.label)).toEqual(['B2', 'A2', 'B1', 'A1'])
  })
})
