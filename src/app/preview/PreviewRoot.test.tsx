import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { AppProviders } from '@/app/providers'
import { createQueryClient } from '@/app/queryClient'
import { PreviewRoot } from './PreviewRoot'

afterEach(() => {
  document.documentElement.classList.remove('preview')
  document.title = ''
})

function renderRoot(path: string) {
  const queryClient = createQueryClient()
  queryClient.setDefaultOptions({ queries: { retry: false } })
  return render(
    <AppProviders queryClient={queryClient}>
      <MemoryRouter initialEntries={[path]}>
        <PreviewRoot scenario="mixed" unknownScenario={null} />
      </MemoryRouter>
    </AppProviders>,
  )
}

test('시나리오 목록 경로는 띠와 목록을 보이고 바꾸기 링크가 없다', async () => {
  renderRoot('/__preview')
  expect(await screen.findByRole('heading', { level: 1, name: '어떤 화면을 볼까요' })).toBeVisible()
  expect(screen.getByRole('complementary', { name: '미리보기 안내' })).toBeInTheDocument()
  expect(screen.queryByRole('link', { name: '시나리오 바꾸기' })).toBeNull()
})

test('앱 경로는 띠와 앱 화면이 함께 나온다', async () => {
  renderRoot('/')
  expect(screen.getByRole('complementary', { name: '미리보기 안내' })).toBeInTheDocument()
  expect(screen.getByRole('link', { name: '시나리오 바꾸기' })).toBeInTheDocument()
  expect(await screen.findByRole('heading', { level: 1, name: '어느 방으로 갈까요' })).toBeVisible()
})
