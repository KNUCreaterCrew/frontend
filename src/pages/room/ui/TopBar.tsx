import { Link } from 'react-router'
import { formatRelative, freshnessWarning, useNow } from '@/shared/lib'

type Props = { updatedAt: number | null; refreshFailed?: boolean }

export function TopBar({ updatedAt, refreshFailed = false }: Props) {
  const now = useNow(1000)
  const warning = freshnessWarning(updatedAt, refreshFailed, now)
  const text = warning ?? (updatedAt !== null ? `${formatRelative(updatedAt, now)} 갱신` : null)

  return (
    <header className="flex items-center justify-between gap-3 border-b-2 border-ink text-label">
      <Link
        to="/"
        className="inline-flex min-h-tap items-center font-bold underline underline-offset-4 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-ink"
      >
        방 목록
      </Link>
      {text && <p className="text-right font-num tabular-nums">{text}</p>}
    </header>
  )
}
