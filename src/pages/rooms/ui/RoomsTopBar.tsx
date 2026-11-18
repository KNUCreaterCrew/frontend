import { formatRelative, freshnessWarning, useNow } from '@/shared/lib'

type Props = { updatedAt: number | null; refreshFailed?: boolean }

export function RoomsTopBar({ updatedAt, refreshFailed = false }: Props) {
  const now = useNow(1000)
  const warning = freshnessWarning(updatedAt, refreshFailed, now)
  const text = warning ?? (updatedAt !== null ? `${formatRelative(updatedAt, now)} 갱신` : null)

  return (
    <header className="flex min-h-tap items-center justify-between gap-3 border-b-2 border-ink text-label">
      <p className="text-body font-bold">ZeroFrame</p>
      {text && <p className="text-right font-num tabular-nums">{text}</p>}
    </header>
  )
}
