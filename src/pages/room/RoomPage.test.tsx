import { act, screen, waitFor, within } from '@testing-library/react'
import { focusManager, onlineManager } from '@tanstack/react-query'
import { HttpResponse, delay, http } from 'msw'
import { renderApp } from '@/shared/test/renderApp'
import { server } from '@mocks/node'
import { roomHandler } from '@mocks/handlers/rooms'
import { ROOM_ID, deployedOfflineRoom, mixedRoom } from '@mocks/fixtures/rooms'

const PATH = `/rooms/${ROOM_ID}`
const ROOM_NAME = '제1실습실 (예시)'
const SEAT_NAME = /^[A-E]\d+ /

function rowValue(term: string): HTMLElement {
  const dt = screen.getByText(term, { selector: 'dt' })
  const dd = dt.parentElement?.querySelector('dd')
  if (!dd) throw new Error(`${term} 값이 없어요`)
  return dd
}

function seatButtons(): HTMLElement[] {
  return screen
    .queryAllByRole('button')
    .filter((b) => SEAT_NAME.test(b.getAttribute('aria-label') ?? b.textContent ?? ''))
}

describe('방 화면', () => {
  test('mixed: 이름, 요약 표, 좌석, 범례', async () => {
    renderApp(PATH, { scenario: 'mixed' })
    expect(await screen.findByRole('heading', { level: 1, name: ROOM_NAME })).toBeInTheDocument()
    expect(rowValue('빈자리')).toHaveTextContent('2석')
    expect(rowValue('전체')).toHaveTextContent('4석')
    expect(rowValue('확인 불가')).toHaveTextContent('0석')
    expect(rowValue('혼잡도')).toHaveTextContent('보통')
    expect(
      screen
        .getAllByText(/^(빈자리|확인 불가|전체|혼잡도)$/, { selector: 'dt' })
        .map((e) => e.textContent),
    ).toEqual(['빈자리', '확인 불가', '전체', '혼잡도'])
    expect(screen.getByText('빈자리', { selector: 'dt' })).toHaveClass('whitespace-nowrap')
    expect(screen.getByText('2', { selector: 'p[aria-hidden="true"]' })).toHaveClass('shrink-0')
    expect(screen.queryByText('지금은 모든 자리를 확인할 수 없어요.')).not.toBeInTheDocument()
    expect(
      seatButtons().map((b) => (b.getAttribute('aria-label') ?? b.textContent ?? '').slice(0, 2)),
    ).toEqual(['A1', 'A2', 'B1', 'B2'])
    expect(screen.getByRole('button', { name: /^B2 빈자리/ })).toBeInTheDocument()
    expect(screen.getByText('짐 있음', { selector: 'li' })).toBeInTheDocument()
    expect(screen.queryByText('장치 연결이 끊겼어요')).not.toBeInTheDocument()
    expect(screen.getByRole('link', { name: '방 목록' })).toHaveAttribute('href', '/')
  })

  test('all-unknown: 장치가 연결돼 있으면 확인 불가 좌석을 빈자리로 표시한다', async () => {
    renderApp(PATH, { scenario: 'all-unknown' })
    expect(await screen.findByRole('heading', { level: 1, name: ROOM_NAME })).toBeInTheDocument()
    expect(rowValue('빈자리')).toHaveTextContent('4석')
    expect(rowValue('확인 불가')).toHaveTextContent('0석')
    expect(rowValue('혼잡도')).toHaveTextContent('여유')
    expect(screen.getByText('4', { selector: 'p[aria-hidden="true"]' })).toBeVisible()
    expect(screen.queryByText('지금은 모든 자리를 확인할 수 없어요.')).not.toBeInTheDocument()
  })

  test('마지막 확인 시각은 상대 시각과 (시:분:초)만 끊을 수 있다', async () => {
    renderApp(PATH, { scenario: 'offline' })
    await screen.findByRole('heading', { level: 1, name: ROOM_NAME })
    const dd = rowValue('마지막 확인')
    expect(dd.textContent).toMatch(/^.+ \(\d\d:\d\d:\d\d\)$/)
    const chunks = Array.from(dd.querySelectorAll('span.whitespace-nowrap'))
    expect(chunks).toHaveLength(2)
    expect(chunks[1]).toHaveTextContent(/^\(\d\d:\d\d:\d\d\)$/)
    expect(chunks[0]).not.toHaveTextContent('(')
  })

  test('offline: 끊김 띠가 방 이름보다 앞에 있다', async () => {
    renderApp(PATH, { scenario: 'offline' })
    const h1 = await screen.findByRole('heading', { level: 1, name: ROOM_NAME })
    const h2 = screen.getByRole('heading', { level: 2, name: '장치 연결이 끊겼어요' })
    expect(h2.compareDocumentPosition(h1) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    expect(screen.getByText('지금은 이 방 자리를 확인할 수 없어요.')).toBeInTheDocument()
    expect(screen.queryByText(/^혼잡$/)).not.toBeInTheDocument()
    expect(screen.queryByText('지금은 모든 자리를 확인할 수 없어요.')).not.toBeInTheDocument()
  })

  test('배포 원문: 마지막 확인이 아직 확인하지 못함', async () => {
    server.use(roomHandler({ [ROOM_ID]: deployedOfflineRoom }))
    renderApp(PATH)
    await screen.findByRole('heading', { level: 1, name: ROOM_NAME })
    expect(rowValue('마지막 확인')).toHaveTextContent('아직 확인하지 못함')
  })

  test('no-seats: 안내 문구만 있고 혼잡도와 좌석은 없다', async () => {
    renderApp(PATH, { scenario: 'no-seats' })
    expect(await screen.findByText('이 방에는 등록된 좌석이 없어요.')).toBeVisible()
    expect(screen.queryByText(/^혼잡$/)).not.toBeInTheDocument()
    expect(screen.queryByText('혼잡도')).not.toBeInTheDocument()
    expect(seatButtons()).toHaveLength(0)
  })

  test('many-seats: 콘센트 아이콘이 숨은 동안 범례가 확대 안내를 붙인다', async () => {
    const { user } = renderApp(PATH, { scenario: 'many-seats' })
    await screen.findByRole('heading', { level: 1, name: ROOM_NAME })
    expect(await screen.findByText('확대하면 보여요')).toBeVisible()
    await user.click(screen.getByRole('button', { name: '확대' }))
    expect(screen.queryByText('확대하면 보여요')).not.toBeInTheDocument()
  })

  test('mixed: 콘센트 확대 안내는 없다', async () => {
    renderApp(PATH, { scenario: 'mixed' })
    await screen.findByRole('heading', { level: 1, name: ROOM_NAME })
    expect(screen.queryByText('확대하면 보여요')).not.toBeInTheDocument()
  })

  test('many-seats: 좌석 40개와 확대 버튼', async () => {
    renderApp(PATH, { scenario: 'many-seats' })
    await screen.findByRole('heading', { level: 1, name: ROOM_NAME })
    expect(seatButtons()).toHaveLength(40)
    expect(screen.getByRole('button', { name: /확대/ })).toBeInTheDocument()
  })

  test('모르는 상태 코드는 그 좌석만 알 수 없는 상태', async () => {
    const seats = mixedRoom.seats.map((s) => (s.label === 'B2' ? { ...s, status: 'RESERVED' } : s))
    server.use(roomHandler({ [ROOM_ID]: { ...mixedRoom, seats } }))
    renderApp(PATH)
    expect(await screen.findByRole('heading', { level: 1, name: ROOM_NAME })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /B2 알 수 없는 상태/ })).toBeInTheDocument()
  })
})

