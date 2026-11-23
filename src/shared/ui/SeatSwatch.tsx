export type SeatTone = 'empty' | 'away' | 'occupied' | 'unknown'

const TONE: Record<SeatTone, string> = {
  empty: 'swatch-empty',
  away: 'swatch-away',
  occupied: 'swatch-occupied',
  unknown: 'swatch-unknown',
}

const SIZE = {
  sm: 'h-3 w-5 rounded-chip', // 20x12 범례
  lg: 'h-6 w-8 rounded-seat-sm', // 32x24 좌석 상세 제목 옆
} as const

/** 좌석 칸 4상태를 작게 되풀이한 견본. 장식이라 화면 읽기 도구에는 숨긴다 */
export function SeatSwatch({
  tone,
  size = 'sm',
  className,
}: {
  tone: SeatTone
  size?: keyof typeof SIZE
  className?: string
}) {
  return (
    <span
      aria-hidden="true"
      data-tone={tone}
      className={['inline-block shrink-0', SIZE[size], TONE[tone], className]
        .filter(Boolean)
        .join(' ')}
    />
  )
}
