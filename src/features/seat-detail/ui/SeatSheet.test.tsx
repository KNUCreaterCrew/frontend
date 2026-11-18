import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { toRoom } from '@/entities/room'
import type { Seat } from '@/entities/room'
import { mixedRoom } from '@mocks/fixtures/rooms'
import { SeatSheet } from './SeatSheet'

const seats = toRoom(mixedRoom).seats
const a1 = seats.find((s) => s.label === 'A1') as Seat
const b2 = seats.find((s) => s.label === 'B2') as Seat

function renderSheet(props: Partial<Parameters<typeof SeatSheet>[0]> = {}) {
  const onClose = vi.fn()
  const view = render(
    <SeatSheet
      seat={a1}
      staleNotice={null}
      edgeNotice={null}
      onClose={onClose}
      onCloseAutoFocus={() => {}}
      {...props}
    />,
  )
  return { onClose, ...view }
}

test('좌석을 넘기면 이름이 번호와 상태인 dialog 와 네 행, 닫기 버튼이 보인다', () => {
  renderSheet()
  const dialog = screen.getByRole('dialog', { name: 'A1 빈자리' })
  const rows = within(dialog)
  expect(rows.getByText('자리')).toBeInTheDocument()
  expect(rows.getByText('창가')).toBeInTheDocument()
  expect(rows.getByText('콘센트')).toBeInTheDocument()
  expect(rows.getByText('있음')).toBeInTheDocument()
  expect(rows.getByText('마지막 확인')).toBeInTheDocument()
  expect(rows.getByText('상태가 바뀐 때')).toBeInTheDocument()
  expect(rows.getByRole('button', { name: '닫기' })).toBeInTheDocument()
})

test('닫기 버튼을 누르면 onClose 가 한 번 불린다', async () => {
  const { onClose } = renderSheet()
  await userEvent.click(screen.getByRole('button', { name: '닫기' }))
  expect(onClose).toHaveBeenCalledTimes(1)
})

test('Escape 를 누르면 onClose 가 한 번 불린다', async () => {
  const { onClose } = renderSheet()
  await userEvent.keyboard('{Escape}')
  expect(onClose).toHaveBeenCalledTimes(1)
})

test('seat 가 null 이면 dialog 가 없다', () => {
  renderSheet({ seat: null })
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
})

test('확인 불가 좌석은 이유 문장이 보이고 빈자리에는 없다', () => {
  const { unmount } = renderSheet({ seat: b2 })
  expect(screen.getByText('무언가에 가려 자리가 보이지 않아요')).toBeInTheDocument()
  unmount()
  renderSheet()
  expect(screen.queryByText('무언가에 가려 자리가 보이지 않아요')).not.toBeInTheDocument()
})

test('staleNotice 가 있으면 시트 안에 그 글자가 보인다', () => {
  renderSheet({ staleNotice: '1분 넘게 갱신되지 않았어요' })
  const dialog = screen.getByRole('dialog')
  expect(within(dialog).getByText('1분 넘게 갱신되지 않았어요')).toBeInTheDocument()
})

test('열린 동안 같은 좌석의 상태가 바뀌면 시트 안 알림 영역에 읽힌다', () => {
  const { rerender } = renderSheet()
  const dialog = screen.getByRole('dialog')
  const live = dialog.querySelector('[aria-live="polite"]')
  expect(live).toHaveAttribute('aria-atomic', 'true')
  expect(live).toBeEmptyDOMElement()
  rerender(
    <SeatSheet
      seat={{ ...a1, status: 'OCCUPIED', rawStatus: 'OCCUPIED' }}
      staleNotice={null}
      edgeNotice={null}
      onClose={() => {}}
      onCloseAutoFocus={() => {}}
    />,
  )
  expect(live).toHaveTextContent(/^A1 지금 사용 중$/)
})

test('edgeNotice 가 새 값이 되면 알림 영역에 읽힌다', () => {
  const { rerender } = renderSheet()
  const live = screen.getByRole('dialog').querySelector('[aria-live="polite"]')
  rerender(
    <SeatSheet
      seat={a1}
      staleNotice={null}
      edgeNotice="장치 연결이 끊겼어요"
      onClose={() => {}}
      onCloseAutoFocus={() => {}}
    />,
  )
  expect(live).toHaveTextContent('장치 연결이 끊겼어요')
})

test('손잡이는 화면 읽기 도구에 숨고 막은 z-30, 시트는 z-40 이다', () => {
  renderSheet()
  const dialog = screen.getByRole('dialog')
  expect(dialog).toHaveClass('z-40')
  expect(dialog.querySelector('[aria-hidden="true"].w-8.h-1')).not.toBeNull()
  expect(document.querySelector('.z-30')).not.toBeNull()
})

test('콘솔 error 가 없다', () => {
  const error = vi.spyOn(console, 'error').mockImplementation(() => {})
  renderSheet()
  expect(error).not.toHaveBeenCalled()
  error.mockRestore()
})
