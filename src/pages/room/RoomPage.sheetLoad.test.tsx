import { screen, waitFor } from '@testing-library/react'
import { renderApp } from '@/shared/test/renderApp'
import type { Location } from 'react-router'

const gate = vi.hoisted(() => ({ fail: true }))

// 시트 코드를 받지 못하는 상황: 모듈은 받아지지만 lazy 가 꺼낼 때 실패한다
vi.mock('@/features/seat-detail', async (importActual) => {
  const actual = await importActual<typeof import('@/features/seat-detail')>()
  return {
    get SeatSheet() {
      if (gate.fail) throw new Error('chunk load failed')
      return actual.SeatSheet
    },
  }
})

const PATH = '/rooms/IT4-101'
const FAILED = '좌석 정보를 불러오지 못했어요. 다시 눌러 주세요.'

describe('시트 코드를 받지 못했을 때', () => {
  beforeEach(() => {
    gate.fail = true
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })
  afterEach(() => vi.restoreAllMocks())

  test('방 화면은 남고 좌석 param 이 지워지며 안내와 포커스가 돌아온다, 다시 누르면 열린다', async () => {
    let location: Location | null = null
    const { user, container } = renderApp(PATH, {
      onLocation: (l) => {
        location = l
      },
    })
    const button = await screen.findByRole('button', { name: /^A1 빈자리/ })
    await user.click(button)
    expect((await screen.findAllByText(FAILED)).length).toBe(2)
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument()
    expect(screen.queryByRole('dialog')).toBeNull()
    await waitFor(() => expect(location!.search).toBe(''))
    expect(button).toHaveFocus()
    const region = container.querySelectorAll('[aria-live="polite"][aria-atomic="true"]')[1]
    expect(region?.textContent).toBe(FAILED)

    gate.fail = false
    await user.click(button)
    expect(await screen.findByRole('dialog', { name: 'A1 빈자리' })).toBeInTheDocument()
    expect(screen.queryByText(FAILED)).toBeNull()
  })
})
