import { afterEach, vi } from 'vitest'
import { delay, http as mswHttp, HttpResponse } from 'msw'
import { z } from 'zod'
import { server } from '@mocks/node'
import { ApiError, http as api, isNotFoundError } from '@/shared/api'

afterEach(() => {
  vi.unstubAllEnvs()
  vi.restoreAllMocks()
})

const schema = z.object({ a: z.number() })

async function failure(promise: Promise<unknown>): Promise<unknown> {
  try {
    await promise
  } catch (e) {
    return e
  }
  throw new Error('rejected 되어야 한다')
}

test('200 응답을 스키마로 파싱해 돌려준다', async () => {
  server.use(mswHttp.get('*/api/test', () => HttpResponse.json({ a: 1 })))
  await expect(api.get('/api/test', schema)).resolves.toEqual({ a: 1 })
})

test('404 는 http 오류이고 isNotFoundError 가 참이다', async () => {
  server.use(
    mswHttp.get('*/api/test', () =>
      HttpResponse.json({ detail: '등록되지 않은 방입니다.' }, { status: 404 }),
    ),
  )
  const e = await failure(api.get('/api/test', schema))
  expect(e).toBeInstanceOf(ApiError)
  expect(e).toMatchObject({ kind: 'http', status: 404, message: '등록되지 않은 방입니다.' })
  expect(isNotFoundError(e)).toBe(true)
})

test('500 은 http 오류이고 isNotFoundError 가 거짓이다', async () => {
  server.use(mswHttp.get('*/api/test', () => new HttpResponse(null, { status: 500 })))
  const e = await failure(api.get('/api/test', schema))
  expect(e).toMatchObject({ kind: 'http', status: 500 })
  expect(isNotFoundError(e)).toBe(false)
})

test('연결 실패는 network 오류다', async () => {
  server.use(mswHttp.get('*/api/test', () => HttpResponse.error()))
  const e = await failure(api.get('/api/test', schema))
  expect(e).toBeInstanceOf(ApiError)
  expect(e).toMatchObject({ kind: 'network' })
})

test('스키마와 다른 본문은 parse 오류다', async () => {
  server.use(mswHttp.get('*/api/test', () => HttpResponse.json({ a: 'x' })))
  const e = await failure(api.get('/api/test', schema))
  expect(e).toMatchObject({ kind: 'parse' })
})

test('timeoutMs 안에 응답이 없으면 timeout 오류다', async () => {
  server.use(
    mswHttp.get('*/api/test', async () => {
      await delay('infinite')
      return HttpResponse.json({ a: 1 })
    }),
  )
  const e = await failure(api.get('/api/test', schema, { timeoutMs: 50 }))
  expect(e).toBeInstanceOf(ApiError)
  expect(e).toMatchObject({ kind: 'timeout' })
})

test('바깥 signal 로 abort 하면 ApiError 가 아닌 AbortError 가 거부된다', async () => {
  server.use(
    mswHttp.get('*/api/test', async () => {
      await delay('infinite')
      return HttpResponse.json({ a: 1 })
    }),
  )
  const controller = new AbortController()
  const pending = failure(api.get('/api/test', schema, { signal: controller.signal }))
  controller.abort()
  const e = await pending
  expect(e).not.toBeInstanceOf(ApiError)
  expect(e).toMatchObject({ name: 'AbortError' })
})

test('상대 경로를 location.origin 기준 절대 URL 로 요청한다', async () => {
  let url = ''
  server.use(
    mswHttp.get('*/api/test', ({ request }) => {
      url = request.url
      return HttpResponse.json({ a: 1 })
    }),
  )
  await api.get('/api/test', schema)
  expect(url).toBe(new URL('/api/test', location.origin).href)
})

test('CORS 사전 요청이 생기지 않게 accept 헤더만 보낸다', async () => {
  server.use(mswHttp.get('*/api/test', () => HttpResponse.json({ a: 1 })))
  const spy = vi.spyOn(globalThis, 'fetch')
  await api.get('/api/test', schema)
  const init = spy.mock.calls[0]?.[1]
  expect([...new Headers(init?.headers).keys()]).toEqual(['accept'])
  expect(init?.method).toBe('GET')
})

test('VITE_API_ORIGIN 이 있으면 그 출처로 요청한다', async () => {
  vi.stubEnv('VITE_API_ORIGIN', 'https://zeroframe-backend-p1wa.onrender.com')
  let url = ''
  server.use(
    mswHttp.get('*/api/test', ({ request }) => {
      url = request.url
      return HttpResponse.json({ a: 1 })
    }),
  )
  await api.get('/api/test', schema)
  expect(url).toBe('https://zeroframe-backend-p1wa.onrender.com/api/test')
})
