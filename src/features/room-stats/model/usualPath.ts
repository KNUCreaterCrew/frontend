import type { UsualStep } from './chartModel'

const STEP_MINUTES = 60

const num = (value: number) => String(Number(value.toFixed(2)))

// viewBox 0 0 100 100 안의 path. 이어진 시간은 세로 이음으로 잇고, 빈 시간에서는 끊어 새로 시작한다
export function usualPath(
  steps: UsualStep[],
  rangeStart: number,
  rangeEnd: number,
  stepMinutes: number = STEP_MINUTES,
): string {
  const span = rangeEnd - rangeStart
  const x = (minute: number) =>
    num(((Math.min(Math.max(minute, rangeStart), rangeEnd) - rangeStart) / span) * 100)
  const y = (pct: number) => num(100 - pct)
  let d = ''
  let previous: UsualStep | null = null
  for (const step of steps) {
    const joined = previous !== null && previous.startMinute + stepMinutes === step.startMinute
    d += joined
      ? `V${y(step.pct)}H${x(step.startMinute + stepMinutes)}`
      : `M${x(step.startMinute)} ${y(step.pct)}H${x(step.startMinute + stepMinutes)}`
    previous = step
  }
  return d
}
