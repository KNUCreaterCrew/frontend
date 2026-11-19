import { feedbackUrl } from './feedbackUrl'

test('이슈 양식 주소에 시나리오와 화면을 담는다', () => {
  const page = '/rooms/IT4-101?seat=B-03&scenario=offline'
  const url = new URL(feedbackUrl({ scenario: 'offline', page }))
  expect(url.origin + url.pathname).toBe('https://github.com/KNUCreaterCrew/frontend/issues/new')
  expect(url.searchParams.get('template')).toBe('preview-feedback.yml')
  expect(url.searchParams.get('title')).toBe('[미리보기] offline')
  expect(url.searchParams.get('scenario')).toBe('offline')
  expect(url.searchParams.get('page')).toBe(page)
})
