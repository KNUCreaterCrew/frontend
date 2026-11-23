import { formatRelative, freshnessWarning, useNow } from '@/shared/lib'

type Props = { updatedAt: number | null; refreshFailed?: boolean }

// 좌석 무대 위에 떠 있는 유리 캡슐 둘: 왼쪽 워드마크, 오른쪽 갱신 시각
export function RoomsTopBar({ updatedAt, refreshFailed = false }: Props) {
  const now = useNow(1000)
  const warning = freshnessWarning(updatedAt, refreshFailed, now)
  const text = warning ?? (updatedAt !== null ? `${formatRelative(updatedAt, now)} 갱신` : null)

  return (
    <header className="pointer-events-none fixed inset-x-0 top-float z-20">
      <div className="page-x flex items-center justify-between gap-3">
        <p className="glass pointer-events-auto relative flex min-h-tap items-center gap-2 rounded-full pr-5 pl-4 text-body font-bold tracking-tight text-ink">
          <span aria-hidden="true" className="size-2 rounded-full bg-empty" />
          ZeroFrame
        </p>
        {text && (
          <p
            className={`glass pointer-events-auto relative ml-auto rounded-full px-4 py-2 text-right num text-label ${warning ? 'font-bold text-ink' : 'text-ink-soft'}`}
          >
            {text}
          </p>
        )}
      </div>
    </header>
  )
}
