import { act, fireEvent, screen, waitFor, within } from '@testing-library/react'
import { HttpResponse, http } from 'msw'
import type { Location } from 'react-router'
import { renderApp } from '@/shared/test/renderApp'
import { server } from '@mocks/node'
import { liveRoom, roomHandler } from '@mocks/handlers/rooms'
import { mixedRoom } from '@mocks/fixtures/rooms'
import { startupRoomDto, v1RoomDto, v2Events, v3Events } from '@mocks/fixtures/interfacesFlow'
import type { RoomEventDto } from '@/entities/room'

const PATH = '/rooms/IT4-101'

const advance = (ms: number) => act(() => vi.advanceTimersByTimeAsync(ms))

function sendAll(live: ReturnType<typeof liveRoom>, events: RoomEventDto[]) {
  act(() => {
    for (const event of events) live.send(event)
  })
}

function tracker() {
  let current: Location | null = null
  return {
    onLocation: (location: Location) => {
      current = location
    },
    get location(): Location {
      if (!current) throw new Error('location 이 없어요')
      return current
    },
  }
}

const seatButton = (name: RegExp) => screen.findByRole('button', { name })

async function ready() {
  return screen.findByRole('heading', { level: 1 })
}

describe('좌석 상세 바텀시트 연결', () => {
  beforeEach(() => vi.useFakeTimers({ shouldAdvanceTime: true }))
  afterEach(() => {
    vi.useRealTimers()
  })

  test('빈자리 좌석을 누르면 이름이 번호와 상태인 dialog 가 열린다', async () => {
    const { user } = renderApp(PATH)
    const button = await seatButton(/^A1 빈자리/)
    expect(button).toHaveAttribute('aria-haspopup', 'dialog')
    await user.click(button)
    const dialog = await screen.findByRole('dialog', { name: 'A1 빈자리' })
    expect(within(dialog).getByText('창가')).toBeInTheDocument()
    expect(within(dialog).getByText('있음')).toBeInTheDocument()
  })

  test('확인 불가 좌석은 이유가 보인다', async () => {
    const { user } = renderApp(PATH)
    await user.click(await seatButton(/^B2 확인 불가/))
    const dialog = await screen.findByRole('dialog', { name: 'B2 확인 불가' })
    expect(within(dialog).getByText('무언가에 가려 자리가 보이지 않아요')).toBeInTheDocument()
  })

  test('한 번도 확인하지 못한 좌석은 아직 확인하지 못함', async () => {
    const live = liveRoom(startupRoomDto)
    server.use(...live.handlers)
    const { user } = renderApp(PATH)
    await user.click(await seatButton(/^A1 확인 불가/))
    const dialog = await screen.findByRole('dialog', { name: 'A1 확인 불가' })
    expect(within(dialog).getByText('아직 확인하지 못함')).toBeInTheDocument()
  })

  test('주소에 seat 가 생기고 다른 param 은 유지된다', async () => {
    const loc = tracker()
    const { user } = renderApp(`${PATH}?scenario=x`, { onLocation: loc.onLocation })
    await user.click(await seatButton(/^A1 빈자리/))
    await screen.findByRole('dialog')
    expect(loc.location.search).toBe('?scenario=x&seat=A-01')
    expect(loc.location.state).toEqual({ seatSheet: true })
  })

  test('열린 채 v2 v3 이벤트가 오면 제목, 이유, 두 시각, 알림이 바뀐다', async () => {
    const live = liveRoom(v1RoomDto)
    server.use(...live.handlers)
    const { user } = renderApp(PATH)
    await user.click(await seatButton(/^A1 사용 중/))
    const dialog = await screen.findByRole('dialog', { name: 'A1 사용 중' })
    await waitFor(() => expect(live.openClients()).toBe(1))

    sendAll(live, v2Events)
    await screen.findByRole('dialog', { name: 'A1 확인 불가' })
    expect(within(dialog).getByText('장치 연결이 끊겨 지금은 확인할 수 없어요')).toBeVisible()
    expect(within(dialog).getByText(/\(10:15:29\)/)).toBeVisible()
    expect(within(dialog).getByText(/\(10:16:11\)/)).toBeVisible()
    const notice = dialog.querySelector('[aria-live="polite"]')
    expect(notice?.textContent).toBe('A1 지금 확인 불가, 장치 연결이 끊겼어요')

    sendAll(live, v3Events)
    await screen.findByRole('dialog', { name: 'A1 사용 중' })
    expect(within(dialog).getAllByText(/\(10:17:04\)/)).toHaveLength(2)
  })

  test('Escape 로 닫으면 dialog 가 사라지고 그 좌석 버튼에 포커스가 돌아온다', async () => {
    const { user } = renderApp(PATH)
    const button = await seatButton(/^A1 빈자리/)
    await user.click(button)
    await screen.findByRole('dialog')
    await user.keyboard('{Escape}')
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull())
    expect(button).toHaveFocus()
  })

  test('닫기 버튼으로 닫아도 포커스가 돌아온다', async () => {
    const { user } = renderApp(PATH)
    const button = await seatButton(/^A1 빈자리/)
    await user.click(button)
    await user.click(await screen.findByRole('button', { name: '닫기' }))
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull())
    expect(button).toHaveFocus()
  })

  test('열기 전 주소로 돌아가고 다른 param 은 그대로다', async () => {
    const loc = tracker()
    const { user } = renderApp(`${PATH}?scenario=x`, { onLocation: loc.onLocation })
    await user.click(await seatButton(/^A1 빈자리/))
    await user.click(await screen.findByRole('button', { name: '닫기' }))
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull())
    expect(loc.location.search).toBe('?scenario=x')
    expect(loc.location.pathname).toBe(PATH)
  })

  test('주소로 바로 들어온 시트는 seat 만 지우고 닫는다', async () => {
    const loc = tracker()
    const { user } = renderApp(`${PATH}?scenario=x&seat=B-02`, { onLocation: loc.onLocation })
    await screen.findByRole('dialog', { name: 'B2 확인 불가' })
    await user.keyboard('{Escape}')
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull())
    expect(loc.location.search).toBe('?scenario=x')
    expect(await seatButton(/^B2 /)).toHaveFocus()
  })

  test('?seat=B-02 로 들어오면 B2 시트가 열려 있다', async () => {
    renderApp(`${PATH}?seat=B-02`)
    expect(await screen.findByRole('dialog', { name: 'B2 확인 불가' })).toBeInTheDocument()
  })

  test('없는 seat 는 알림 없이 param 만 지운다', async () => {
    const loc = tracker()
    const { container } = renderApp(`${PATH}?seat=NOPE`, { onLocation: loc.onLocation })
    await ready()
    await waitFor(() => expect(loc.location.search).toBe(''))
    expect(screen.queryByRole('dialog')).toBeNull()
    const regions = container.querySelectorAll('[aria-live="polite"]')
    expect(regions).toHaveLength(2)
    for (const region of regions) {
      expect(region.textContent).toBe('')
    }
  })

  test('열린 좌석이 사라진 방을 다시 조회하면 닫히고 제목에 포커스, 알림이 읽힌다', async () => {
    const loc = tracker()
    const { container } = renderApp(`${PATH}?seat=A-01`, { onLocation: loc.onLocation })
    await screen.findByRole('dialog', { name: 'A1 빈자리' })
    server.use(
      roomHandler({
        'IT4-101': { ...mixedRoom, seats: mixedRoom.seats.filter((s) => s.seat_id !== 'A-01') },
      }),
    )
    const regions = container.querySelectorAll('[aria-live="polite"][aria-atomic="true"]')
    // 알림 글자가 생기는 순간 화면 읽기 도구가 가리고 있는 영역 안이면 읽히지 않는다
    const hiddenWhenWritten: boolean[] = []
    const observer = new MutationObserver(() => {
      if (regions[1]?.textContent)
        hiddenWhenWritten.push(regions[1].closest('[aria-hidden="true"]') !== null)
    })
    observer.observe(regions[1]!, { childList: true, characterData: true, subtree: true })
    await advance(30_000)
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull())
    expect(screen.getByRole('heading', { level: 1 })).toHaveFocus()
    await waitFor(() => expect(regions[1]?.textContent).toBe('A1 좌석 정보가 없어져 닫았어요'))
    observer.disconnect()
    expect(hiddenWhenWritten).toEqual([false])
    expect(loc.location.search).toBe('')
  })

  test('재조회가 500 이면 시트 안에 갱신하지 못했어요가 보인다', async () => {
    renderApp(`${PATH}?seat=A-01`)
    const dialog = await screen.findByRole('dialog', { name: 'A1 빈자리' })
    server.use(
      http.get('*/api/v1/rooms/:roomId', () => HttpResponse.json({ detail: 'x' }, { status: 500 })),
    )
    await advance(30_000)
    expect(await within(dialog).findByText(/^갱신하지 못했어요/)).toHaveClass('font-bold')
  })

  test('눌러서 연 시트의 좌석이 사라지면 기록을 하나 되돌려 죽은 항목을 남기지 않는다', async () => {
    const keys: string[] = []
    const loc = tracker()
    const { user } = renderApp(PATH, {
      history: [`${PATH}?x=prev`],
      onLocation: (l) => {
        keys.push(l.key)
        loc.onLocation(l)
      },
    })
    await user.click(await seatButton(/^A1 빈자리/))
    await screen.findByRole('dialog', { name: 'A1 빈자리' })
    const before = keys[keys.length - 2]
    server.use(
      roomHandler({
        'IT4-101': { ...mixedRoom, seats: mixedRoom.seats.filter((s) => s.seat_id !== 'A-01') },
      }),
    )
    await advance(30_000)
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull())
    expect(loc.location.key).toBe(before)
    expect(loc.location.search).toBe('')
  })

  test('연달아 두 번 닫아도 기록은 한 칸만 되돌아간다', async () => {
    const loc = tracker()
    const { user } = renderApp(PATH, { history: [`${PATH}?x=prev`], onLocation: loc.onLocation })
    await user.click(await seatButton(/^A1 빈자리/))
    const close = await screen.findByRole('button', { name: '닫기' })
    act(() => {
      fireEvent.click(close)
      fireEvent.click(close)
    })
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull())
    expect(loc.location.search).toBe('')
  })
})
