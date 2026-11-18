import type { RequestHandler } from 'msw'

export const scenarios: Record<string, RequestHandler[]> = {
  default: [],
}

export function resolveScenario(name: string): RequestHandler[] {
  const found = Object.hasOwn(scenarios, name) ? scenarios[name] : undefined
  if (!found) {
    const known = Object.keys(scenarios).join(', ')
    throw new Error(`알 수 없는 시나리오: ${name} (알려진 이름: ${known})`)
  }
  return found
}
