import { Link, useLocation } from 'react-router'
import { feedbackUrl } from '../model/feedbackUrl'

const LINK =
  'inline-flex min-h-tap min-w-tap items-center justify-center underline underline-offset-4 focus-visible:outline-3 focus-visible:-outline-offset-3 focus-visible:outline-paper'

export function PreviewBand({ scenario, showSwitch }: { scenario: string; showSwitch: boolean }) {
  const location = useLocation()
  const page = location.pathname + location.search
  return (
    <aside
      aria-label="미리보기 안내"
      className="fixed inset-x-0 top-0 z-20 bg-ink text-paper"
      style={{ paddingTop: 'env(safe-area-inset-top)' }}
    >
      <div
        className="flex min-h-tap items-center justify-between gap-3 text-label"
        style={{
          paddingLeft: 'max(var(--spacing-4), env(safe-area-inset-left))',
          paddingRight: 'max(var(--spacing-4), env(safe-area-inset-right))',
        }}
      >
        <p className="min-w-0 wrap-anywhere">
          <span className="font-bold">모의 데이터</span>{' '}
          <span className="font-num">{scenario}</span>
        </p>
        <div className="flex shrink-0 items-center">
          {showSwitch && (
            <Link to="/__preview" className={LINK}>
              <span className="sr-only">시나리오</span> 바꾸기
            </Link>
          )}
          <a
            href={feedbackUrl({ scenario, page })}
            target="_blank"
            rel="noopener noreferrer"
            className={LINK}
          >
            의견 <span className="sr-only">남기기, 새 탭에서 열림</span>
          </a>
        </div>
      </div>
    </aside>
  )
}
