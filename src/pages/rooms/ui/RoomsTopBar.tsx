import { formatRelative, freshnessWarning, useNow } from '@/shared/lib'

type Props = { updatedAt: number | null; refreshFailed?: boolean }

export function RoomsTopBar({ updatedAt, refreshFailed = false }: Props) {
  const now = useNow(1000)
  const warning = freshnessWarning(updatedAt, refreshFailed, now)
  const text = warning ?? (updatedAt !== null ? `${formatRelative(updatedAt, now)} 갱신` : null)

  return (
    <header className="sticky top-sticky z-20 border-b border-line glass pt-safe-top">
      <div className="page-x flex min-h-tap items-center justify-between gap-3 text-label">
        <p className="flex items-center gap-2 text-body font-bold tracking-tight text-ink">
          <span aria-hidden="true" className="size-2 rounded-full bg-empty" />
          ZeroFrame
        </p>
        {text && (
          <p
            className={`text-right num ${warning ? 'font-bold text-ink' : 'text-ink-soft'}`.trim()}
          >
            {text}
          </p>
        )}
      </div>
    </header>
  )
}
