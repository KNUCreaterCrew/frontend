import { StrictMode } from 'react'
import { render, type RenderResult } from '@testing-library/react'
import userEvent, { type UserEvent } from '@testing-library/user-event'
import { MemoryRouter, type Location } from 'react-router'
import { AppProviders } from '@/app/providers'
import { createQueryClient } from '@/app/queryClient'
import { AppRoutes } from '@/app/routes'
import { resolveScenario } from '@mocks/scenarios'
import { server } from '@mocks/node'
import { LocationProbe } from './LocationProbe'

export function renderApp(
  path: string,
  options?: {
    scenario?: string
    keepRetry?: boolean
    strict?: boolean
    onLocation?: (location: Location) => void
    // path 앞에 쌓아 둘 이전 기록. 마지막이 path 이고 거기서 시작한다
    history?: string[]
  },
): RenderResult & { user: UserEvent } {
  if (options?.scenario) server.use(...resolveScenario(options.scenario))
  const queryClient = createQueryClient()
  if (!options?.keepRetry) queryClient.setDefaultOptions({ queries: { retry: false } })
  const tree = (
    <AppProviders queryClient={queryClient}>
      <MemoryRouter initialEntries={[...(options?.history ?? []), path]}>
        {options?.onLocation && <LocationProbe onLocation={options.onLocation} />}
        <AppRoutes />
      </MemoryRouter>
    </AppProviders>
  )
  const result = render(options?.strict ? <StrictMode>{tree}</StrictMode> : tree)
  return { ...result, user: userEvent.setup() }
}
