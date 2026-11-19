import { Link } from 'react-router'
import { formatRelative, freshnessWarning, useNow } from '@/shared/lib'
import { ChevronLeftIcon } from '@/shared/ui'

type Props = { updatedAt: number | null; refreshFailed?: boolean }

export function TopBar({ updatedAt, refreshFailed = false }: Props) {
  const now = useNow(1000)
  const warning = freshnessWarning(updatedAt, refreshFailed, now)
  const text = warning ?? (updatedAt !== null ? `${formatRelative(updatedAt, now)} 갱신` : null)

  return (
    <header className="sticky top-sticky z-20 border-b border-line glass pt-safe-top">
      <div className="page-x flex items-center justify-between gap-3 text-label">
        <Link
          to="/"
          className="-ml-2 inline-flex min-h-tap items-center gap-1 rounded-control pr-3 pl-1 font-semibold text-ink transition hover:bg-surface focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        >
          <ChevronLeftIcon className="size-4" />방 목록
        </Link>
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
