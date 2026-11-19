import { shouldEnableMocking } from './enableMocking'

test.each([
  [{ dev: true, flag: 'enabled' }, true],
  [{ dev: true, search: '?scenario=mixed' }, true],
  [{ dev: true }, false],
  [{ dev: true, search: '?foo=1' }, false],
  [{ dev: false, flag: 'enabled', search: '?scenario=x' }, false],
])('shouldEnableMocking(%o) 는 %s', (input, expected) => {
  expect(shouldEnableMocking(input)).toBe(expected)
})

describe('미리보기 빌드(MODE mock)', () => {
  const start = vi.fn().mockResolvedValue(undefined)

  beforeEach(() => {
    vi.resetModules()
    start.mockClear()
    vi.doMock('@mocks/browser', () => ({ worker: { use: vi.fn(), start } }))
  })

  afterEach(() => {
    vi.doUnmock('@mocks/browser')
    vi.unstubAllEnvs()
    sessionStorage.clear()
    window.history.replaceState(null, '', '/')
  })

  test('?scenario=offline 이면 고르고 기억하고 시작한다', async () => {
    vi.stubEnv('MODE', 'mock')
    vi.stubEnv('DEV', false)
    window.history.replaceState(null, '', '/?scenario=offline')
    const { enableMocking } = await import('./enableMocking')
    await expect(enableMocking()).resolves.toEqual({ scenario: 'offline', unknownScenario: null })
    expect(sessionStorage.getItem('zf-preview-scenario')).toBe('offline')
    expect(start).toHaveBeenCalledTimes(1)
  })

  test('모르는 이름이면 default 와 이름을 돌려주고 throw 하지 않는다', async () => {
    vi.stubEnv('MODE', 'mock')
    vi.stubEnv('DEV', false)
    window.history.replaceState(null, '', '/?scenario=nope')
    const { enableMocking } = await import('./enableMocking')
    await expect(enableMocking()).resolves.toEqual({
      scenario: 'default',
      unknownScenario: 'nope',
    })
  })

  test('운영 빌드(MODE production)는 null 이고 시작하지 않는다', async () => {
    vi.stubEnv('MODE', 'production')
    vi.stubEnv('DEV', false)
    const { enableMocking, isPreviewBuild } = await import('./enableMocking')
    await expect(enableMocking()).resolves.toBeNull()
    expect(start).not.toHaveBeenCalled()
    expect(isPreviewBuild()).toBe(false)
  })
})

describe('개발 서버(MODE development)', () => {
  const start = vi.fn().mockResolvedValue(undefined)

  beforeEach(() => {
    vi.resetModules()
    start.mockClear()
    vi.doMock('@mocks/browser', () => ({ worker: { use: vi.fn(), start } }))
    vi.stubEnv('MODE', 'development')
    vi.stubEnv('DEV', true)
    vi.stubEnv('VITE_API_MOCKING', '')
  })

  afterEach(() => {
    vi.doUnmock('@mocks/browser')
    vi.unstubAllEnvs()
    sessionStorage.clear()
    window.history.replaceState(null, '', '/')
  })

  test('모르는 시나리오 이름이면 알려진 이름을 담아 throw 한다', async () => {
    window.history.replaceState(null, '', '/?scenario=nope')
    const { enableMocking } = await import('./enableMocking')
    await expect(enableMocking()).rejects.toThrow(/nope/)
  })

  test('알려진 시나리오여도 sessionStorage 에 쓰지 않는다', async () => {
    window.history.replaceState(null, '', '/?scenario=offline')
    const { enableMocking } = await import('./enableMocking')
    await expect(enableMocking()).resolves.toEqual({ scenario: 'offline', unknownScenario: null })
    expect(sessionStorage.getItem('zf-preview-scenario')).toBeNull()
    expect(start).toHaveBeenCalledTimes(1)
  })
})
