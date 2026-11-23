import { act, screen, waitFor, within } from '@testing-library/react'
import { HttpResponse, http } from 'msw'
import { renderApp } from '@/shared/test/renderApp'
import { server } from '@mocks/node'
import { roomHandler } from '@mocks/handlers/rooms'
import {
  DAILY_STATS_URL,
  dailyStatsHandler,
  statsHandlers,
  weeklyStatsHandler,
} from '@mocks/handlers/stats'
import { ROOM_ID, buildRoom, mixedRoom } from '@mocks/fixtures/rooms'
import { emptyDailyStats, emptyWeeklyStats } from '@mocks/fixtures/stats'

const PATH = `/rooms/${ROOM_ID}`
const ROOM_NAME = '제1실습실 (예시)'
const REGION = '오늘 빈자리 흐름'
const SEAT_NAME = /^[A-E]\d+ /

function seatButtons(): HTMLElement[] {
  return screen
    .queryAllByRole('button')
    .filter((b) => SEAT_NAME.test(b.getAttribute('aria-label') ?? b.textContent ?? ''))
}

async function statsRegion(): Promise<HTMLElement> {
  return screen.findByRole('region', { name: REGION })
}

// 그래프가 그려질 때까지(축 글자가 보일 때까지) 기다린다
async function chartReady(): Promise<HTMLElement> {
  const region = await statsRegion()
  await within(region).findAllByText('0석')
  return region
}

