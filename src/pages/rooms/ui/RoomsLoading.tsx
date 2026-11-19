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
    <main className="pt-6 lg:pt-10">
      <h1 className="text-title font-bold tracking-tight">방을 골라 주세요</h1>
      <div className="mt-2">
        <LoadingStatus elapsedMs={elapsedMs} paused={paused} />
      </div>
      {showSkeleton && (
        <div aria-busy="true" className="mt-5 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="rounded-panel bg-surface p-4 shadow-plate">
              <div className="min-w-0 flex-1 motion-safe:animate-pulse">
                <div className="flex h-6 items-center">
                  <div className="h-3 w-1/2 rounded-chip bg-line" />
                </div>
                <div className="mt-3 flex items-start gap-4">
                  <div className="w-1/3 shrink-0 pt-5">
                    <div className="h-8 w-2/3 rounded-chip bg-line" />
                  </div>
                  <div className="flex min-w-0 flex-1 flex-col gap-3 pt-2">
                    <div className="h-3 rounded-chip bg-line" />
                    <div className="h-3 rounded-chip bg-line" />
                    <div className="h-3 w-2/3 rounded-chip bg-line" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  )
}
