import { OutletIcon } from '@/shared/ui'

const SWATCH = 'inline-block h-3 w-5 shrink-0'

export function Legend() {
  return (
    <ul className="grid grid-cols-2 gap-x-3 gap-y-2 py-4 text-label">
      <li className="flex items-center gap-2">
        <span aria-hidden="true" className={`${SWATCH} bg-empty`} />
        빈자리
      </li>
      <li className="flex items-center gap-2">
        <span aria-hidden="true" className={`${SWATCH} bg-ink`} />
        사용 중
      </li>
      <li className="flex items-center gap-2">
        <span
          aria-hidden="true"
          className={`${SWATCH} border-2 border-ink bg-linear-to-b from-paper from-60% to-ink to-60%`}
        />
        짐 있음
      </li>
      <li className="flex items-center gap-2">
        <span aria-hidden="true" className={`${SWATCH} border border-ink pattern-unknown`} />
        확인 불가
      </li>
      <li className="flex items-center gap-2">
        <OutletIcon className="size-3 shrink-0" />
        콘센트
      </li>
    </ul>
  )
}
