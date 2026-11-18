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

void enableMocking().then(() => {
  createRoot(root).render(
    <StrictMode>
      <AppProviders queryClient={createQueryClient()}>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </AppProviders>
    </StrictMode>,
  )
})
