import { render, screen } from '@testing-library/react'
import { getRoomSummary, toRoom } from '@/entities/room'
import { mixedRoom } from '@mocks/fixtures/rooms'
import { RoomSummary } from './RoomSummary'

const room = toRoom(mixedRoom)
const withAvailable = (n: number) => {
  const summary = getRoomSummary(room)
  if (summary.kind !== 'known') throw new Error('mixedRoom 은 확인된 방이어야 한다')
  return { ...summary, availableSeats: n }
}
const big = () => screen.getByText(/^\d+$/, { selector: 'p[aria-hidden="true"]' })

describe('빈자리 큰 숫자의 넘어오기', () => {
  it('처음 그린 값은 넘어오지 않는다', () => {
    render(<RoomSummary summary={withAvailable(1)} />)
    expect(big()).not.toHaveClass('motion-safe:animate-flip')
  })

  it('값이 바뀌면 넘어오고, 처음 값으로 돌아와도 넘어온다', () => {
    const { rerender } = render(<RoomSummary summary={withAvailable(1)} />)
    rerender(<RoomSummary summary={withAvailable(2)} />)
    expect(big()).toHaveTextContent('2')
    expect(big()).toHaveClass('motion-safe:animate-flip')
    rerender(<RoomSummary summary={withAvailable(1)} />)
    expect(big()).toHaveTextContent('1')
    expect(big()).toHaveClass('motion-safe:animate-flip')
  })
})
