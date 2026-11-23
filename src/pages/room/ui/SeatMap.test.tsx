import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { toRoom } from '@/entities/room'
import { setObservedWidth } from '@/shared/test/resizeObserver'
import { manySeatsRoom, mixedRoom } from '@mocks/fixtures/rooms'
import { SeatMap } from './SeatMap'

const nameCalls = vi.hoisted(() => ({ count: 0 }))
vi.mock('@/entities/room', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/entities/room')>()
  return {
    ...actual,
    seatAccessibleName: (seat: Parameters<typeof actual.seatAccessibleName>[0]) => {
      nameCalls.count += 1
      return actual.seatAccessibleName(seat)
    },
  }
})

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
    // 상자 안쪽 여백(p-3, 12px)까지 보이는 폭으로 끝 칸이 잘리게 배율을 정한다
    expect(parseFloat(stage.style.width)).toBeCloseTo(183.8, 0)
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

  it('짐 있음 좌석은 중간 톤 면에 가방 아이콘, full 단계에서 상태 말이 보인다', () => {
    render(<SeatMap seats={[{ ...base, status: 'AWAY', hasOutlet: false }]} />)
    const button = screen.getByRole('button', { name: 'A1 짐 있음' })
    expect(button).toHaveClass('seat-away')
    expect(within(button).getByText('짐 있음')).toBeInTheDocument()
    expect(button.querySelectorAll('[data-seat-icons] svg')).toHaveLength(1)
  })

  it('짐 있음 좌석에 콘센트가 있으면 가방과 콘센트 아이콘을 나란히 둔다', () => {
    render(<SeatMap seats={[{ ...base, status: 'AWAY', hasOutlet: true }]} />)
    const button = screen.getByRole('button', { name: /^A1 짐 있음/ })
    expect(button.querySelectorAll('[data-seat-icons] svg')).toHaveLength(2)
  })

  it('확인 불가 칸은 면 없이 점선 윤곽에 물음표, 콘센트가 있으면 함께 둔다', () => {
    render(<SeatMap seats={[{ ...base, status: 'UNKNOWN', hasOutlet: true }]} />)
    const button = screen.getByRole('button', { name: /^A1 / })
    expect(button).toHaveClass('seat-unknown')
    const icons = button.querySelector('[data-seat-icons]')!
    expect(icons.querySelectorAll('svg')).toHaveLength(2)
    expect(icons).toHaveClass('text-ink-soft')
  })

  it('빈자리와 사용 중 칸에는 상태 아이콘이 없다', () => {
    render(
      <SeatMap
        seats={[
          { ...base, seatId: 'e', label: 'E1', status: 'EMPTY', hasOutlet: false },
          {
            ...base,
            seatId: 'o',
            label: 'O1',
            status: 'OCCUPIED',
            hasOutlet: false,
            layout: { x: 80, y: 0, width: 64, height: 48 },
          },
        ]}
      />,
    )
    expect(screen.getByRole('button', { name: /^E1 / })).toHaveClass('seat-empty')
    expect(screen.getByRole('button', { name: /^O1 / })).toHaveClass('seat-occupied')
    expect(document.querySelector('[data-seat-icons]')).toBeNull()
  })

  it('알 수 없는 상태는 확인 불가와 같은 점선 윤곽이다', () => {
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
    expect(screen.getByRole('button', { name: /^U1 / })).toHaveClass('seat-unknown')
    expect(screen.getByRole('button', { name: /^R1 / })).toHaveClass('seat-unknown')
  })
})

