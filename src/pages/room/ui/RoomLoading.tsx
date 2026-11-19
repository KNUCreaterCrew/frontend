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
    <main className="pt-4 lg:pt-8">
      <LoadingStatus elapsedMs={elapsedMs} paused={paused} />
      {showSkeleton && (
        <div aria-busy="true" className="mt-4 lg:grid lg:grid-room lg:items-start lg:gap-x-8">
          <div className="rounded-panel bg-ink p-5">
            <div className="motion-safe:animate-pulse">
              <div className="h-6 w-1/2 rounded-chip bg-on-ink/15" />
              <div className="mt-5 flex items-end gap-5 border-t border-on-ink/15 pt-5">
                <div className="h-16 w-12 shrink-0 rounded-chip bg-on-ink/15" />
                <div className="flex flex-1 flex-col gap-3">
                  <div className="h-4 rounded-chip bg-on-ink/15" />
                  <div className="h-3 rounded-chip bg-on-ink/10" />
                  <div className="h-3 rounded-chip bg-on-ink/10" />
                </div>
              </div>
            </div>
          </div>
          <div className="mt-4 aspect-4/3 rounded-panel bg-surface pattern-floor shadow-plate lg:mt-0" />
        </div>
      )}
    </main>
  )
}
