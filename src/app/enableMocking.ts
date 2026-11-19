import {
  pickScenario,
  readStoredScenario,
  storeScenario,
  type MockingResult,
} from './preview/model/pickScenario'

export function shouldEnableMocking(input: {
  dev: boolean
  flag?: string
  search?: string
}): boolean {
  if (!input.dev) return false
  if (input.flag === 'enabled') return true
  return new URLSearchParams(input.search ?? '').has('scenario')
}

export type { MockingResult } from './preview/model/pickScenario'

export function isPreviewBuild(): boolean {
  return import.meta.env.MODE === 'mock'
}

export async function enableMocking(): Promise<MockingResult | null> {
  if (!import.meta.env.DEV && import.meta.env.MODE !== 'mock') return null
  const search = location.search
  const preview = import.meta.env.MODE === 'mock'
  if (
    !preview &&
    !shouldEnableMocking({
      dev: true,
      flag: import.meta.env.VITE_API_MOCKING,
      search,
    })
  ) {
    return null
  }
  const [{ worker }, { resolveScenario, scenarios }] = await Promise.all([
    import('@mocks/browser'),
    import('@mocks/scenarios'),
  ])
  let result: MockingResult
  if (preview) {
    result = pickScenario({
      search,
      stored: readStoredScenario(),
      known: Object.keys(scenarios),
    })
    storeScenario(result.scenario)
  } else {
    result = {
      scenario: new URLSearchParams(search).get('scenario') ?? 'default',
      unknownScenario: null,
    }
  }
  worker.use(...resolveScenario(result.scenario))
  await worker.start({
    onUnhandledFrame: 'bypass',
    quiet: true,
    serviceWorker: { url: '/mockServiceWorker.js' },
  })
  return result
}