describe('없는 방과 오류', () => {
  afterEach(() => {
    focusManager.setFocused(undefined)
    onlineManager.setOnline(true)
  })

  test('not-found: 안내와 목록 링크, 다시 시도 없음, 요청은 한 번', async () => {
    let calls = 0
    server.use(
      http.get('*/api/v1/rooms/:roomId', () => {
        calls += 1
        return HttpResponse.json({ detail: '없음' }, { status: 404 })
      }),
    )
    renderApp(PATH)
    expect(
      await screen.findByRole('heading', { level: 1, name: '이 방을 찾을 수 없어요' }),
    ).toBeInTheDocument()
    expect(screen.getByText(/IT4-101 방은 등록되어 있지 않아요/)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: '방 목록으로' })).toHaveAttribute('href', '/')
    expect(screen.queryByRole('button', { name: '다시 시도' })).not.toBeInTheDocument()
    expect(calls).toBe(1)
  })

  test('not-found: 창이 다시 포커스돼도 다시 조회하지 않고 화면이 그대로다', async () => {
    let calls = 0
    server.use(
      http.get('*/api/v1/rooms/:roomId', () => {
        calls += 1
        return HttpResponse.json({ detail: '없음' }, { status: 404 })
      }),
    )
    renderApp(PATH)
    await screen.findByRole('heading', { level: 1, name: '이 방을 찾을 수 없어요' })
    act(() => {
      focusManager.setFocused(false)
      focusManager.setFocused(true)
    })
    await new Promise((r) => setTimeout(r, 50))
    expect(calls).toBe(1)
    expect(screen.getByRole('heading', { level: 1, name: '이 방을 찾을 수 없어요' })).toBeVisible()
  })

  test('네트워크 오류는 연결 확인 안내', async () => {
    server.use(http.get('*/api/v1/rooms/:roomId', () => HttpResponse.error()))
    renderApp(PATH)
    expect(await screen.findByText('방 정보를 불러오지 못했어요')).toBeInTheDocument()
    expect(screen.getByText('인터넷 연결을 확인해 주세요.')).toBeInTheDocument()
  })

  test('방 ID 는 인코딩해서 요청하고 원래 모양으로 보인다', async () => {
    let path = ''
    server.use(
      http.get('*/api/v1/rooms/:roomId', ({ request }) => {
        path = new URL(request.url).pathname
        return HttpResponse.json({ detail: '없음' }, { status: 404 })
      }),
    )
    renderApp('/rooms/' + encodeURIComponent('A B/C'))
    expect(await screen.findByText(/A B\/C 방은 등록되어 있지 않아요/)).toBeInTheDocument()
    expect(screen.getAllByRole('link', { name: /방 목록/ })).toHaveLength(1)
    expect(path).toBe('/api/v1/rooms/A%20B%2FC')
  })

  test('error: 다시 시도를 누르면 다시 불러온다', async () => {
    const { user } = renderApp(PATH, { scenario: 'error' })
    expect(await screen.findByText('방 정보를 불러오지 못했어요')).toBeInTheDocument()
    expect(screen.getByText('잠시 뒤 다시 시도해 주세요.')).toBeInTheDocument()
    expect(screen.getByText(`방 ID: ${ROOM_ID}`)).toBeInTheDocument()
    server.use(roomHandler({ [ROOM_ID]: mixedRoom }))
    await user.click(screen.getByRole('button', { name: '다시 시도' }))
    expect(await screen.findByRole('heading', { level: 1, name: ROOM_NAME })).toBeInTheDocument()
  })
})

