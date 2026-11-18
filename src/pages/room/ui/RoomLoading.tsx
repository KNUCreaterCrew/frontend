import { useDelayedVisibility } from '@/shared/lib'
import { LoadingStatus } from '@/shared/ui'

export function RoomLoading({
  elapsedMs,
  paused = false,
}: {
  elapsedMs: number
  paused?: boolean
}) {
  const showSkeleton = useDelayedVisibility(true)

  return (
    <main className="mt-6">
      <LoadingStatus elapsedMs={elapsedMs} paused={paused} />
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