describe('방 화면 오늘 빈자리 흐름', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true })
    // 화요일 14시 5분(KST)
    vi.setSystemTime(new Date('2026-11-24T14:05:00+09:00'))
  })
  afterEach(() => {
    vi.useRealTimers()
  })

  test('판은 좌석도 뒤에 오고, live 영역을 더하지 않는다', async () => {
    const { container } = renderApp(PATH)
    const region = await chartReady()
    const a1 = seatButtons()[0]!
    expect(a1.getAttribute('aria-label') ?? a1.textContent).toMatch(/^A1/)
    expect(a1.compareDocumentPosition(region) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    expect(within(region).getByRole('heading', { level: 2, name: REGION })).toBeInTheDocument()
    expect(container.querySelectorAll('[aria-live="polite"]')).toHaveLength(2)
  })

  test('확인 불가 때문에 판단이 갈리면 평소 대비 문장이 없다', async () => {
    server.use(roomHandler({ [ROOM_ID]: { ...mixedRoom, edge_online: false } }))
    renderApp(PATH)
    const region = await chartReady()
    expect(within(region).queryByText(/지금은 평소/)).not.toBeInTheDocument()
  })

  test('offline: 평소 대비 문장이 없다', async () => {
    renderApp(PATH, { scenario: 'offline' })
    const region = await chartReady()
    expect(within(region).queryByText(/지금은 평소/)).not.toBeInTheDocument()
  })

  test('빈자리 2, 확인 불가 0 이면 평소 화요일보다 한산하다', async () => {
    const seats = mixedRoom.seats.map((seat, i) => ({
      ...seat,
      status: i < 2 ? ('EMPTY' as const) : ('OCCUPIED' as const),
      reason: null,
    }))
    server.use(roomHandler({ [ROOM_ID]: buildRoom(seats, { version: 12 }) }))
    renderApp(PATH)
    const region = await chartReady()
    expect(within(region).getByText('지금은 평소 화요일 이 시간보다 한산해요.')).toBeInTheDocument()
  })

  test('판 안에 화면 읽기용 요약이 있다', async () => {
    renderApp(PATH)
    const region = await chartReady()
    const summary = within(region).getByText(/^오늘 8시부터/)
    expect(summary).toHaveClass('sr-only')
  })

  test('범례: 기록 없는 시간과 잠깐만 본 시간이 있으면 범례에 더하고 흐리게 그린다', async () => {
    renderApp(PATH)
    const region = await chartReady()
    const legend = within(region)
      .getAllByRole('listitem')
      .map((li) => li.textContent)
    expect(legend).toEqual(['오늘 빈자리', '평소 화요일', '확인하지 못한 시간', '잠깐만 본 시간'])
    const chart = within(region).getAllByText('0석')[0]?.parentElement
    expect(chart?.querySelector('path[data-kind="lowConfidence"]')).toHaveAttribute(
      'opacity',
      '0.4',
    )
  })

  test('최근 값 점은 오늘 그래프에만 있고 요일별 평소 그래프에는 없다', async () => {
    renderApp(PATH)
    const region = await chartReady()
    const [today, weekday] = within(region)
      .getAllByText('0석')
      .map((label) => label.parentElement)
    expect(today?.querySelectorAll('[data-latest]')).toHaveLength(1)
    expect(weekday).toBeTruthy()
    expect(weekday?.querySelectorAll('[data-latest]')).toHaveLength(0)
  })

  test('stats-seed: 오늘 기록이 없으면 평소 흐름만, 예시 데이터임을 알린다', async () => {
    renderApp(PATH, { scenario: 'stats-seed' })
    const region = await chartReady()
    expect(
      within(region).getByText('오늘은 아직 기록이 없어요. 평소 화요일 흐름만 보여요.'),
    ).toBeInTheDocument()
    expect(within(region).getAllByText('평소 값은 최근 4주 예시 데이터예요.')).toHaveLength(2)
    expect(within(region).getByText('평소 화요일 (예시 데이터)')).toBeInTheDocument()
  })

  test('stats-mixed: 평소 값에 예시 데이터가 섞여 있음을 알린다', async () => {
    renderApp(PATH, { scenario: 'stats-mixed' })
    const region = await chartReady()
    expect(within(region).getAllByText('평소 값에는 예시 데이터가 섞여 있어요.')).toHaveLength(2)
  })

  test('stats-mixed: 빈자리 2, 확인 불가 0 이라 평소 대비 문장이 보인다', async () => {
    renderApp(PATH, { scenario: 'stats-mixed' })
    const region = await chartReady()
    expect(within(region).getByText('지금은 평소 화요일 이 시간보다 한산해요.')).toBeInTheDocument()
  })

  test('오늘 응답이 OBSERVED 여도 관측된 칸이 없으면 기록 없음 안내를 보이고 오늘 범례는 없다', async () => {
    server.use(dailyStatsHandler((date) => ({ ...emptyDailyStats(date), data_source: 'OBSERVED' })))
    renderApp(PATH)
    const region = await chartReady()
    expect(
      within(region).getByText('오늘은 아직 기록이 없어요. 평소 화요일 흐름만 보여요.'),
    ).toBeInTheDocument()
    const legend = within(region)
      .getAllByRole('listitem')
      .map((li) => li.textContent)
    expect(legend).toContain('평소 화요일')
    expect(legend).not.toContain('오늘 빈자리')
    expect(within(region).queryByText(/^오늘 8시부터/)).not.toBeInTheDocument()
  })

  test('stats-empty: 안내만 보이고 그래프가 없다', async () => {
    renderApp(PATH, { scenario: 'stats-empty' })
    const region = await statsRegion()
    expect(await within(region).findByText('아직 기록이 없어요.')).toBeInTheDocument()
    expect(within(region).queryByText('0석')).not.toBeInTheDocument()
    expect(within(region).queryByText(/평소 화요일/)).not.toBeInTheDocument()
  })

  test('오늘 기록이 없고 평소 칸이 그래프 범위 밖에만 있으면 안내만 보인다', async () => {
    server.use(
      dailyStatsHandler(emptyDailyStats),
      weeklyStatsHandler(() => {
        const weekly = emptyWeeklyStats(Date.now())
        return {
          ...weekly,
          data_source: 'OBSERVED',
          cells: weekly.cells.map((cell) =>
            cell.weekday === 'TUE' && cell.hour === 3
              ? { ...cell, observed_days: 4, observed_minutes: 240, avg_available_seats: 2 }
              : cell,
          ),
        }
      }),
    )
    renderApp(PATH)
    const region = await statsRegion()
    expect(await within(region).findByText('아직 기록이 없어요.')).toBeInTheDocument()
    expect(within(region).queryByText(/흐름만 보여요/)).not.toBeInTheDocument()
    expect(within(region).queryByText('0석')).not.toBeInTheDocument()
  })

  test('정상 판은 몇 분이 지나도 갱신 경고가 없다', async () => {
    renderApp(PATH)
    const region = await chartReady()
    await act(() => vi.advanceTimersByTimeAsync(150_000))
    expect(within(region).getAllByText('0석')).not.toHaveLength(0)
    expect(within(region).queryByText(/갱신하지 못했어요|1분 넘게/)).not.toBeInTheDocument()
  })

  test('오늘 기록 재조회가 실패하면 그래프는 두고 굵은 갱신 경고를 보인다', async () => {
    renderApp(PATH)
    const region = await chartReady()
    server.use(
      http.get(DAILY_STATS_URL, () =>
        HttpResponse.json({ detail: '일시적인 오류입니다.' }, { status: 500 }),
      ),
    )
    await act(() => vi.advanceTimersByTimeAsync(61_000))
    const notice = await within(region).findByText(/^갱신하지 못했어요, /)
    expect(notice).toHaveClass('font-bold')
    expect(within(region).getAllByText('0석')).not.toHaveLength(0)
  })

  test('재조회가 20분 실패해도 받지 못한 시간을 확인하지 못한 시간으로 그리지 않는다', async () => {
    server.use(
      dailyStatsHandler((date) => {
        const base = emptyDailyStats(date)
        return {
          ...base,
          data_source: 'OBSERVED',
          buckets: base.buckets.map((b, i) =>
            i >= 48 && i <= 84
              ? { ...b, observed_minutes: 10, avg_available_seats: 2, avg_unknown_seats: 0 }
              : b,
          ),
        }
      }),
    )
    renderApp(PATH)
    const region = await chartReady()
    const hatching = () => region.querySelectorAll('.inset-y-0.pattern-unknown').length
    const legend = () =>
      within(region)
        .getAllByRole('listitem')
        .map((li) => li.textContent)
    expect(hatching()).toBe(0)
    server.use(
      http.get(DAILY_STATS_URL, () =>
        HttpResponse.json({ detail: '일시적인 오류입니다.' }, { status: 500 }),
      ),
    )
    await act(() => vi.advanceTimersByTimeAsync(20 * 60_000))
    expect(await within(region).findByText(/^갱신하지 못했어요, /)).toBeInTheDocument()
    expect(hatching()).toBe(0)
    expect(legend()).not.toContain('확인하지 못한 시간')
    expect(within(region).getByText(/^오늘 8시부터/).textContent).not.toContain('확인하지 못한')
  })

  test('stats-error: 판에만 오류를 보이고, 다시 불러오면 그래프가 그려진다', async () => {
    const { user } = renderApp(PATH, { scenario: 'stats-error' })
    const region = await statsRegion()
    expect(await within(region).findByText('빈자리 흐름을 불러오지 못했어요.')).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 1, name: ROOM_NAME })).toBeInTheDocument()
    expect(seatButtons()).toHaveLength(4)
    server.use(...statsHandlers())
    await user.click(within(region).getByRole('button', { name: '다시 불러오기' }))
    await within(region).findAllByText('0석')
    expect(within(region).queryByText('빈자리 흐름을 불러오지 못했어요.')).not.toBeInTheDocument()
    expect(within(region).getByRole('heading', { level: 2, name: REGION })).toHaveFocus()
  })

  test('stats-loading: 200ms 뒤 판 안에 뼈대를 보인다', async () => {
    renderApp(PATH, { scenario: 'stats-loading' })
    const region = await statsRegion()
    expect(region).toHaveAttribute('aria-busy', 'true')
    expect(region.querySelector('.bg-line')).toBeNull()
    await act(() => vi.advanceTimersByTimeAsync(250))
    expect(region.querySelector('.bg-line')).not.toBeNull()
  })

  test('not-found: 통계를 조회하지 않는다', async () => {
    let statsRequests = 0
    const count = ({ request }: { request: Request }) => {
      if (new URL(request.url).pathname.includes('/stats/')) statsRequests += 1
    }
    server.events.on('request:start', count)
    try {
      renderApp(PATH, { scenario: 'not-found' })
      expect(
        await screen.findByRole('heading', { level: 1, name: '이 방을 찾을 수 없어요' }),
      ).toBeInTheDocument()
      await act(() => vi.advanceTimersByTimeAsync(1000))
      expect(statsRequests).toBe(0)
      expect(screen.queryByRole('region', { name: REGION })).not.toBeInTheDocument()
    } finally {
      server.events.removeListener('request:start', count)
    }
  })

  test('no-seats: 판이 없다', async () => {
    renderApp(PATH, { scenario: 'no-seats' })
    expect(await screen.findByText('이 방에는 등록된 좌석이 없어요.')).toBeInTheDocument()
    await waitFor(() => expect(screen.queryByRole('region', { name: REGION })).toBeNull())
  })
})

