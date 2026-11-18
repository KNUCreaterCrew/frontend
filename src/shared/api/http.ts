import type { z } from 'zod'
import { ApiError } from './ApiError'

type GetOptions = { signal?: AbortSignal; timeoutMs?: number }

async function detailOf(res: Response): Promise<string | undefined> {
  try {
    const body: unknown = await res.json()
    if (typeof body === 'object' && body !== null && 'detail' in body) {
      return typeof body.detail === 'string' ? body.detail : undefined
    }
  } catch {
    // 본문이 없거나 JSON 이 아니면 기본 메시지를 쓴다.
  }
  return undefined
}

async function get<T>(path: string, schema: z.ZodType<T>, options: GetOptions = {}): Promise<T> {
  const { signal, timeoutMs } = options
  const controller = new AbortController()
  let timedOut = false

  const onOuterAbort = () => controller.abort(signal?.reason)
  if (signal?.aborted) onOuterAbort()
  else signal?.addEventListener('abort', onOuterAbort, { once: true })

  const timer =
    timeoutMs === undefined
      ? undefined
      : setTimeout(() => {
          timedOut = true
          controller.abort()
        }, timeoutMs)

  try {
    let res: Response
    try {
      res = await fetch(new URL(path, location.origin), {
        method: 'GET',
        headers: { Accept: 'application/json' },
        signal: controller.signal,
      })
    } catch (cause) {
      if (timedOut) throw new ApiError('timeout', { cause })
      if (signal?.aborted) throw cause
      throw new ApiError('network', { cause })
    }

    if (!res.ok) {
      const detail = await detailOf(res)
      throw new ApiError('http', { status: res.status, message: detail, cause: res })
    }

    let body: unknown
    try {
      body = await res.json()
    } catch (cause) {
      if (timedOut) throw new ApiError('timeout', { cause })
      if (signal?.aborted) throw cause
      throw new ApiError('parse', { cause })
    }

    const parsed = schema.safeParse(body)
    if (!parsed.success) throw new ApiError('parse', { cause: parsed.error })
    return parsed.data
  } finally {
    clearTimeout(timer)
    signal?.removeEventListener('abort', onOuterAbort)
  }
}

export const http = { get }
