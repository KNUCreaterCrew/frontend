import { resolveScenario } from './scenarios'

test('default 시나리오는 핸들러 배열이다', () => {
  expect(Array.isArray(resolveScenario('default'))).toBe(true)
})
test('모르는 시나리오는 알려진 이름을 담아 실패한다', () => {
  expect(() => resolveScenario('nope')).toThrow(/default/)
})
test('상속 속성 이름은 알 수 없는 시나리오로 취급한다', () => {
  expect(() => resolveScenario('constructor')).toThrow(/default/)
})