describe('방 화면 요일별 평소 빈자리', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true })
    vi.setSystemTime(new Date('2026-11-24T14:05:00+09:00'))
  })
  afterEach(() => {
    vi.useRealTimers()
  })

  test('오늘 요일이 골라져 있고 평소 문장이 보인다', async () => {
    renderApp(PATH)
    const region = await chartReady()
    expect(
      within(region).getByRole('heading', { level: 3, name: '요일별 평소 빈자리' }),
    ).toBeInTheDocument()
    const group = within(region).getByRole('group', { name: '요일' })
    const buttons = within(group).getAllByRole('button')
    expect(buttons.map((b) => b.getAttribute('aria-label'))).toEqual([
      '월요일',
      '화요일',
      '수요일',
      '목요일',
      '금요일',
      '토요일',
      '일요일',
    ])
    expect(buttons.map((b) => b.textContent)).toEqual(['월', '화', '수', '목', '금', '토', '일'])
    expect(buttons.filter((b) => b.getAttribute('aria-pressed') === 'true')).toEqual([
      within(group).getByRole('button', { name: '화요일' }),
    ])
    expect(
      within(region).getByText('화요일은 보통 16시쯤 가장 붐비고 8시쯤 가장 한산해요.'),
    ).toBeInTheDocument()
  })

  test('다른 요일을 고르면 문장이 바뀌고 다시 조회하지 않는다', async () => {
    let weeklyRequests = 0
    const count = ({ request }: { request: Request }) => {
      if (new URL(request.url).pathname.includes('/stats/weekly')) weeklyRequests += 1
    }
    server.events.on('request:start', count)
    try {
      const { user } = renderApp(PATH)
      const region = await chartReady()
      const group = within(region).getByRole('group', { name: '요일' })
      await user.click(within(group).getByRole('button', { name: '토요일' }))
      expect(within(group).getByRole('button', { name: '토요일' })).toHaveAttribute(
        'aria-pressed',
        'true',
      )
      expect(within(group).getByRole('button', { name: '화요일' })).toHaveAttribute(
        'aria-pressed',
        'false',
      )
      expect(within(region).getByText('토요일은 시간대별 차이가 크지 않아요.')).toBeInTheDocument()
      expect(weeklyRequests).toBe(1)
    } finally {
      server.events.removeListener('request:start', count)
    }
  })

  test('stats-empty: 요일 영역이 없다', async () => {
    renderApp(PATH, { scenario: 'stats-empty' })
    const region = await statsRegion()
    await within(region).findByText('아직 기록이 없어요.')
    expect(within(region).queryByRole('heading', { level: 3 })).not.toBeInTheDocument()
    expect(within(region).queryByRole('group', { name: '요일' })).not.toBeInTheDocument()
  })

  test('stats-seed: 요일 영역에도 예시 데이터 출처가 보인다', async () => {
    renderApp(PATH, { scenario: 'stats-seed' })
    const region = await chartReady()
    const section = within(region).getByRole('group', { name: '요일' }).parentElement!
    expect(within(section).getByText('평소 값은 최근 4주 예시 데이터예요.')).toBeInTheDocument()
    expect(within(section).getByText('예시 데이터')).toBeInTheDocument()
  })
})
