import { scenarios } from '@mocks/scenarios'
import { pickScenario, readStoredScenario, storeScenario } from './pickScenario'

const known = Object.keys(scenarios)

afterEach(() => {
  vi.restoreAllMocks()
})

describe('pickScenario', () => {
  test('URL 이 저장값보다 먼저다', () => {
    expect(pickScenario({ search: '?scenario=offline', stored: 'error', known })).toEqual({
      scenario: 'offline',
      unknownScenario: null,
    })
  })

  test('URL 이 없으면 저장값을 쓴다', () => {
    expect(pickScenario({ search: '', stored: 'error', known })).toEqual({
      scenario: 'error',
      unknownScenario: null,
    })
  })

  test('둘 다 없으면 default', () => {
    expect(pickScenario({ search: '', stored: null, known })).toEqual({
      scenario: 'default',
      unknownScenario: null,
    })
  })

  test('모르는 URL 이름은 default 로 두고 이름을 알린다', () => {
    expect(pickScenario({ search: '?scenario=nope', stored: 'error', known })).toEqual({
      scenario: 'default',
      unknownScenario: 'nope',
    })
  })

  test('상속된 이름도 모르는 이름이다', () => {
    expect(pickScenario({ search: '?scenario=constructor', stored: null, known })).toEqual({
      scenario: 'default',
      unknownScenario: 'constructor',
    })
  })

  test('저장된 이름이 이제 없으면 조용히 버린다', () => {
    expect(pickScenario({ search: '', stored: 'gone', known })).toEqual({
      scenario: 'default',
      unknownScenario: null,
    })
  })
})

describe('sessionStorage 접근', () => {
  test('getItem 이 throw 하면 null', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('blocked')
    })
    expect(readStoredScenario()).toBeNull()
  })

  test('setItem 이 throw 해도 삼킨다', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('blocked')
    })
    expect(() => storeScenario('x')).not.toThrow()
  })
})
