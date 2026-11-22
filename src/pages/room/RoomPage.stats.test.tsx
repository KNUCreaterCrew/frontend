import { act, screen, waitFor, within } from '@testing-library/react'
import { renderApp } from '@/shared/test/renderApp'
import { server } from '@mocks/node'
import { roomHandler } from '@mocks/handlers/rooms'
import { statsHandlers } from '@mocks/handlers/stats'
import { ROOM_ID, buildRoom, mixedRoom } from '@mocks/fixtures/rooms'

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
  await within(region).findByText('0석')
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

  test('mixed: 확인 불가 때문에 판단이 갈리면 평소 대비 문장이 없다', async () => {
    renderApp(PATH, { scenario: 'mixed' })
    const region = await chartReady()
    expect(within(region).queryByText(/지금은 평소/)).not.toBeInTheDocument()
  })

  test('all-unknown: 평소 대비 문장이 없다', async () => {
    renderApp(PATH, { scenario: 'all-unknown' })
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
    const chart = within(region).getByText('0석').parentElement
    expect(chart?.querySelector('.opacity-40.bg-empty-tint')).not.toBeNull()
  })

  test('stats-seed: 오늘 기록이 없으면 평소 흐름만, 예시 데이터임을 알린다', async () => {
    renderApp(PATH, { scenario: 'stats-seed' })
    const region = await chartReady()
    expect(
      within(region).getByText('오늘은 아직 기록이 없어요. 평소 화요일 흐름만 보여요.'),
    ).toBeInTheDocument()
    expect(within(region).getByText('평소 값은 최근 4주 예시 데이터예요.')).toBeInTheDocument()
    expect(within(region).getByText('평소 화요일 (예시 데이터)')).toBeInTheDocument()
  })

  test('stats-mixed: 평소 값에 예시 데이터가 섞여 있음을 알린다', async () => {
    renderApp(PATH, { scenario: 'stats-mixed' })
    const region = await chartReady()
    expect(within(region).getByText('평소 값에는 예시 데이터가 섞여 있어요.')).toBeInTheDocument()
  })

  test('stats-empty: 안내만 보이고 그래프가 없다', async () => {
    renderApp(PATH, { scenario: 'stats-empty' })
    const region = await statsRegion()
    expect(await within(region).findByText('아직 기록이 없어요.')).toBeInTheDocument()
    expect(within(region).queryByText('0석')).not.toBeInTheDocument()
    expect(within(region).queryByText(/평소 화요일/)).not.toBeInTheDocument()
  })

  test('stats-error: 판에만 오류를 보이고, 다시 불러오면 그래프가 그려진다', async () => {
    const { user } = renderApp(PATH, { scenario: 'stats-error' })
    const region = await statsRegion()
    expect(await within(region).findByText('빈자리 흐름을 불러오지 못했어요.')).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 1, name: ROOM_NAME })).toBeInTheDocument()
    expect(seatButtons()).toHaveLength(4)
    server.use(...statsHandlers())
    await user.click(within(region).getByRole('button', { name: '다시 불러오기' }))
    await within(region).findByText('0석')
    expect(within(region).queryByText('빈자리 흐름을 불러오지 못했어요.')).not.toBeInTheDocument()
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
