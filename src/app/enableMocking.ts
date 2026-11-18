export function shouldEnableMocking(input: {
  dev: boolean
  flag?: string
  search?: string
}): boolean {
  if (!input.dev) return false
  if (input.flag === 'enabled') return true
  return new URLSearchParams(input.search ?? '').has('scenario')
}

export async function enableMocking(): Promise<void> {
  if (!import.meta.env.DEV) return
  const search = location.search
  if (
    !shouldEnableMocking({
      dev: true,
      flag: import.meta.env.VITE_API_MOCKING,
      search,
    })
  ) {
    return
  }
  const [{ worker }, { resolveScenario }] = await Promise.all([
    import('@mocks/browser'),
    import('@mocks/scenarios'),
  ])
  const name = new URLSearchParams(search).get('scenario') ?? 'default'
  worker.use(...resolveScenario(name))
  await worker.start({ onUnhandledFrame: 'bypass', quiet: true })
}
