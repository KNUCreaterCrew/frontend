import { Link } from 'react-router'
import { formatRelative, freshnessWarning, useNow } from '@/shared/lib'
import { ChevronLeftIcon } from '@/shared/ui'

type Props = {
  updatedAt: number | null
  refreshFailed?: boolean
  /** PC 는 사이드 패널이 방 목록 캡슐을 가지므로 위에는 갱신 시각만 둔다 */
  showBack?: boolean
}

export const BACK_PILL =
  'relative inline-flex min-h-tap items-center gap-1 rounded-full pr-5 pl-4 font-semibold text-ink transition active:scale-98 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent'

// 바닥판 위에 떠 있는 유리 캡슐 둘: 왼쪽 "방 목록", 오른쪽 갱신 시각
export function TopBar({ updatedAt, refreshFailed = false, showBack = true }: Props) {
  const now = useNow(1000)
  const warning = freshnessWarning(updatedAt, refreshFailed, now)
  const text = warning ?? (updatedAt !== null ? `${formatRelative(updatedAt, now)} 갱신` : null)

  return (
    <header
      className={`pointer-events-none fixed inset-x-0 top-float z-20 flex items-center justify-between gap-3 px-4 ${showBack ? 'lg:px-6' : 'lg:right-6 lg:left-auto lg:px-0'}`}
    >
      {showBack && (
        <Link to="/" className={`glass pointer-events-auto ${BACK_PILL}`}>
          <ChevronLeftIcon className="size-4" />방 목록
        </Link>
      )}
      {text && (
        <p
          className={`glass pointer-events-auto relative ml-auto rounded-full px-4 py-2 text-right num text-label ${warning ? 'font-bold text-ink' : 'text-ink-soft'}`}
        >
          {text}
        </p>
      )}
    </header>
  )
}