describe('SeatMap 방금 바뀐 좌석', () => {
  const rings = (container: HTMLElement) =>
    container.querySelectorAll<HTMLElement>('span[aria-hidden="true"].outline-live')

  it('칸이 96px 이상이면 "방금 빈자리" 칩과 테두리가 보이고 접근 이름은 그대로다', () => {
    const highlights = new Map([['A-01', 'EMPTY' as const]])
    const { container } = render(<SeatMap seats={mixed} highlights={highlights} />)
    expect(screen.getByText('방금 빈자리')).toHaveClass('bg-live', 'text-on-live')
    expect(rings(container)).toHaveLength(1)
    expect(screen.getByRole('button', { name: 'A1 빈자리, 콘센트 있음' })).toBeInTheDocument()
    const ring = rings(container)[0]!
    expect(ring.parentElement).toBe(screen.getByRole('button', { name: /^A1 / }).parentElement)
    expect(ring).toHaveClass('pointer-events-none', 'motion-safe:animate-live', 'z-10')
    // 칸 면 위가 아니라 칸 바깥에 틈을 두고 두른다
    expect(ring).toHaveClass('outline-4', 'outline-offset-2', 'outline-live')
    expect(ring.className).not.toMatch(/\bborder/)
    // 같은 위치의 버튼 면에 가려지지 않도록 테두리가 버튼 바로 뒤에 온다
    expect(screen.getByRole('button', { name: /^A1 / }).nextElementSibling).toBe(ring)
  })

  it('강조한 상태가 좌석의 지금 상태와 다르면 칩도 테두리도 없고 상태 말이 보인다', () => {
    const highlights = new Map([['A-01', 'OCCUPIED' as const]])
    const { container } = render(<SeatMap seats={mixed} highlights={highlights} />)
    expect(screen.queryByText(/방금/)).not.toBeInTheDocument()
    expect(rings(container)).toHaveLength(0)
    const seat = screen.getByRole('button', { name: /^A1 / })
    expect(within(seat).getByText('빈자리')).toBeInTheDocument()
  })

  it('키보드 포커스를 받은 좌석은 강조 테두리보다 위에 그려져 포커스 링이 가려지지 않는다', () => {
    const highlights = new Map([['A-01', 'EMPTY' as const]])
    const { container } = render(<SeatMap seats={mixed} highlights={highlights} />)
    expect(rings(container)[0]).toHaveClass('z-10')
    expect(screen.getByRole('button', { name: /^A1 / })).toHaveClass('focus-visible:z-20')
  })

  it('강조가 없으면 칩도 테두리도 없다', () => {
    const { container } = render(<SeatMap seats={mixed} />)
    expect(screen.queryByText(/방금/)).not.toBeInTheDocument()
    expect(rings(container)).toHaveLength(0)
  })

  it('칸이 64px 이상 96px 미만이면 "방금" 만 보인다', () => {
    setObservedWidth(180)
    const highlights = new Map([['A-01', 'EMPTY' as const]])
    const { container } = render(<SeatMap seats={mixed} highlights={highlights} />)
    expect(screen.getByText('방금')).toBeInTheDocument()
    expect(screen.queryByText('방금 빈자리')).not.toBeInTheDocument()
    expect(rings(container)).toHaveLength(1)
  })

  it('칸이 작아 확대 전인 좌석도는 테두리만 보인다', () => {
    const highlights = new Map([[many[0]!.seatId, many[0]!.status]])
    const { container } = render(<SeatMap seats={many} highlights={highlights} />)
    expect(screen.queryByText(/방금/)).not.toBeInTheDocument()
    expect(rings(container)).toHaveLength(1)
  })

  it('다른 좌석 하나만 바뀌면 바뀌지 않은 좌석 버튼은 다시 그려지지 않는다', () => {
    const { rerender } = render(<SeatMap seats={mixed} />)
    nameCalls.count = 0
    const next = mixed.map((s, i) => (i === 1 ? { ...s, status: 'EMPTY' as const } : s))
    rerender(<SeatMap seats={next} />)
    expect(nameCalls.count).toBe(1)
  })
})

describe('SeatMap 선택한 좌석', () => {
  it('선택한 좌석 버튼에 굵은 테두리가 있고 data-seat-id 와 aria-haspopup 이 있다', () => {
    render(<SeatMap seats={mixed} selectedSeatId="A-02" onSelect={() => {}} />)
    const selected = screen.getByRole('button', { name: /^A2 / })
    expect(selected).toHaveClass('outline-4', 'outline-offset-3', 'outline-ink')
    expect(selected).toHaveAttribute('data-seat-id', 'A-02')
    expect(selected).toHaveAttribute('aria-haspopup', 'dialog')
    expect(screen.getByRole('button', { name: /^A1 / })).not.toHaveClass('outline-4')
  })

  it('좌석을 누르면 onSelect 에 seatId 가 넘어간다', async () => {
    const onSelect = vi.fn()
    render(<SeatMap seats={mixed} onSelect={onSelect} />)
    await userEvent.click(screen.getByRole('button', { name: /^B1 / }))
    expect(onSelect).toHaveBeenCalledWith('B-01')
  })

  it('강조와 선택이 같은 좌석이면 강조 테두리가 버튼 바로 뒤에 그대로 있다', () => {
    const highlights = new Map([['A-01', 'EMPTY' as const]])
    const { container } = render(
      <SeatMap seats={mixed} highlights={highlights} selectedSeatId="A-01" onSelect={() => {}} />,
    )
    const button = screen.getByRole('button', { name: /^A1 / })
    const ring = container.querySelector('span[aria-hidden="true"].outline-live')
    expect(button.nextElementSibling).toBe(ring)
    expect(ring).toHaveClass('z-10')
  })

  it('선택이 바뀌어도 해당 두 좌석 외에는 다시 그려지지 않는다', () => {
    const onSelect = vi.fn()
    const { rerender } = render(<SeatMap seats={mixed} selectedSeatId={null} onSelect={onSelect} />)
    nameCalls.count = 0
    rerender(<SeatMap seats={mixed} selectedSeatId="A-01" onSelect={onSelect} />)
    expect(nameCalls.count).toBe(1)
  })

  it('다른 좌석 하나만 바뀌어도 onSelect 가 같으면 버튼 하나만 다시 그려진다', () => {
    const onSelect = vi.fn()
    const { rerender } = render(<SeatMap seats={mixed} selectedSeatId="A-01" onSelect={onSelect} />)
    nameCalls.count = 0
    const next = mixed.map((s, i) => (i === 1 ? { ...s, status: 'EMPTY' as const } : s))
    rerender(<SeatMap seats={next} selectedSeatId="A-01" onSelect={onSelect} />)
    expect(nameCalls.count).toBe(1)
  })
})
