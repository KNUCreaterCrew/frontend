import { useDelayedVisibility } from '@/shared/lib'
import { getLoadingStage } from '../lib/screenState'

const NOTICE = {
  waking: '서버를 깨우는 중이에요. 처음 열면 1분쯤 걸릴 수 있어요.',
  slow: '생각보다 오래 걸려요. 조금만 더 기다려 주세요.',
} as const

const OFFLINE = '인터넷에 연결되어 있지 않아요. 연결되면 바로 불러올게요.'

export function RoomLoading({
  elapsedMs,
  paused = false,
}: {
  elapsedMs: number
  paused?: boolean
}) {
  const showSkeleton = useDelayedVisibility(true)
  const stage = getLoadingStage(elapsedMs)

  return (
    <main className="mt-6">
      <p role="status" className="font-bold">
        {paused ? OFFLINE : stage === 'initial' ? '' : NOTICE[stage]}
      </p>
      {showSkeleton && (
        <div aria-busy="true" className="mt-4">
          <div className="h-8 border-2 border-ink" />
          <div className="mt-6 flex gap-4">
            <div className="size-16 shrink-0 border-2 border-ink" />
            <div className="flex-1">
              <div className="h-4 border-2 border-ink" />
              <div className="mt-2 h-4 border-2 border-ink" />
              <div className="mt-2 h-4 border-2 border-ink" />
            </div>
          </div>
          <div className="mt-6 border-t-6 border-ink" />
          <div className="mt-2 h-16 border-2 border-ink" />
        </div>
      )}
    </main>
  )
}
