import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router'
import { enableMocking } from '@/app/enableMocking'
import { AppProviders } from '@/app/providers'
import { createQueryClient } from '@/app/queryClient'
import { AppRoutes } from '@/app/routes'
import { StartFailure } from '@/app/StartFailure'
import '@/app/styles/global.css'

const root = document.getElementById('root')
if (!root) throw new Error('#root 요소가 없습니다')

function render(app: React.ReactNode) {
  createRoot(root!).render(
    <StrictMode>
      <AppProviders queryClient={createQueryClient()}>
        <BrowserRouter>{app}</BrowserRouter>
      </AppProviders>
    </StrictMode>,
  )
}

// 미리보기 화면은 mock 빌드에서만 동적으로 불러와 운영 번들에서 빠진다
if (import.meta.env.MODE === 'mock') {
  void (async () => {
    try {
      const mocking = await enableMocking()
      if (!mocking) throw new Error('mock 빌드에서 모의 데이터가 켜지지 않았습니다')
      const { PreviewRoot, markPreviewDocument } = await import('@/app/preview')
      markPreviewDocument()
      render(<PreviewRoot {...mocking} />)
    } catch (error) {
      console.error(error)
      createRoot(root).render(<StartFailure />)
    }
  })()
} else {
  void enableMocking().then(() => render(<AppRoutes />))
}
