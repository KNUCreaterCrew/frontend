import { isNotFoundError } from '@/shared/api'

export const LOADING = { wakeNoticeMs: 5_000, slowNoticeMs: 60_000, giveUpMs: 90_000 } as const

export type LoadingStage = 'initial' | 'waking' | 'slow'

export function getLoadingStage(elapsedMs: number): LoadingStage {
  if (elapsedMs >= LOADING.slowNoticeMs) return 'slow'
  if (elapsedMs >= LOADING.wakeNoticeMs) return 'waking'
  return 'initial'
}

export type RoomScreenState = 'loading' | 'error' | 'notFound' | 'ready' | 'refreshFailed'

export function getRoomScreenState(input: {
  status: 'pending' | 'error' | 'success'
  hasData: boolean
  error: unknown
  elapsedMs: number
  fetchStatus: 'fetching' | 'paused' | 'idle'
}): RoomScreenState {
  const { status, hasData, error, elapsedMs, fetchStatus } = input
  if (hasData) return status === 'error' ? 'refreshFailed' : 'ready'
  if (status === 'error') return isNotFoundError(error) ? 'notFound' : 'error'
  if (status === 'pending' && fetchStatus !== 'paused' && elapsedMs >= LOADING.giveUpMs)
    return 'error'
  return 'loading'
}
