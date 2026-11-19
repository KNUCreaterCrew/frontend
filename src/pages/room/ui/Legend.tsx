import { OutletIcon } from '@/shared/ui'

// 범례 견본은 좌석 칸과 같은 면, 테두리, 띠, 빗금을 작게 되풀이한다
const SWATCH = 'inline-block h-3 w-5 shrink-0 overflow-hidden rounded-chip'

export function Legend({ outletsHidden = false }: { outletsHidden?: boolean }) {
  return (
    <ul className="flex flex-wrap gap-x-5 gap-y-3 py-4 text-label text-ink-soft">
      <li className="flex items-center gap-2">
        <span aria-hidden="true" className={`${SWATCH} bg-empty shadow-seat`} />
        빈자리
      </li>
      <li className="flex items-center gap-2">
        <span aria-hidden="true" className={`${SWATCH} border border-line-strong bg-occupied`} />
        사용 중
      </li>
      <li className="flex items-center gap-2">
        <span
          aria-hidden="true"
          className={`${SWATCH} border border-line-strong bg-linear-to-b from-surface from-65% to-ink to-65%`}
        />
        짐 있음
      </li>
      <li className="flex items-center gap-2">
        <span
          aria-hidden="true"
          className={`${SWATCH} border border-line-strong bg-surface pattern-unknown`}
        />
        확인 불가
      </li>
      <li className="flex items-center gap-2">
        <OutletIcon className="size-4 shrink-0 text-ink" />
        <span>
          콘센트
          {outletsHidden && <span className="block text-label">확대하면 보여요</span>}
        </span>
      </li>
    </ul>
  )
}
