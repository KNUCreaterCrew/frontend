import { ApiError } from './ApiError'

const RETRYABLE_STATUS = new Set([502, 503, 504])

export function isRetryableError(e: unknown): boolean {
  if (!(e instanceof ApiError)) return false
  if (e.kind === 'network') return true
  return e.kind === 'http' && e.status !== undefined && RETRYABLE_STATUS.has(e.status)
}
