import { WEEKDAYS, weekdayLabel, weekdayShortLabel } from '@/entities/room'
import type { Weekday } from '@/entities/room'

interface WeekdayPickerProps {
  value: Weekday
  onChange: (weekday: Weekday) => void
}

// 오목한 홈 위에 칸을 늘어놓고, 고른 요일만 흰 캡슐로 떠오른다
export function WeekdayPicker({ value, onChange }: WeekdayPickerProps) {
  return (
    <div
      role="group"
      aria-label="요일"
      className="mt-3 grid grid-cols-7 gap-px rounded-full well p-1"
    >
      {WEEKDAYS.map((weekday) => {
        const selected = weekday === value
        return (
          <button
            key={weekday}
            type="button"
            aria-label={weekdayLabel(weekday)}
            aria-pressed={selected}
            onClick={() => onChange(weekday)}
            className={[
              'h-tap rounded-full text-body font-semibold transition focus-visible:z-10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent',
              selected ? 'text-ink capsule' : 'text-ink-soft hover:text-ink',
            ].join(' ')}
          >
            {weekdayShortLabel(weekday)}
          </button>
        )
      })}
    </div>
  )
}