describe('재조회 실패', () => {
  afterEach(() => focusManager.setFocused(undefined))

  test('좌석도는 그대로 두고 상단 줄만 갱신 실패로 바뀐다', async () => {
    renderApp(PATH, { scenario: 'mixed' })
    await screen.findByRole('heading', { level: 1, name: ROOM_NAME })
    expect(seatButtons()).toHaveLength(4)
    server.use(http.get('*/api/v1/rooms/:roomId', () => new HttpResponse(null, { status: 500 })))
    act(() => {
      focusManager.setFocused(false)
      focusManager.setFocused(true)
    })
    expect(await screen.findByText(/^갱신하지 못했어요/)).toHaveClass('font-bold')
    expect(seatButtons()).toHaveLength(4)
  })
})

describe('오프라인 로딩', () => {
  afterEach(() => onlineManager.setOnline(true))

  test('인터넷이 없으면 연결 안내 한 줄이 보인다', async () => {
    onlineManager.setOnline(false)
    renderApp(PATH, { scenario: 'mixed' })
    expect(await screen.findByRole('status')).toHaveTextContent(
      '인터넷에 연결되어 있지 않아요. 연결되면 바로 불러올게요.',
    )
    expect(screen.queryByText(/서버를 깨우는 중이에요/)).not.toBeInTheDocument()
  })
})

