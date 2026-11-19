export const PREVIEW_SCENARIO_KEY = 'zf-preview-scenario'

export type MockingResult = { scenario: string; unknownScenario: string | null }

export function pickScenario(input: {
  search: string
  stored: string | null
  known: readonly string[]
}): MockingResult {
  const fromUrl = new URLSearchParams(input.search).get('scenario')
  if (fromUrl !== null) {
    return input.known.includes(fromUrl)
      ? { scenario: fromUrl, unknownScenario: null }
      : { scenario: 'default', unknownScenario: fromUrl }
  }
  if (input.stored !== null && input.known.includes(input.stored)) {
    return { scenario: input.stored, unknownScenario: null }
  }
  return { scenario: 'default', unknownScenario: null }
}

export function readStoredScenario(): string | null {
  try {
    return sessionStorage.getItem(PREVIEW_SCENARIO_KEY)
  } catch {
    return null
  }
}

export function storeScenario(name: string): void {
  try {
    sessionStorage.setItem(PREVIEW_SCENARIO_KEY, name)
  } catch {
    // 저장소를 못 써도 미리보기는 계속된다.
  }
}
