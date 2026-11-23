import { describe, expect, it } from 'vitest'
import type { ChartBar } from './chartModel'
import { barPaths, latestBar, unknownBands } from './barPath'

const RANGE = { start: 480, end: 1440 }

function bar(startMinute: number, availablePct: number, extra: Partial<ChartBar> = {}): ChartBar {
  return { startMinute, widthMinutes: 60, kind: 'observed', availablePct, unknownPct: 0, ...extra }
}

describe('barPaths', () => {
  it('묶음마다 가로 윗선, 이어진 묶음 사이에는 따로 그릴 세로 이음, 면은 바닥까지 닫힌 하나다', () => {
    const paths = barPaths([bar(600, 50), bar(660, 25)], RANGE.start, RANGE.end)
    expect(paths.observed.top).toBe('M12.5 50H18.75M18.75 75H25')
    expect(paths.observed.rise).toBe('M18.75 50V75')
    expect(paths.observed.area).toBe('M12.5 100V50H18.75V75H25V100Z')
    expect(paths.lowConfidence).toEqual({ top: '', rise: '', area: '' })
  })

  it('비어 있는 시간이 있으면 세로 이음 없이 면을 끊고 새로 시작한다', () => {
    const paths = barPaths([bar(600, 50), bar(720, 25)], RANGE.start, RANGE.end)
    expect(paths.observed.top).toBe('M12.5 50H18.75M25 75H31.25')
    expect(paths.observed.rise).toBe('')
    expect(paths.observed.area).toBe('M12.5 100V50H18.75V100ZM25 100V75H31.25V100Z')
  })

  it('잠깐만 본 묶음은 따로 모으고, 이웃과의 세로 이음은 뒤 묶음 쪽에 둔다', () => {
    const paths = barPaths(
      [bar(600, 50), bar(660, 25, { kind: 'lowConfidence' }), bar(720, 75)],
      RANGE.start,
      RANGE.end,
    )
    expect(paths.observed.top).toBe('M12.5 50H18.75M25 25H31.25')
    expect(paths.observed.rise).toBe('M25 75V25')
    expect(paths.lowConfidence.top).toBe('M18.75 75H25')
    expect(paths.lowConfidence.rise).toBe('M18.75 50V75')
    expect(paths.observed.area).toBe('M12.5 100V50H18.75V100ZM25 100V25H31.25V100Z')
    expect(paths.lowConfidence.area).toBe('M18.75 100V75H25V100Z')
  })

  it('잠깐만 본 묶음이 먼저 오고 0% 와 100% 가 섞여도 면은 제 종류에서 닫히고, 높이가 같으면 이음이 없다', () => {
    const paths = barPaths(
      [bar(600, 0, { kind: 'lowConfidence' }), bar(660, 100), bar(720, 100)],
      RANGE.start,
      RANGE.end,
    )
    expect(paths.lowConfidence.area).toBe('M12.5 100V100H18.75V100Z')
    expect(paths.observed.top).toBe('M18.75 0H25M25 0H31.25')
    expect(paths.observed.rise).toBe('M18.75 100V0')
    expect(paths.observed.area).toBe('M18.75 100V0H25V0H31.25V100Z')
  })

  it('폭이 다른 묶음도 끝과 시작이 맞으면 잇고, 범위 밖 시각은 판 끝으로 자른다', () => {
    const paths = barPaths(
      [bar(420, 50), { ...bar(480, 25), widthMinutes: 10 }, bar(1430, 75)],
      RANGE.start,
      RANGE.end,
    )
    expect(paths.observed.top).toBe('M0 50H0M0 75H1.04M98.96 25H100')
    expect(paths.observed.rise).toBe('M0 50V75')
  })

  it('막대가 없으면 모두 빈 문자열이다', () => {
    expect(barPaths([], RANGE.start, RANGE.end)).toEqual({
      observed: { top: '', rise: '', area: '' },
      lowConfidence: { top: '', rise: '', area: '' },
    })
  })
})

describe('unknownBands', () => {
  it('이어진 확인 불가 묶음은 빈자리 위에 쌓인 다각형 하나다', () => {
    const bands = unknownBands(
      [bar(600, 50, { unknownPct: 25 }), bar(660, 25, { unknownPct: 50 })],
      RANGE.start,
      RANGE.end,
    )
    expect(bands).toEqual([
      'polygon(12.5% 50%, 18.75% 50%, 18.75% 75%, 25% 75%, 25% 25%, 18.75% 25%, 18.75% 25%, 12.5% 25%)',
    ])
  })

  it('확인 불가가 없는 묶음에서 끊는다', () => {
    const bands = unknownBands(
      [bar(600, 50, { unknownPct: 25 }), bar(660, 25), bar(720, 0, { unknownPct: 100 })],
      RANGE.start,
      RANGE.end,
    )
    expect(bands).toHaveLength(2)
    expect(bands[1]).toBe('polygon(25% 100%, 31.25% 100%, 31.25% 0%, 25% 0%)')
  })

  it('확인 불가 묶음 사이에 빈 시간이 있으면 잇지 않는다', () => {
    const bands = unknownBands(
      [bar(600, 50, { unknownPct: 25 }), bar(720, 50, { unknownPct: 25 })],
      RANGE.start,
      RANGE.end,
    )
    expect(bands).toHaveLength(2)
  })
})

describe('latestBar', () => {
  it('지금을 품은 묶음을 고르고 점은 지금 위치에 둔다', () => {
    expect(latestBar([bar(600, 50), bar(660, 25)], 690)).toEqual({ minute: 690, pct: 25 })
  })

  it('마지막 묶음이 끝난 지 한 묶음 안이면 그 끝에 둔다', () => {
    expect(latestBar([bar(600, 50), bar(660, 25)], 750)).toEqual({ minute: 720, pct: 25 })
  })

  it('마지막 기록이 오래됐거나 지금이 없으면 점을 두지 않는다', () => {
    expect(latestBar([bar(600, 50)], 800)).toBeNull()
    expect(latestBar([bar(600, 50)], null)).toBeNull()
    expect(latestBar([], 600)).toBeNull()
  })
})
