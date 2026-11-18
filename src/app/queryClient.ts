import { QueryClient } from '@tanstack/react-query'
import { isRetryableError } from '@/shared/api'

const MAX_RETRIES = 8

export function roomRetry(failureCount: number, error: unknown): boolean {
  return failureCount < MAX_RETRIES && isRetryableError(error)
}

export function roomRetryDelay(attempt: number): number {
  return Math.min(1000 * 2 ** attempt, 10000)
}

export function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: { queries: { retry: roomRetry, retryDelay: roomRetryDelay } },
  })
}
