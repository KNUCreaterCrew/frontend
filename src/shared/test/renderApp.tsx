import { render, type RenderResult } from '@testing-library/react'
import userEvent, { type UserEvent } from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
import { AppProviders } from '@/app/providers'
import { createQueryClient } from '@/app/queryClient'
import { AppRoutes } from '@/app/routes'
import { resolveScenario } from '@mocks/scenarios'
import { server } from '@mocks/node'

export function renderApp(
  path: string,
  options?: { scenario?: string; keepRetry?: boolean },
): RenderResult & { user: UserEvent } {
  if (options?.scenario) server.use(...resolveScenario(options.scenario))
  const queryClient = createQueryClient()
  if (!options?.keepRetry) queryClient.setDefaultOptions({ queries: { retry: false } })
  const result = render(
    <AppProviders queryClient={queryClient}>
      <MemoryRouter initialEntries={[path]}>
        <AppRoutes />
      </MemoryRouter>
    </AppProviders>,
  )
  return { ...result, user: userEvent.setup() }
}
