import { act, screen, waitFor, within } from '@testing-library/react'
import { HttpResponse, delay, http } from 'msw'
import type { RoomSummaryDto } from '@/entities/room'
import { renderApp } from '@/shared/test/renderApp'
import { server } from '@mocks/node'
import { ROOM_LIST_URL, roomListHandler } from '@mocks/handlers/rooms'
import { manyRooms, mixedRoom, toListItemDto } from '@mocks/fixtures/rooms'

const TITLE = '방을 골라 주세요'
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

// 목록 안의 링크 하나(좌석 무대 캡슐도 링크라 화면 전체에서 찾지 않는다)
const rowNow = () => within(screen.getByRole('list')).getByRole('link')

describe('방 목록 화면 행', () => {
  test('mixed: 제목, 상단 줄, 링크 이름과 행 안의 값', async () => {
    renderApp('/', { scenario: 'mixed' })
    expect(await screen.findByRole('heading', { level: 1, name: TITLE })).toBeInTheDocument()
    expect(screen.getByText('ZeroFrame')).toBeInTheDocument()
    const link = await onlyRow()
    expect(within(screen.getByRole('list')).getAllByRole('link')).toHaveLength(1)
    expect(link).toHaveAccessibleName(`${NAME}, 빈자리 2석, 확인 불가 0석, 전체 4석`)
    expect(link).toHaveAttribute('href', '/rooms/IT4-101')
    const row = within(link)
    expect(row.getByText(NAME)).toBeInTheDocument()
    expect(row.getByText('2')).toBeInTheDocument()
    expect(row.getByText('확인 불가')).toBeInTheDocument()
    expect(row.getByText('0석')).toBeInTheDocument()
    expect(row.getByText('전체')).toBeInTheDocument()
    expect(row.getByText('4석')).toBeInTheDocument()
  })

  test('서버 시작 직후(전부 확인 불가, 장치 끊김): 확인 불가, 끊김 문장, 혼잡 없음', async () => {
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
      `${NAME}, 빈자리 확인 불가, 확인 불가 4석, 전체 4석, 장치 연결이 끊겼어요`,
    )
    const row = within(link)
    expect(row.getByText('확인 불가', { selector: 'span' })).toBeInTheDocument()
    expect(row.getByText('장치 연결이 끊겼어요')).toBeInTheDocument()
    expect(row.getAllByText('4석')).toHaveLength(2)
    expect(link).not.toHaveTextContent('혼잡')
    expect(link).not.toHaveTextContent('0석')
  })

  test('연결됨 + 전부 확인 불가: 확인 불가 좌석을 빈자리로 표시한다', async () => {
    useList([
      item({ total_seats: 4, available_seats: 0, unknown_seats: 4, congestion_level: 'HIGH' }),
    ])
    renderApp('/')
    const link = await onlyRow()
    expect(within(link).getByText('4')).toBeInTheDocument()
    expect(link).not.toHaveTextContent('혼잡')
    expect(link).toHaveAccessibleName(`${NAME}, 빈자리 4석, 확인 불가 0석, 전체 4석`)
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
    // 혼잡도는 타일에 두지 않는다(방 화면 요약에서 본다)
    expect(await onlyRow()).not.toHaveTextContent('혼잡')
    expect(row.queryByText('확인 불가', { selector: 'span' })).not.toBeInTheDocument()
    expect(row.queryByText(/확인하지 못한 자리가/)).not.toBeInTheDocument()
  })

  test('rooms-many 둘째 행(연결됨, 확인 불가 2석): 확인 불가 좌석을 빈자리로 합쳐 보인다', async () => {
    renderApp('/', { scenario: 'rooms-many' })
    const list = await screen.findByRole('list')
    const link = within(list).getByRole('link', { name: /^제2실습실/ })
    expect(link).toHaveAccessibleName('제2실습실, 빈자리 2석, 확인 불가 0석, 전체 6석')
    expect(within(link).queryByText(/확인하지 못한 자리가/)).not.toBeInTheDocument()
  })

  test('빈자리 0석 + 확인 불가 + 장치 끊김: 문장 둘, 확인하지 못한 자리가 먼저', async () => {
    useList([
      item({
        total_seats: 6,
        available_seats: 0,
        unknown_seats: 2,
        congestion_level: 'HIGH',
        edge_online: false,
      }),
    ])
    renderApp('/')
    const link = await onlyRow()
    const first = within(link).getByText('확인하지 못한 자리가 2석 있어요')
    const second = within(link).getByText('장치 연결이 끊겼어요')
    expect(first.compareDocumentPosition(second) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    expect(link).toHaveAccessibleName(
      `${NAME}, 빈자리 0석, 확인 불가 2석, 전체 6석, 확인하지 못한 자리가 2석 있어요, 장치 연결이 끊겼어요`,
    )
  })

  test('빈자리가 1석 이상이면 확인 불가가 있어도 문장이 없다', async () => {
    useList([item()])
    renderApp('/')
    expect(within(await onlyRow()).queryByText(/확인하지 못한 자리가/)).not.toBeInTheDocument()
  })

  test('확인 불가와 전체는 한 줄 표에 같은 크기와 굵기로', async () => {
    useList([item()])
    renderApp('/')
    const row = within(await onlyRow())
    const style = (el: HTMLElement) => el.className
    expect(style(row.getByText('0석'))).toBe(style(row.getByText('4석')))
    expect(row.getByText('0석').closest('dl')).toBe(row.getByText('4석').closest('dl'))
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

  test('혼잡도는 모르는 값이어도 타일에 쓰지 않는다', async () => {
    useList([item({ congestion_level: 'SURPRISE' })])
    renderApp('/')
    const link = await onlyRow()
    expect(link).not.toHaveTextContent('알 수 없음')
    expect(link).toHaveAccessibleName(`${NAME}, 빈자리 2석, 확인 불가 0석, 전체 4석`)
  })

  test('known + 장치 끊김: 숫자를 두고 끊김 문장을 덧붙인다', async () => {
    useList([item({ edge_online: false })])
    renderApp('/')
    const link = await onlyRow()
    const row = within(link)
    expect(row.getByText('1')).toBeInTheDocument()
    expect(row.getByText('장치 연결이 끊겼어요')).toBeInTheDocument()
    expect(link).toHaveAccessibleName(
      `${NAME}, 빈자리 1석, 확인 불가 1석, 전체 4석, 장치 연결이 끊겼어요`,
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
    // 표 칸 안이 아니라 표 아래, 타일 전체 폭
    expect(dl).not.toContainElement(sentence)
    expect(sentence.parentElement).toBe(link)
    expect(dl.compareDocumentPosition(sentence) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    return dl
  }

  test('확인된 방: 큰 숫자 위에 빈자리 라벨이 글자로 보인다', async () => {
    useList([item()])
    renderApp('/')
    const label = within(await onlyRow()).getByText('빈자리')
    expect(label).toHaveClass('text-label')
    expect(label.parentElement).toContainElement(within(label.parentElement!).getByText('2'))
  })

  test('전부 확인 불가: 확인 불가 글자 위에도 빈자리 라벨이 보인다', async () => {
    useList([item({ total_seats: 4, available_seats: 0, unknown_seats: 4, edge_online: false })])
    renderApp('/')
    const row = within(await onlyRow())
    const label = row.getByText('빈자리')
    const word = row.getByText('확인 불가', { selector: 'span' })
    expect(label.parentElement).toContainElement(word)
    expect(word).toHaveClass('text-heading', 'font-bold')
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

  test('연결됨 + 전부 확인 불가이면 상태 문장 없이 빈자리 수로 보인다', async () => {
    useList([item({ total_seats: 4, available_seats: 0, unknown_seats: 4 })])
    renderApp('/')
    const link = await onlyRow()
    expect(within(link).getByText('4')).toBeInTheDocument()
    expect(within(link).queryByText(NO_READING)).not.toBeInTheDocument()
  })

  test('확인된 방 + 장치 끊김: 숫자는 표에 두고 문장은 표 아래', async () => {
    useList([item({ edge_online: false })])
    renderApp('/')
    const link = await onlyRow()
    const dl = sentenceOutsideTable(link, OFFLINE)
    expect(within(dl).getByText('4석')).toBeInTheDocument()
  })

  test('개수 점: 범례 순서대로 빈자리, 쓰는 중, 확인 불가이고 화면 읽기 도구에 숨는다', async () => {
    useList([item({ total_seats: 6, available_seats: 2, unknown_seats: 1, edge_online: false })])
    renderApp('/')
    const link = await onlyRow()
    const pips = Array.from(link.querySelectorAll('[data-pip]'))
    expect(pips.map((p) => p.getAttribute('data-pip'))).toEqual([
      'pip-empty',
      'pip-empty',
      'pip-taken',
      'pip-taken',
      'pip-taken',
      'pip-unknown',
    ])
    expect(pips[0]?.parentElement).toHaveAttribute('aria-hidden', 'true')
  })

  test('전부 확인 불가 카드: 개수 점이 모두 점선이고 카드 옆면에는 띠가 없다', async () => {
    useList([item({ total_seats: 4, available_seats: 0, unknown_seats: 4, edge_online: false })])
    renderApp('/')
    const link = await onlyRow()
    expect(link).toHaveClass('min-h-tap')
    const pips = Array.from(link.querySelectorAll('[data-pip]'))
    expect(pips).toHaveLength(4)
    for (const pip of pips) expect(pip).toHaveClass('pip-unknown')
    expect(link.querySelector('.w-band')).toBeNull()
  })

  test('좌석이 48석을 넘으면 개수 점 대신 같은 순서의 비율 막대', async () => {
    useList([item({ total_seats: 60, available_seats: 15, unknown_seats: 15, edge_online: false })])
    renderApp('/')
    const link = await onlyRow()
    expect(link.querySelector('[data-pip]')).toBeNull()
    const bar = link.querySelector('.pip-empty')
    expect(bar).toHaveStyle({ width: '25%' })
    expect(bar?.parentElement).toHaveAttribute('aria-hidden', 'true')
  })

  test('카드 전체가 링크라 이름에는 밑줄 대신 화면 읽기 도구에 숨은 이동 아이콘이 붙는다', async () => {
    useList([item()])
    renderApp('/')
    const link = await onlyRow()
    expect(within(link).getByText(NAME)).not.toHaveClass('underline')
    expect(link.querySelector('svg[aria-hidden="true"]')).not.toBeNull()
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
    // 실제 타일 모양: 방 타일과 같은 면, 모서리, 그림자의 타일 네 장(휴대폰 2열 두 줄)
    expect(busy!.children).toHaveLength(4)
    for (const row of Array.from(busy!.children)) expect(row).toHaveClass('rounded-glass', 'glass')
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
    let current = [item({ unknown_seats: 0 })]
    useList(() => current)
    renderApp('/')
    expect((await onlyRow()).getAttribute('aria-label')).toContain('빈자리 1석')
    current = [item({ available_seats: 2, unknown_seats: 0 })]
    await advance(30_000)
    await waitFor(() => expect(rowNow().getAttribute('aria-label')).toContain('빈자리 2석'))
  })

  test('재조회 실패 뒤 회복: 경고가 사라지고 새 값이 보인다', async () => {
    let mode: 'ok' | 'fail' = 'ok'
    let current = [item({ unknown_seats: 0 })]
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
    expect(await screen.findByText(/^갱신하지 못했어요/)).toHaveClass('font-bold')
    expect(rowNow()).toBeInTheDocument()
    mode = 'ok'
    current = [item({ available_seats: 3, unknown_seats: 0 })]
    await advance(30_000)
    await waitFor(() => expect(screen.queryByText(/^갱신하지 못했어요/)).not.toBeInTheDocument())
    expect(rowNow().getAttribute('aria-label')).toContain('빈자리 3석')
  })
})

describe('좌석 무대(머리 영역)', () => {
  const stage = () => screen.findByRole('region', { name: '좌석 무대' })

  test('mixed: 빈자리가 가장 많은 방으로 가는 캡슐과 그 방의 실제 좌석 배치', async () => {
    renderApp('/', { scenario: 'mixed' })
    const region = await stage()
    const link = within(region).getByRole('link', {
      name: `지금 빈자리가 가장 많은 방, ${NAME}, 빈자리 2석`,
    })
    expect(link).toHaveAttribute('href', '/rooms/IT4-101')
    // 테스트 환경에는 WebGL 이 없어 정지 그림으로 그린다. 연결된 방의 확인 불가 좌석은 빈자리로 그린다
    await waitFor(() => expect(region.querySelectorAll('rect[data-tone]')).toHaveLength(4))
    const tones = Array.from(region.querySelectorAll('rect[data-tone]')).map((r) =>
      r.getAttribute('data-tone'),
    )
    expect(tones).toEqual(['empty', 'occupied', 'away', 'empty'])
    expect(region.querySelector('svg')).toHaveAttribute('aria-hidden', 'true')
  })

  test('rooms-many: 빈자리 4석(확인 불가 변환 포함)인 방을 고른다', async () => {
    renderApp('/', { scenario: 'rooms-many' })
    const region = await stage()
    expect(
      within(region).getByRole('link', {
        name: '지금 빈자리가 가장 많은 방, 제3실습실, 빈자리 4석',
      }),
    ).toBeInTheDocument()
    await waitFor(() => expect(region.querySelectorAll('rect[data-tone]')).toHaveLength(4))
  })

  test('빈자리 있는 방이 없으면 좌석 있는 첫 방을 그리고 그렇다고 말한다', async () => {
    useList([
      item({ total_seats: 0, available_seats: 0, unknown_seats: 0, room_id: 'IT4-105' }),
      item({ available_seats: 0, unknown_seats: 0, congestion_level: 'HIGH' }),
    ])
    renderApp('/')
    const region = await stage()
    expect(
      within(region).getByRole('link', {
        name: `확인된 빈자리가 있는 방이 없어요, ${NAME} 좌석 보기`,
      }),
    ).toHaveAttribute('href', '/rooms/IT4-101')
  })

  test('좌석 있는 방이 없으면 무대가 없다', async () => {
    useList([item({ total_seats: 0, available_seats: 0, unknown_seats: 0 })])
    renderApp('/')
    await onlyRow()
    expect(screen.queryByRole('region', { name: '좌석 무대' })).not.toBeInTheDocument()
  })

  test('빈 목록에도 무대가 없다', async () => {
    renderApp('/', { scenario: 'rooms-empty' })
    await screen.findByText('아직 등록된 방이 없어요.')
    expect(screen.queryByRole('region', { name: '좌석 무대' })).not.toBeInTheDocument()
  })

  test('방 조회가 404 면 무대를 치우고 목록은 그대로', async () => {
    useList([item({ room_id: 'IT4-999' })])
    renderApp('/')
    await onlyRow()
    await waitFor(() =>
      expect(screen.queryByRole('region', { name: '좌석 무대' })).not.toBeInTheDocument(),
    )
    expect(await onlyRow()).toHaveAttribute('href', '/rooms/IT4-999')
  })

  test('방 조회가 끝나기 전에도 캡슐과 목록이 먼저 보인다', async () => {
    server.use(
      http.get('*/api/v1/rooms/:roomId', async () => {
        await delay('infinite')
        return HttpResponse.json(mixedRoom)
      }),
    )
    renderApp('/')
    const region = await stage()
    expect(within(region).getByRole('link')).toHaveAccessibleName(
      `지금 빈자리가 가장 많은 방, ${NAME}, 빈자리 2석`,
    )
    expect(region.querySelector('rect')).toBeNull()
    expect(await onlyRow()).toBeInTheDocument()
  })
})
