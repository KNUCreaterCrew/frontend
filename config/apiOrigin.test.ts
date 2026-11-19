// @vitest-environment node
import { checkApiOrigin } from './apiOrigin'

const build = (value: string | undefined) =>
  ({ command: 'build', mode: 'production', value }) as const

test('운영 빌드에 값이 없으면 변수 이름을 담은 오류', () => {
  expect(() => checkApiOrigin(build(undefined))).toThrow(/VITE_API_ORIGIN/)
  expect(() => checkApiOrigin(build(''))).toThrow(/VITE_API_ORIGIN/)
})

test.each([
  'ftp://x.test',
  'https://x.test/api',
  'https://x.test?q=1',
  'https://x.test#h',
  'not a url',
])('출처가 아닌 값 %s 는 거절', (v) =>
  expect(() => checkApiOrigin(build(v))).toThrow(/VITE_API_ORIGIN/),
)

test('끝의 / 는 떼어 낸다', () => {
  expect(checkApiOrigin(build('https://zeroframe-backend-p1wa.onrender.com/'))).toBe(
    'https://zeroframe-backend-p1wa.onrender.com',
  )
})

test.each([
  { command: 'serve', mode: 'development' },
  { command: 'serve', mode: 'e2e' },
  { command: 'build', mode: 'e2e' },
  { command: 'serve', mode: 'test' },
] as const)('$command/$mode 는 값이 없어도 통과', (c) => {
  expect(checkApiOrigin({ ...c, value: undefined })).toBeUndefined()
})
