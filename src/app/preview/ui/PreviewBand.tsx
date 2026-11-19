import { Link, useLocation } from 'react-router'
import { feedbackUrl } from '../model/feedbackUrl'

// 누르는 영역은 44x44 로 두고, 밑줄과 포커스 윤곽선은 안쪽 글자 칸에 그려 띠 가장자리에 닿지 않게 한다.
const LINK = 'group inline-flex min-h-tap min-w-tap items-center justify-end'
const LINK_TEXT =
  'underline underline-offset-4 group-focus-visible:outline-3 group-focus-visible:outline-offset-2 group-focus-visible:outline-paper in-data-scroll-locked:no-underline in-data-scroll-locked:opacity-50'

export function PreviewBand({ scenario, showSwitch }: { scenario: string; showSwitch: boolean }) {
  const location = useLocation()
  const page = location.pathname + location.search
  return (
    <aside
      aria-label="미리보기 안내"
      className="fixed inset-x-0 top-0 z-25 bg-ink text-paper"
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
        <div className="flex shrink-0 items-center gap-4">
          {showSwitch && (
            <Link to="/__preview" className={LINK}>
              <span className={LINK_TEXT}>
                <span className="sr-only">시나리오</span> 바꾸기
              </span>
            </Link>
          )}
          <a
            href={feedbackUrl({ scenario, page })}
            target="_blank"
            rel="noopener noreferrer"
            className={LINK}
          >
            <span className={LINK_TEXT}>
              의견 <span className="sr-only">남기기, 새 탭에서 열림</span>
            </span>
          </a>
        </div>
      </div>
    </aside>
  )
}
