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
