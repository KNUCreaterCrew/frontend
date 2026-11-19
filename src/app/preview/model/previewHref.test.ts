import { previewHref } from './previewHref'

test('좌석 없는 링크는 scenario 만 붙인다', () => {
  expect(previewHref('mixed', { path: '/' })).toBe('/?scenario=mixed')
})
test('좌석 링크는 scenario 다음에 seat 를 붙인다', () => {
  expect(previewHref('seat-details', { path: '/rooms/IT4-101', seat: 'B-03' })).toBe(
    '/rooms/IT4-101?scenario=seat-details&seat=B-03',
  )
})
