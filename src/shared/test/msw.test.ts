import { ws } from 'msw'
import { server } from '@mocks/node'

test('핸들러가 없는 API 요청은 실패한다', async () => {
  await expect(fetch('http://localhost/api/v1/unhandled-probe')).rejects.toThrow()
})

test('실패 원인은 MSW 의 미처리 요청 차단이다', async () => {
  const error = await fetch('http://localhost/api/v1/unhandled-probe').catch((e: unknown) => e)
  expect(String((error as Error).cause)).toMatch(/\[MSW\]/)
})

test('핸들러가 없는 WebSocket 연결은 MSW 가 error 로 막는다', async () => {
  const spy = vi.spyOn(console, 'error').mockImplementation(() => {})
  try {
    const socket = new WebSocket('ws://localhost:59999/ws/unhandled-probe')
    await new Promise<void>((resolve) => socket.addEventListener('error', () => resolve()))
    const logged = spy.mock.calls.flat().map(String).join('\n')
    expect(logged).toMatch(/\[MSW\].*without a matching event handler/s)
    expect(logged).toContain('ws://localhost:59999/ws/unhandled-probe')
    socket.close()
  } finally {
    spy.mockRestore()
  }
})

test('MSW 가 WebSocket 을 가로챈다: 핸들러가 있으면 열린다', async () => {
  const chat = ws.link('ws://localhost/ws/handled-probe')
  server.use(chat.addEventListener('connection', () => {}))
  const socket = new WebSocket('ws://localhost/ws/handled-probe')
  const outcome = await new Promise<string>((resolve) => {
    socket.addEventListener('open', () => resolve('open'))
    socket.addEventListener('error', () => resolve('error'))
  })
  expect(outcome).toBe('open')
  socket.close()
})
