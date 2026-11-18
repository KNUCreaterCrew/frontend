// @vitest-environment node
import { createProxy } from './proxy'

test('기본은 로컬 백엔드로 /api 와 /ws 를 넘긴다', () => {
  const p = createProxy()
  expect(p['/api']).toMatchObject({ target: 'http://127.0.0.1:8000', changeOrigin: true })
  expect(p['/ws']).toMatchObject({ target: 'ws://127.0.0.1:8000', ws: true, changeOrigin: true })
})

test('https 백엔드는 /ws 를 wss 로 넘긴다', () => {
  const p = createProxy('https://api.example.com')
  expect(p['/api']).toMatchObject({ target: 'https://api.example.com' })
  expect(p['/ws']).toMatchObject({ target: 'wss://api.example.com', ws: true })
})

test('끝의 / 는 무시한다', () => {
  expect(createProxy('http://10.0.0.5:8000/')['/api']).toMatchObject({
    target: 'http://10.0.0.5:8000',
  })
})
