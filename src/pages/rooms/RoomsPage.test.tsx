import { act, screen, waitFor, within } from '@testing-library/react'
import { HttpResponse, delay, http } from 'msw'
import type { RoomSummaryDto } from '@/entities/room'
import { renderApp } from '@/shared/test/renderApp'
import { server } from '@mocks/node'
import { ROOM_LIST_URL, roomListHandler } from '@mocks/handlers/rooms'
import { manyRooms, mixedRoom, toListItemDto } from '@mocks/fixtures/rooms'

const TITLE = '어느 방으로 갈까요'
const NAME = '제1실습실 (예시)'

function item(over: Partial<RoomSummaryDto> = {}): RoomSummaryDto {
  return { ...toListItemDto(mixedRoom), ...over }
}

function useList(items: RoomSummaryDto[] | (() => RoomSummaryDto[])) {
  server.use(roomListHandler(items))
}

async function onlyRow(): Promise<HTMLElement> {
  return within(await screen.findByRole('list')).getByRole('link')
}

describe('방 목록 화면 행', () => {
  test('mixed: 제목, 상단 줄, 링크 이름과 행 안의 값', async () => {
    renderApp('/', { scenario: 'mixed' })
    expect(await screen.findByRole('heading', { level: 1, name: TITLE })).toBeInTheDocument()
    expect(screen.getByText('ZeroFrame')).toBeInTheDocument()
    const link = await onlyRow()
    expect(screen.getAllByRole('link')).toHaveLength(1)
    expect(link).toHaveAccessibleName(`${NAME}, 빈자리 1석, 확인 불가 1석, 전체 4석, 보통`)
    expect(link).toHaveAttribute('href', '/rooms/IT4-101')
    const row = within(link)
    expect(row.getByText(NAME)).toBeInTheDocument()
    expect(row.getByText('1')).toBeInTheDocument()
    expect(row.getByText('확인 불가')).toBeInTheDocument()
    expect(row.getByText('1석')).toBeInTheDocument()
    expect(row.getByText('전체')).toBeInTheDocument()
    expect(row.getByText('4석')).toBeInTheDocument()
    expect(row.getByText('보통')).toBeInTheDocument()
  })

  test('서버 시작 직후(전부 확인 불가, 장치 끊김): 모름, 끊김 문장, 혼잡 없음', async () => {
    useList([
      item({
        total_seats: 4,
        available_seats: 0,
        unknown_seats: 4,
        congestion_level: 'HIGH',
        edge_online: false,
      }),
    ])
    renderApp('/')
    const link = await onlyRow()
    expect(link).toHaveAccessibleName(
      `${NAME}, 빈자리 모름, 확인 불가 4석, 전체 4석, 장치 연결이 끊겼어요`,
    )
    const row = within(link)
    expect(row.getByText('모름')).toBeInTheDocument()
    expect(row.getByText('장치 연결이 끊겼어요')).toBeInTheDocument()
    expect(row.getAllByText('4석')).toHaveLength(2)
    expect(link).not.toHaveTextContent('혼잡')
    expect(link).not.toHaveTextContent('0석')
  })

  test('연결됨 + 전부 확인 불가: 아직 확인하지 못했어요, 혼잡 없음', async () => {
    useList([
      item({ total_seats: 4, available_seats: 0, unknown_seats: 4, congestion_level: 'HIGH' }),
    ])
    renderApp('/')
    const link = await onlyRow()
    expect(within(link).getByText('아직 자리를 확인하지 못했어요')).toBeInTheDocument()
    expect(link).not.toHaveTextContent('혼잡')
    expect(link).toHaveAccessibleName(
      `${NAME}, 빈자리 모름, 확인 불가 4석, 전체 4석, 아직 자리를 확인하지 못했어요`,
    )
  })

  test('INTERFACES 예시(1석, 빈자리 0, HIGH, 연결됨): 0 과 혼잡 표시', async () => {
    useList([
      item({
        total_seats: 1,
        available_seats: 0,
        unknown_seats: 0,
        congestion_level: 'HIGH',
        edge_online: true,
      }),
    ])
    renderApp('/')
    const row = within(await onlyRow())
    expect(row.getByText('0')).toBeInTheDocument()
    expect(row.getByText('혼잡')).toBeInTheDocument()
    expect(row.queryByText('모름')).not.toBeInTheDocument()
  })

  test('좌석 0: 등록된 좌석이 없어요, 링크 유지', async () => {
    useList([item({ total_seats: 0, available_seats: 0, unknown_seats: 0 })])
    renderApp('/')
    const link = await onlyRow()
    expect(link).toHaveAccessibleName(`${NAME}, 등록된 좌석이 없어요`)
    expect(within(link).getByText('등록된 좌석이 없어요')).toBeInTheDocument()
    expect(link).toHaveAttribute('href', '/rooms/IT4-101')
    expect(link).not.toHaveTextContent('전체')
  })

  test('모르는 혼잡도는 알 수 없음', async () => {
    useList([item({ congestion_level: 'SURPRISE' })])
    renderApp('/')
    expect(within(await onlyRow()).getByText('알 수 없음')).toBeInTheDocument()
  })

  test('known + 장치 끊김: 혼잡도 줄을 두고 끊김 문장을 덧붙인다', async () => {
    useList([item({ edge_online: false })])
    renderApp('/')
    const link = await onlyRow()
    const row = within(link)
    expect(row.getByText('보통')).toBeInTheDocument()
    expect(row.getByText('장치 연결이 끊겼어요')).toBeInTheDocument()
    expect(link).toHaveAccessibleName(
      `${NAME}, 빈자리 1석, 확인 불가 1석, 전체 4석, 보통, 장치 연결이 끊겼어요`,
    )
  })

  test('rooms-many: 행 순서가 응답 순서와 같다', async () => {
    renderApp('/', { scenario: 'rooms-many' })
    const list = await screen.findByRole('list')
    const hrefs = within(list)
      .getAllByRole('link')
      .map((a) => a.getAttribute('href'))
    expect(hrefs).toEqual(manyRooms.map((r) => `/rooms/${encodeURIComponent(r.room_id)}`))
  })

  test('방이 하나여도 리다이렉트하지 않고 목록을 보인다', async () => {
    renderApp('/', { scenario: 'mixed' })
    expect(await screen.findByRole('heading', { level: 1, name: TITLE })).toBeInTheDocument()
    expect(screen.queryByRole('heading', { level: 1, name: NAME })).not.toBeInTheDocument()
  })

  test('특수문자 room_id 는 인코딩된 링크가 된다', async () => {
    useList([item({ room_id: 'A/B 101 과방' })])
    renderApp('/')
    expect(await onlyRow()).toHaveAttribute('href', '/rooms/A%2FB%20101%20%EA%B3%BC%EB%B0%A9')
  })

  test('live 색을 쓰지 않는다', async () => {
    const { container } = renderApp('/', { scenario: 'rooms-many' })
    await screen.findByRole('list')
    expect(container.querySelector('.text-live, .bg-live, .border-live')).toBeNull()
  })

  test('행 누르기 → 방 화면, 방 목록 링크 → 다시 목록', async () => {
    // 두 번째 목록 요청은 끝나지 않게 해서, 돌아왔을 때 보이는 목록이 캐시에서 온 것임을 확인한다
    let calls = 0
    server.use(
      http.get(ROOM_LIST_URL, async () => {
        calls += 1
        if (calls > 1) await delay('infinite')
        return HttpResponse.json([item()])
      }),
    )
    const { user } = renderApp('/')
    await user.click(await onlyRow())
    expect(await screen.findByRole('heading', { level: 1, name: NAME })).toBeInTheDocument()
    await user.click(screen.getByRole('link', { name: '방 목록' }))
    expect(await screen.findByRole('heading', { level: 1, name: TITLE })).toBeInTheDocument()
    // 캐시가 있어야 기다림 없이 바로 목록이 보인다
    expect(within(screen.getByRole('list')).getAllByRole('link')).toHaveLength(1)
    expect(document.querySelector('[aria-busy="true"]')).toBeNull()
  })
})

