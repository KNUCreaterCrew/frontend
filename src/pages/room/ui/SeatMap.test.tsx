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
    const toggle = screen.getByRole('button', { name: '확대' })
    expect(toggle).toBeEnabled()
    expect(screen.queryByRole('button', { name: '축소' })).not.toBeInTheDocument()
    expect(screen.queryByText('옆으로 밀면 나머지 좌석이 보여요')).not.toBeInTheDocument()
    const first = screen.getByRole('button', { name: /^A1 / })
    expect(first).toHaveTextContent('')

    await user.click(toggle)
    const back = screen.getByRole('button', { name: '전체 보기' })
    expect(back).toHaveFocus()
    expect(screen.queryByRole('button', { name: '확대' })).not.toBeInTheDocument()
    expect(screen.getByText('옆으로 밀면 나머지 좌석이 보여요')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /^A1 / })).toHaveTextContent('A1')

    await user.click(back)
    expect(screen.getByRole('button', { name: '확대' })).toHaveFocus()
    expect(screen.queryByText('옆으로 밀면 나머지 좌석이 보여요')).not.toBeInTheDocument()
  })

  it('확대하면 가장 짧은 변이 44px 가 되도록 폭을 키운다', async () => {
    const user = userEvent.setup()
    const { container } = render(<SeatMap seats={many} />)
    await user.click(screen.getByRole('button', { name: '확대' }))
    const stage = container.querySelector<HTMLElement>('.relative')!
    expect(parseFloat(stage.style.width)).toBeCloseTo(174.4, 0)
  })

  it('너비를 모르면 compact: 상태 말이 없고 확대 버튼도 없다', () => {
    setObservedWidth(null)
    render(<SeatMap seats={mixed} />)
    expect(screen.getAllByRole('button')).toHaveLength(4)
    expect(screen.queryByText('빈자리')).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: /^A1 / })).toHaveTextContent('A1')
  })
})

describe('SeatMap 좌석 모양', () => {
  const base = mixed[0]!

  it('짐 있음 좌석은 full 단계에서 상태 말이 보이고 띠 위에 놓인다', () => {
    render(<SeatMap seats={[{ ...base, status: 'AWAY', hasOutlet: false }]} />)
    const button = screen.getByRole('button', { name: 'A1 짐 있음' })
    expect(within(button).getByText('짐 있음')).toBeInTheDocument()
    const band = button.querySelector<HTMLElement>('span[aria-hidden="true"].bg-ink')
    expect(band).not.toBeNull()
    expect(band!.style.height).toBe('25%')
    const content = within(button).getByText('짐 있음').parentElement as HTMLElement
    expect(content.style.bottom).toBe('25%')
  })

  it('빗금 칸의 콘센트 아이콘은 종이색 칩 위에 놓인다', () => {
    render(<SeatMap seats={[{ ...base, status: 'UNKNOWN', hasOutlet: true }]} />)
    const button = screen.getByRole('button', { name: /^A1 / })
    const icon = button.querySelector('svg')!
    expect(icon.parentElement).not.toBe(button)
    expect(icon.parentElement).toHaveClass('bg-paper')
  })

  it('알 수 없는 상태는 확인 불가와 같은 빗금이다', () => {
    render(
      <SeatMap
        seats={[
          { ...base, seatId: 'u', label: 'U1', status: 'UNKNOWN' },
          {
            ...base,
            seatId: 'r',
            label: 'R1',
            status: 'UNRECOGNIZED',
            layout: { x: 80, y: 0, width: 64, height: 48 },
          },
        ]}
      />,
    )
    expect(screen.getByRole('button', { name: /^U1 / })).toHaveClass('pattern-unknown')
    expect(screen.getByRole('button', { name: /^R1 / })).toHaveClass('pattern-unknown')
  })
})
