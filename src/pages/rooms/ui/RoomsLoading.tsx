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
          {[0, 1, 2].map((i) => (
            <div key={i} className="flex gap-3 border-b-2 border-ink py-4">
              <span aria-hidden="true" className="w-band shrink-0" />
              <div className="min-w-0 flex-1">
                <div className="flex h-6 items-center">
                  <div className="h-1 w-1/2 bg-ink" />
                </div>
                <div className="mt-2 flex items-start gap-4">
                  <div className="w-1/3 shrink-0 pt-6">
                    <div className="h-1 w-1/2 bg-ink" />
                  </div>
                  <div className="flex min-w-0 flex-1 flex-col gap-3 pt-2">
                    <div className="h-1 bg-ink" />
                    <div className="h-1 w-2/3 bg-ink" />
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