describe('방 목록 행 구성', () => {
  const OFFLINE = '장치 연결이 끊겼어요'
  const NO_READING = '아직 자리를 확인하지 못했어요'

  function sentenceOutsideTable(link: HTMLElement, text: string) {
    const sentence = within(link).getByText(text)
    expect(sentence.closest('dl')).toBeNull()
    expect(sentence).toHaveClass('font-bold')
    const dl = link.querySelector('dl')!
    // 표 칸 안이 아니라 숫자와 표 묶음 아래, 행 전체 폭
    expect(dl.parentElement).not.toContainElement(sentence)
    expect(dl.compareDocumentPosition(sentence) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    return dl
  }

  test('확인된 방: 큰 숫자 위에 빈자리 라벨이 글자로 보인다', async () => {
    useList([item()])
    renderApp('/')
    const label = within(await onlyRow()).getByText('빈자리')
    expect(label).toHaveClass('text-label')
    expect(label.parentElement).toContainElement(within(label.parentElement!).getByText('1'))
  })

  test('전부 확인 불가: 모름 위에도 빈자리 라벨이 보인다', async () => {
    useList([item({ total_seats: 4, available_seats: 0, unknown_seats: 4 })])
    renderApp('/')
    const row = within(await onlyRow())
    const label = row.getByText('빈자리')
    expect(label.parentElement).toContainElement(row.getByText('모름'))
    expect(row.getByText('모름')).toHaveClass('text-title', 'font-black')
  })

  test('좌석 0인 방에는 빈자리 라벨이 없다', async () => {
    useList([item({ total_seats: 0, available_seats: 0, unknown_seats: 0 })])
    renderApp('/')
    expect(within(await onlyRow()).queryByText('빈자리')).not.toBeInTheDocument()
  })

  test('전부 확인 불가: 표에는 확인 불가와 전체만, 상태 문장은 표 아래 굵은 줄', async () => {
    useList([item({ total_seats: 4, available_seats: 0, unknown_seats: 4, edge_online: false })])
    renderApp('/')
    const link = await onlyRow()
    const dl = sentenceOutsideTable(link, OFFLINE)
    expect(within(dl).getAllByText(/석$/)).toHaveLength(2)
    expect(within(dl).queryByText(OFFLINE)).not.toBeInTheDocument()
  })

  test('연결됨 + 전부 확인 불가도 같은 자리에 문장', async () => {
    useList([item({ total_seats: 4, available_seats: 0, unknown_seats: 4 })])
    renderApp('/')
    sentenceOutsideTable(await onlyRow(), NO_READING)
  })

  test('확인된 방 + 장치 끊김: 혼잡도는 표에 두고 문장은 표 아래', async () => {
    useList([item({ edge_online: false })])
    renderApp('/')
    const link = await onlyRow()
    const dl = sentenceOutsideTable(link, OFFLINE)
    expect(within(dl).getByText('보통')).toBeInTheDocument()
  })

  test('방 이름은 링크처럼 밑줄이 있다', async () => {
    useList([item()])
    renderApp('/')
    expect(within(await onlyRow()).getByText(NAME)).toHaveClass('underline', 'underline-offset-4')
  })
})

describe('방 목록 상태', () => {
  test('빈 목록', async () => {
    renderApp('/', { scenario: 'rooms-empty' })
    expect(await screen.findByText('아직 등록된 방이 없어요.')).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 1, name: TITLE })).toBeInTheDocument()
  })

  test('오류 뒤 다시 시도하면 다시 요청해 목록이 보인다', async () => {
    let fail = true
    server.use(
      http.get(ROOM_LIST_URL, () =>
        fail ? HttpResponse.json({ detail: 'x' }, { status: 500 }) : HttpResponse.json([item()]),
      ),
    )
    const { user } = renderApp('/')
    expect(
      await screen.findByRole('heading', { name: '방 목록을 불러오지 못했어요.' }),
    ).toBeInTheDocument()
    expect(screen.getByText('잠시 뒤 다시 시도해 주세요.')).toBeInTheDocument()
    fail = false
    await user.click(screen.getByRole('button', { name: '다시 시도' }))
    expect(await onlyRow()).toHaveAttribute('href', '/rooms/IT4-101')
  })

  test('network 오류는 연결 확인 안내를 더한다', async () => {
    server.use(http.get(ROOM_LIST_URL, () => HttpResponse.error()))
    renderApp('/')
    expect(
      await screen.findByRole('heading', { name: '방 목록을 불러오지 못했어요.' }),
    ).toBeInTheDocument()
    expect(screen.getByText('인터넷 연결을 확인해 주세요.')).toBeInTheDocument()
  })

  test('404 도 오류로 보인다', async () => {
    server.use(http.get(ROOM_LIST_URL, () => HttpResponse.json({ detail: 'x' }, { status: 404 })))
    renderApp('/')
    expect(
      await screen.findByRole('heading', { name: '방 목록을 불러오지 못했어요.' }),
    ).toBeInTheDocument()
  })
})

