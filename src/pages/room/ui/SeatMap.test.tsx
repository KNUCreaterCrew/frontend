import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { toRoom } from '@/entities/room'
import { setObservedWidth } from '@/shared/test/resizeObserver'
import { manySeatsRoom, mixedRoom } from '@mocks/fixtures/rooms'
import { SeatMap } from './SeatMap'

const mixed = toRoom(mixedRoom).seats
const many = toRoom(manySeatsRoom).seats

describe('SeatMap', () => {
  it('4석은 읽는 순서대로 이름이 붙고 칸 안에 상태 말이 보인다', () => {
    render(<SeatMap seats={mixed} />)
    const buttons = screen.getAllByRole('button')
    expect(buttons.map((b) => b.getAttribute('aria-label'))).toEqual([
      'A1 빈자리, 콘센트 있음',
      'A2 사용 중',
      'B1 짐 있음, 콘센트 있음',
      'B2 확인 불가',
    ])
    expect(screen.queryByRole('button', { name: '확대' })).not.toBeInTheDocument()
    expect(within(buttons[0]!).getByText('빈자리')).toBeInTheDocument()
  })

  it('40석은 확대 버튼이 있고 칸 안에는 글자가 없다', async () => {
    const user = userEvent.setup()
    render(<SeatMap seats={many} />)
    expect(screen.getAllByRole('button').filter((b) => b.getAttribute('aria-label'))).toHaveLength(
      40,
    )
    const zoomIn = screen.getByRole('button', { name: '확대' })
    const zoomOut = screen.getByRole('button', { name: '축소' })
    expect(zoomIn).toBeEnabled()
    expect(zoomOut).toBeDisabled()
    const first = screen.getByRole('button', { name: /^A1 / })
    expect(first).toHaveTextContent('')

    await user.click(zoomIn)
    expect(screen.getByRole('button', { name: '축소' })).toBeEnabled()
    expect(screen.getByRole('button', { name: '확대' })).toBeDisabled()
    expect(screen.getByRole('button', { name: /^A1 / })).toHaveTextContent('A1')
  })

  it('너비를 모르면 compact: 상태 말이 없고 확대 버튼도 없다', () => {
    setObservedWidth(null)
    render(<SeatMap seats={mixed} />)
    expect(screen.getAllByRole('button')).toHaveLength(4)
    expect(screen.queryByText('빈자리')).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: /^A1 / })).toHaveTextContent('A1')
  })
})
