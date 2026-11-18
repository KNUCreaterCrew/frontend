import { useDelayedVisibility } from '@/shared/lib'
import { LoadingStatus } from '@/shared/ui'

export function RoomsLoading({
  elapsedMs,
  paused = false,
}: {
  elapsedMs: number
  paused?: boolean
}) {
  const showSkeleton = useDelayedVisibility(true)

  return (
    <main className="mt-6">
      <h1 className="text-title font-black tracking-tight">어느 방으로 갈까요</h1>
      <div className="mt-2">
        <LoadingStatus elapsedMs={elapsedMs} paused={paused} />
      </div>
      {showSkeleton && (
        <div aria-busy="true" className="mt-4 border-t-6 border-ink">
          <div className="mt-4 h-16 border-2 border-ink" />
          <div className="mt-4 h-16 border-2 border-ink" />
          <div className="mt-4 h-16 border-2 border-ink" />
        </div>
      )}
    </main>
  )
}
