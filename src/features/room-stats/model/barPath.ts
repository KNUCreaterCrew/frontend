import type { BarKind, ChartBar } from './chartModel'

export interface KindPaths {
  /** 묶음마다의 가로 윗선. 그 시간 동안의 값이라 굵게 그린다 */
  top: string
  /** 이어진 묶음 사이의 세로 이음. 잠깐의 오르내림이 가장 굵은 획이 되지 않게 가늘게 그린다 */
  rise: string
  area: string
}

const num = (value: number) => String(Number(value.toFixed(2)))

function scale(rangeStart: number, rangeEnd: number) {
  const span = rangeEnd - rangeStart
  const ratio = (minute: number) =>
    ((Math.min(Math.max(minute, rangeStart), rangeEnd) - rangeStart) / span) * 100
  return {
    x: (minute: number) => num(ratio(minute)),
    y: (pct: number) => num(100 - pct),
  }
}

const endOf = (bar: ChartBar) => bar.startMinute + bar.widthMinutes

function joins(previous: ChartBar | null, bar: ChartBar): previous is ChartBar {
  return previous !== null && endOf(previous) === bar.startMinute
}

/**
 * viewBox 0 0 100 100 안의 계단 윗선, 세로 이음, 면. 면은 이어진 묶음을 한 path 로 이어 이웃 사이
 * 틈을 없애고 빈 시간에서만 끊는다. 잠깐만 본 묶음은 다르게 그리도록 따로 모은다.
 */
export function barPaths(
  bars: ChartBar[],
  rangeStart: number,
  rangeEnd: number,
): Record<BarKind, KindPaths> {
  const { x, y } = scale(rangeStart, rangeEnd)
  const out: Record<BarKind, KindPaths> = {
    observed: { top: '', rise: '', area: '' },
    lowConfidence: { top: '', rise: '', area: '' },
  }
  let previous: ChartBar | null = null
  for (const bar of bars) {
    const target = out[bar.kind]
    const top = y(bar.availablePct)
    const left = x(bar.startMinute)
    const right = x(endOf(bar))
    target.top += `M${left} ${top}H${right}`
    if (joins(previous, bar) && previous.availablePct !== bar.availablePct) {
      target.rise += `M${left} ${y(previous.availablePct)}V${top}`
    }
    if (joins(previous, bar) && previous.kind === bar.kind) {
      target.area += `V${top}H${right}`
    } else {
      if (previous !== null) out[previous.kind].area += 'V100Z'
      target.area += `M${left} 100V${top}H${right}`
    }
    previous = bar
  }
  if (previous !== null) out[previous.kind].area += 'V100Z'
  return out
}

/**
 * 확인 불가 빗금을 그릴 CSS polygon 목록(% 좌표). 빗금 무늬가 묶음마다 어긋나지 않게 그래프 전체
 * 크기의 판에 이 모양으로 잘라 쓴다.
 */
export function unknownBands(bars: ChartBar[], rangeStart: number, rangeEnd: number): string[] {
  const { x, y } = scale(rangeStart, rangeEnd)
  const runs: ChartBar[][] = []
  let previous: ChartBar | null = null
  for (const bar of bars) {
    if (bar.unknownPct > 0) {
      const last = runs.at(-1)
      if (last !== undefined && joins(previous, bar) && previous.unknownPct > 0) last.push(bar)
      else runs.push([bar])
    }
    previous = bar
  }
  return runs.map((run) => {
    const bottom = run.flatMap((bar) => [
      `${x(bar.startMinute)}% ${y(bar.availablePct)}%`,
      `${x(endOf(bar))}% ${y(bar.availablePct)}%`,
    ])
    const top = run
      .flatMap((bar) => [
        `${x(bar.startMinute)}% ${y(bar.availablePct + bar.unknownPct)}%`,
        `${x(endOf(bar))}% ${y(bar.availablePct + bar.unknownPct)}%`,
      ])
      .reverse()
    return `polygon(${[...bottom, ...top].join(', ')})`
  })
}

/**
 * 가장 최근 값 점의 자리. 지금을 품은 묶음이면 지금 위치, 마지막 묶음이 끝난 지 한 묶음 안이면
 * 그 끝. 그보다 오래됐으면 "지금 값"처럼 보이지 않게 두지 않는다.
 */
export function latestBar(
  bars: ChartBar[],
  nowMinute: number | null,
): { minute: number; pct: number } | null {
  if (nowMinute === null) return null
  const bar = bars.findLast((b) => b.startMinute <= nowMinute)
  if (bar === undefined) return null
  const end = endOf(bar)
  if (nowMinute < end) return { minute: nowMinute, pct: bar.availablePct }
  if (nowMinute - end <= bar.widthMinutes) return { minute: end, pct: bar.availablePct }
  return null
}
