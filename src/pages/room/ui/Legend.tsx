import { BagIcon, OutletIcon, QuestionIcon, SeatSwatch } from '@/shared/ui'

// 범례 견본은 좌석 칸 4상태를 작게 되풀이한다. 순서는 밝은 칸부터(빈자리 → 짐 있음 → 사용 중 → 확인 불가)
const ITEM = 'flex items-center gap-2'

export function Legend({ outletsHidden = false }: { outletsHidden?: boolean }) {
  return (
    <ul className="flex flex-wrap gap-x-4 gap-y-2 text-label text-ink-soft">
      <li className={ITEM}>
        <SeatSwatch tone="empty" />
        빈자리
      </li>
      <li className={ITEM}>
        <SeatSwatch tone="away" />
        <BagIcon className="-ml-1 size-4 shrink-0 text-ink" />짐 있음
      </li>
      <li className={ITEM}>
        <SeatSwatch tone="occupied" />
        사용 중
      </li>
      <li className={ITEM}>
        <SeatSwatch tone="unknown" />
        <QuestionIcon className="-ml-1 size-4 shrink-0 text-ink-soft" />
        확인 불가
      </li>
      <li className={ITEM}>
        <OutletIcon className="size-4 shrink-0 text-ink" />
        <span>
          콘센트
          {outletsHidden && (
            <>
              , <span>확대하면 보여요</span>
            </>
          )}
        </span>
      </li>
    </ul>
  )
}