describe('로딩', () => {
  beforeEach(() => vi.useFakeTimers({ shouldAdvanceTime: true }))
  afterEach(() => {
    vi.useRealTimers()
    onlineManager.setOnline(true)
  })

  const advance = (ms: number) => act(() => vi.advanceTimersByTimeAsync(ms))

  test('스켈레톤은 200ms 뒤, 안내는 5초와 60초, 90초에 오류', async () => {
    renderApp(PATH, { scenario: 'loading' })
    expect(document.querySelector('[aria-busy="true"]')).toBeNull()
    await advance(250)
    const busy = document.querySelector('[aria-busy="true"]')
    expect(busy).not.toBeNull()
    // 실제 화면 모양: 요약 유리 자리와 바닥판의 좌석 자리
    expect(document.querySelector('[data-skeleton="summary"]')).not.toBeNull()
    expect(busy!.querySelector('[data-skeleton="floor"]')).not.toBeNull()
    await advance(5000)
    expect(
      within(screen.getByRole('status')).getByText(/서버를 깨우는 중이에요/),
    ).toBeInTheDocument()
    await advance(55_000)
    expect(screen.getByRole('status')).toHaveTextContent('생각보다 오래 걸려요')
    await advance(30_000)
    expect(
      screen.getByRole('heading', { level: 1, name: '방 정보를 불러오지 못했어요' }),
    ).toBeInTheDocument()
  })

  test('오프라인으로 오래 기다린 뒤 연결되어도 바로 오류 화면이 되지 않는다', async () => {
    onlineManager.setOnline(false)
    server.use(
      http.get('*/api/v1/rooms/:roomId', async () => {
        await delay('infinite')
        return HttpResponse.json(mixedRoom)
      }),
    )
    renderApp(PATH)
    await advance(120_000)
    expect(screen.getByRole('status')).toHaveTextContent('인터넷에 연결되어 있지 않아요')
    act(() => onlineManager.setOnline(true))
    await advance(3000)
    expect(screen.queryByText('방 정보를 불러오지 못했어요')).not.toBeInTheDocument()
    expect(screen.getByRole('status')).toBeInTheDocument()
    onlineManager.setOnline(true)
  })

  test('재시도 요청이 매달린 채 90초가 지나면 마지막 network 오류로 연결 안내를 보인다', async () => {
    let calls = 0
    server.use(
      http.get('*/api/v1/rooms/:roomId', async () => {
        calls += 1
        if (calls === 1) return HttpResponse.error()
        await delay('infinite')
        return HttpResponse.json(mixedRoom)
      }),
    )
    renderApp(PATH, { keepRetry: true })
    // 90초에 포기하고, 매달린 재시도가 90초 제한으로 끊기는 91초보다 앞에서 멈춘다.
    await advance(90_500)
    expect(calls).toBeGreaterThanOrEqual(2)
    expect(
      screen.getByRole('heading', { level: 1, name: '방 정보를 불러오지 못했어요' }),
    ).toBeInTheDocument()
    expect(screen.getByText('인터넷 연결을 확인해 주세요.')).toBeInTheDocument()
  })

  test('다시 시도하면 경과가 0부터 센다', async () => {
    const { user } = renderApp(PATH, { scenario: 'loading' })
    await advance(91_000)
    const retry = await screen.findByRole('button', { name: '다시 시도' })
    await user.click(retry)
    await advance(1000)
    await waitFor(() => expect(document.querySelector('[aria-busy="true"]')).not.toBeNull())
    expect(screen.queryByText(/서버를 깨우는 중이에요/)).not.toBeInTheDocument()
    expect(screen.queryByText('방 정보를 불러오지 못했어요')).not.toBeInTheDocument()
    await advance(5000)
    expect(screen.getByRole('status')).toHaveTextContent('서버를 깨우는 중이에요')
  })
})
