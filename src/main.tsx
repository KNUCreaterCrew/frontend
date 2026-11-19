import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router'
import { enableMocking } from '@/app/enableMocking'
import { AppProviders } from '@/app/providers'
import { createQueryClient } from '@/app/queryClient'
import { AppRoutes } from '@/app/routes'
import '@/app/styles/global.css'

const root = document.getElementById('root')
if (!root) throw new Error('#root 요소가 없습니다')

void enableMocking().then(async (mocking) => {
  // 미리보기 화면은 mock 빌드에서만 동적으로 불러와 운영 번들에서 빠진다
  const app =
    mocking && import.meta.env.MODE === 'mock' ? (
      await import('@/app/preview').then(({ PreviewRoot }) => <PreviewRoot {...mocking} />)
    ) : (
      <AppRoutes />
    )
  createRoot(root).render(
    <StrictMode>
      <AppProviders queryClient={createQueryClient()}>
        <BrowserRouter>{app}</BrowserRouter>
      </AppProviders>
    </StrictMode>,
  )
})