describe('방 목록 로딩과 재조회', () => {
  beforeEach(() => vi.useFakeTimers({ shouldAdvanceTime: true }))
  afterEach(() => vi.useRealTimers())

  const advance = (ms: number) => act(() => vi.advanceTimersByTimeAsync(ms))

  test('스켈레톤은 200ms 뒤, 안내는 5초와 60초, 90초에 오류', async () => {
    renderApp('/', { scenario: 'loading' })
    expect(document.querySelector('[aria-busy="true"]')).toBeNull()
    await advance(250)
    const busy = document.querySelector('[aria-busy="true"]')
    expect(busy).not.toBeNull()
    // 실제 행 모양: 행마다 아래 2px 선, 상자 테두리는 없다
    expect(busy!.children).toHaveLength(3)
    for (const row of Array.from(busy!.children)) expect(row).toHaveClass('border-b-2')
    expect(busy!.querySelector('.border-2')).toBeNull()
    await advance(5000)
    expect(screen.getByRole('status')).toHaveTextContent('서버를 깨우는 중이에요')
    await advance(55_000)
    expect(screen.getByRole('status')).toHaveTextContent('생각보다 오래 걸려요')
    await advance(30_000)
    expect(
      screen.getByRole('heading', { name: '방 목록을 불러오지 못했어요.' }),
    ).toBeInTheDocument()
  })

  test('30초마다 다시 조회해 새 값을 보인다', async () => {
    let current = [item()]
    useList(() => current)
    renderApp('/')
    expect((await onlyRow()).getAttribute('aria-label')).toContain('빈자리 1석')
    current = [item({ available_seats: 2 })]
    await advance(30_000)
    await waitFor(() =>
      expect(screen.getByRole('link').getAttribute('aria-label')).toContain('빈자리 2석'),
    )
  })

  test('재조회 실패 뒤 회복: 경고가 사라지고 새 값이 보인다', async () => {
    let mode: 'ok' | 'fail' = 'ok'
    let current = [item()]
    server.use(
      http.get(ROOM_LIST_URL, () =>
        mode === 'fail'
          ? HttpResponse.json({ detail: 'x' }, { status: 500 })
          : HttpResponse.json(current),
      ),
    )
    renderApp('/')
    await onlyRow()
    mode = 'fail'
    await advance(30_000)
    expect(await screen.findByText('갱신하지 못했어요')).toBeInTheDocument()
    expect(screen.getByRole('link')).toBeInTheDocument()
    mode = 'ok'
    current = [item({ available_seats: 3 })]
    await advance(30_000)
    await waitFor(() => expect(screen.queryByText('갱신하지 못했어요')).not.toBeInTheDocument())
    expect(screen.getByRole('link').getAttribute('aria-label')).toContain('빈자리 3석')
  })
})
