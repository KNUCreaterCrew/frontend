// 견본 크기는 좌석 범례(pages/room/ui/Legend)와 같다
const SWATCH = 'inline-block h-3 w-5 shrink-0 overflow-hidden rounded-chip'

interface StatsLegendProps {
  usualLabel: string | null
  showMissing: boolean
  showLowConfidence: boolean
}

export function StatsLegend({ usualLabel, showMissing, showLowConfidence }: StatsLegendProps) {
  return (
    <ul className="flex flex-wrap gap-x-5 gap-y-3 text-label text-ink-soft">
      <li className="flex items-center gap-2">
        <span aria-hidden="true" className={`${SWATCH} border-t-2 border-empty bg-empty-tint`} />
        오늘 빈자리
      </li>
      {usualLabel !== null && (
        <li className="flex items-center gap-2">
          <span
            aria-hidden="true"
            className="inline-block w-5 shrink-0 border-t-2 border-dashed border-ink-soft"
          />
          {usualLabel}
        </li>
      )}
      {showMissing && (
        <li className="flex items-center gap-2">
          <span
            aria-hidden="true"
            className={`${SWATCH} border border-line-strong bg-surface pattern-unknown`}
          />
          확인하지 못한 시간
        </li>
      )}
      {showLowConfidence && (
        <li className="flex items-center gap-2">
          <span
            aria-hidden="true"
            className={`${SWATCH} border-t-2 border-empty bg-empty-tint opacity-40`}
          />
          잠깐만 본 시간
        </li>
      )}
    </ul>
  )
}
