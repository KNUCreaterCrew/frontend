import { screen } from '@testing-library/react'
import { renderApp } from '@/shared/test/renderApp'

test('첫 화면에 서비스 이름 제목이 보인다', () => {
  renderApp('/')
  expect(screen.getByRole('heading', { level: 1, name: /ZeroFrame/ })).toBeInTheDocument()
})

test('없는 주소는 404 화면과 처음으로 가는 링크를 보인다', () => {
  renderApp('/does-not-exist')
  expect(screen.getByRole('heading', { level: 1, name: /페이지를 찾을 수 없/ })).toBeInTheDocument()
  expect(screen.getByRole('link', { name: /처음/ })).toHaveAttribute('href', '/')
})
