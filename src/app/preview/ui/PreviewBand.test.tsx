import { render, screen, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { PreviewBand } from './PreviewBand'

function renderBand(props: { showSwitch: boolean }, path = '/rooms/IT4-101?seat=B-03') {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <PreviewBand scenario="offline" {...props} />
    </MemoryRouter>,
  )
}

test('안내 랜드마크에 모의 데이터와 시나리오 이름을 보인다', () => {
  renderBand({ showSwitch: true })
  const band = screen.getByRole('complementary', { name: '미리보기 안내' })
  expect(within(band).getByText('모의 데이터')).toBeInTheDocument()
  expect(within(band).getByText('offline')).toBeInTheDocument()
})

test('띠는 좌석 포커스 z-20 위, 시트 막 z-30 아래인 z-25 다', () => {
  renderBand({ showSwitch: true })
  expect(screen.getByRole('complementary', { name: '미리보기 안내' })).toHaveClass('z-25')
})

test('바꾸기 링크는 시나리오 목록으로 간다', () => {
  renderBand({ showSwitch: true })
  expect(screen.getByRole('link', { name: '시나리오 바꾸기' })).toHaveAttribute(
    'href',
    '/__preview',
  )
})

test('의견 링크는 새 탭으로 열리고 지금 경로를 담는다', () => {
  renderBand({ showSwitch: true })
  const link = screen.getByRole('link', { name: /의견 남기기/ })
  expect(link).toHaveAttribute('target', '_blank')
  expect(link).toHaveAttribute('rel', 'noopener noreferrer')
  const url = new URL(link.getAttribute('href') ?? '')
  expect(url.searchParams.get('page')).toBe('/rooms/IT4-101?seat=B-03')
  expect(url.searchParams.get('scenario')).toBe('offline')
})

test('showSwitch 가 false 면 바꾸기 링크가 없다', () => {
  renderBand({ showSwitch: false })
  expect(screen.queryByRole('link', { name: '시나리오 바꾸기' })).toBeNull()
  expect(screen.getByRole('link', { name: /의견 남기기/ })).toBeInTheDocument()
})
