import type { ReactNode } from 'react'
import { useDelayedVisibility } from '@/shared/lib'
import { LoadingStatus } from '@/shared/ui'

const BAR = 'rounded-chip bg-ink/10'

export function RoomLoading({
  elapsedMs,
  paused = false,
  panelHead = null,
}: {
  elapsedMs: number
  paused?: boolean
  /** PC 사이드 패널 머리(서비스 이름, 방 목록). 준비된 화면과 같은 자리에 둔다 */
  panelHead?: ReactNode
}) {
  const showSkeleton = useDelayedVisibility(true)

  return (
    <main>
      {/* 준비된 화면과 같은 자리: 휴대폰은 위 요약 띠, PC 는 왼쪽 사이드 패널 */}
      <section className="glass fixed inset-x-3 top-hud z-20 mx-auto max-w-sheet rounded-glass px-5 py-4 lg:top-float lg:right-auto lg:bottom-4 lg:left-4 lg:w-side lg:max-w-none lg:p-5">
        {panelHead !== null && <div className="mb-5">{panelHead}</div>}
        <LoadingStatus elapsedMs={elapsedMs} paused={paused} />
        {showSkeleton && (
          <div
            aria-hidden="true"
            data-skeleton="summary"
            className="flex items-center gap-4 motion-safe:animate-pulse lg:mt-4"
          >
            <div className={`h-16 w-12 shrink-0 ${BAR}`} />
            <div className="flex flex-1 flex-col gap-3">
              <div className={`h-5 w-2/3 ${BAR}`} />
              <div className={`h-3 ${BAR}`} />
            </div>
          </div>
        )}
      </section>
      {showSkeleton && (
        <div aria-busy="true" className="room-floor">
          <div
            data-skeleton="floor"
            className="grid w-full max-w-sheet grid-cols-3 gap-2 p-3 motion-safe:animate-pulse"
          >
            {Array.from({ length: 6 }, (_, i) => (
              <div key={i} className="aspect-square rounded-seat bg-ink/10" />
            ))}
          </div>
        </div>
      )}
    </main>
  )
}
