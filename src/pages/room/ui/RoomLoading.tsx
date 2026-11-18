import { useDelayedVisibility } from '@/shared/lib'
import { getLoadingStage } from '../lib/screenState'

const NOTICE = {
  waking: '서버를 깨우는 중이에요. 처음 열면 1분쯤 걸릴 수 있어요.',
  slow: '생각보다 오래 걸려요. 조금만 더 기다려 주세요.',
} as const

export function RoomLoading({ elapsedMs }: { elapsedMs: number }) {
  const showSkeleton = useDelayedVisibility(true)
  const stage = getLoadingStage(elapsedMs)

  return (
    <main className="mt-6">
      <p role="status" className="font-bold">
        {stage === 'initial' ? '' : NOTICE[stage]}
      </p>
      {showSkeleton && (
        <div aria-busy="true" className="mt-4">
          <div className="h-16 bg-surface" />
          <div className="mt-2 h-16 bg-surface" />
          <div className="mt-6 h-16 bg-surface" />
          <div className="mt-2 h-16 bg-surface" />
        </div>
      )}
    </main>
  )
}
