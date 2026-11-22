import { describe, expect, it } from 'vitest'
import { buildTodayChart, buildWeekdayChart } from './chartModel'
import { bucket, daily, wcell, weekly } from './fixtures'

describe('buildTodayChart', () => {
  const stats = daily([
    bucket('10:00', 6, 1.7, 0.2),
    bucket('10:10', 0, null, null),
    bucket('10:20', 3, 2, 0),
    bucket('10:30', 10, 0, 0),
  ])

  it('빈자리와 확인 불가 평균을 좌석 수 비율로 바꾼다', () => {
    const first = buildTodayChart(stats, null, 'TUE', 640).bars[0]
    expect(first).toMatchObject({ startMinute: 600, widthMinutes: 10, kind: 'observed' })
    expect(first?.availablePct).toBeCloseTo(42.5)
    expect(first?.unknownPct).toBeCloseTo(5)
  })

  it('5분 미만 관측 칸은 lowConfidence', () => {
    const bars = buildTodayChart(stats, null, 'TUE', 640).bars
    expect(bars.find((b) => b.startMinute === 620)?.kind).toBe('lowConfidence')
  })

  it('빈자리 0 칸은 막대이지 빈 구간이 아니다', () => {
    const chart = buildTodayChart(stats, null, 'TUE', 640)
    expect(chart.bars.find((b) => b.startMinute === 630)).toMatchObject({ availablePct: 0 })
    expect(chart.missingSpans).toEqual([{ startMinute: 610, endMinute: 620 }])
  })

  it('지금 이후의 null 칸은 앞으로 올 시간이라 구간에 넣지 않는다', () => {
    expect(buildTodayChart(stats, null, 'TUE', 540).missingSpans).toEqual([])
    expect(buildTodayChart(stats, null, 'TUE', 615).missingSpans).toContainEqual({
      startMinute: 610,
      endMinute: 620,
    })
  })

  it('이어진 null 칸은 구간 하나로 합친다', () => {
    const d = daily([
      bucket('11:00', 10, 1, 0),
      bucket('11:10', 0, null, null),
      bucket('11:20', 0, null, null),
      bucket('11:30', 0, null, null),
      bucket('11:40', 0, null, null),
      bucket('11:50', 0, null, null),
      bucket('12:00', 10, 1, 0),
    ])
    expect(buildTodayChart(d, null, 'TUE', 800).missingSpans).toEqual([
      { startMinute: 670, endMinute: 720 },
    ])
  })

  it('범위는 첫 기록이 8시 이후면 8시, 이르면 그 시각부터 24시까지', () => {
    const late = buildTodayChart(daily([bucket('10:00', 10, 1, 0)]), null, 'TUE', 700)
    expect(late.rangeStartMinute).toBe(480)
    expect(late.rangeEndMinute).toBe(1440)
    expect(late.xTickHours).toEqual([9, 12, 15, 18, 21])
    const early = buildTodayChart(daily([bucket('06:00', 10, 1, 0)]), null, 'TUE', 700)
    expect(early.rangeStartMinute).toBe(360)
    expect(early.xTickHours).toEqual([6, 9, 12, 15, 18, 21])
  })

  it('범위 밖 칸은 버린다', () => {
    const d = daily([bucket('05:00', 0, null, null), bucket('08:00', 10, 1, 0)])
    const chart = buildTodayChart(d, null, 'TUE', 700)
    expect(chart.missingSpans).toEqual([])
  })

  it('평소 계단은 같은 요일의 평균이 있는 시만, 비율로 만든다', () => {
    const w = weekly([
      wcell('TUE', 9, 2),
      wcell('TUE', 10, null),
      wcell('TUE', 11, 1),
      wcell('MON', 12, 3),
      wcell('TUE', 7, 4),
    ])
    const chart = buildTodayChart(stats, w, 'TUE', 640)
    expect(chart.usualSteps).toEqual([
      { startMinute: 540, pct: 50 },
      { startMinute: 660, pct: 25 },
    ])
    expect(chart.totalSeats).toBe(4)
    expect(chart.nowMinute).toBe(640)
  })

  it('weekly 가 null 이면 평소 계단이 비어 있다', () => {
    expect(buildTodayChart(stats, null, 'TUE', 640).usualSteps).toEqual([])
  })

  it('dataSource 가 null 이면 막대와 빈 구간이 없다', () => {
    const none = daily([bucket('10:00', 0, null, null)], null)
    const chart = buildTodayChart(none, weekly([wcell('TUE', 9, 2)]), 'TUE', 700)
    expect(chart.bars).toEqual([])
    expect(chart.missingSpans).toEqual([])
    expect(chart.usualSteps).toEqual([{ startMinute: 540, pct: 50 }])
    expect(chart.rangeStartMinute).toBe(480)
  })
})

describe('buildWeekdayChart', () => {
  const w = weekly([
    wcell('TUE', 8, 2.6, 0.4),
    wcell('TUE', 9, null),
    wcell('TUE', 16, 0.7),
    wcell('MON', 12, 3),
  ])

  it('1시간 폭 막대를 만들고 평균 없는 시는 막대가 없다', () => {
    const chart = buildWeekdayChart(w, 'TUE', null)
    expect(chart.bars.map((b) => [b.startMinute, b.widthMinutes, b.kind])).toEqual([
      [480, 60, 'observed'],
      [960, 60, 'observed'],
    ])
    expect(chart.bars[0]?.availablePct).toBeCloseTo(65)
    expect(chart.bars[0]?.unknownPct).toBeCloseTo(10)
  })

  it('빈 구간과 평소 계단은 없고 지금은 받은 값 그대로', () => {
    const chart = buildWeekdayChart(w, 'TUE', 615)
    expect(chart.missingSpans).toEqual([])
    expect(chart.usualSteps).toEqual([])
    expect(chart.nowMinute).toBe(615)
    expect(buildWeekdayChart(w, 'TUE', null).nowMinute).toBeNull()
    expect(chart.rangeEndMinute).toBe(1440)
  })
})
