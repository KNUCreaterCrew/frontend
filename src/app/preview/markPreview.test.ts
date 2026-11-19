import { markPreviewDocument } from './markPreview'

afterEach(() => {
  document.documentElement.classList.remove('preview')
  document.title = ''
})

test('html 에 preview 클래스를 붙이고 제목 앞에 미리보기를 붙인다', () => {
  document.title = 'ZeroFrame'
  markPreviewDocument()
  expect(document.documentElement.classList.contains('preview')).toBe(true)
  expect(document.title).toBe('미리보기 ZeroFrame')
})

test('두 번 불러도 제목에 미리보기가 한 번만 붙는다', () => {
  document.title = 'ZeroFrame'
  markPreviewDocument()
  markPreviewDocument()
  expect(document.title).toBe('미리보기 ZeroFrame')
})
