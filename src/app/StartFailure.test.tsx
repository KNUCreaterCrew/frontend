import { render, screen } from '@testing-library/react'
import { StartFailure } from './StartFailure'

test('시작하지 못했다는 제목과 안내 문장을 보인다', () => {
  render(<StartFailure />)
  expect(screen.getByRole('heading', { name: '미리보기를 시작하지 못했어요' })).toBeVisible()
  expect(
    screen.getByText('새로고침해 보고, 계속되면 Safari 나 Chrome 에서 열어 주세요.'),
  ).toBeVisible()
})
