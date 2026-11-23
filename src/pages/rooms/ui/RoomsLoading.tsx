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
    <main>
      {/* 좌석 무대 자리. 바닥판만 보인다 */}
      <div aria-hidden="true" className="rooms-stage" />
      <div className="page pt-6">
        <h1 className="text-heading font-bold tracking-tight">방을 골라 주세요</h1>
        <div className="mt-2">
          <LoadingStatus elapsedMs={elapsedMs} paused={paused} />
        </div>
        {showSkeleton && (
          <div
            aria-busy="true"
            className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4"
          >
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="glass relative rounded-glass p-4 md:p-5">
                <div className="motion-safe:animate-pulse">
                  <div className="flex h-6 items-center">
                    <div className="h-3 w-2/3 rounded-chip bg-line" />
                  </div>
                  <div className="mt-4 h-10 w-1/3 rounded-chip bg-line" />
                  <div className="mt-4 flex flex-col gap-2">
                    <div className="h-3 rounded-chip bg-line" />
                    <div className="h-3 rounded-chip bg-line" />
                    <div className="h-3 w-2/3 rounded-chip bg-line" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
