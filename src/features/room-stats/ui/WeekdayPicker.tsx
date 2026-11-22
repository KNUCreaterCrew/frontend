import { WEEKDAYS, weekdayLabel, weekdayShortLabel } from '@/entities/room'
import type { Weekday } from '@/entities/room'

interface WeekdayPickerProps {
  value: Weekday
  onChange: (weekday: Weekday) => void
}

// 바깥 테두리 하나에 둥근 모서리, 칸 사이는 세로 선만. 선택 칸의 모서리도 바깥 반경에 맞춘다
export function WeekdayPicker({ value, onChange }: WeekdayPickerProps) {
  return (
    <div
      role="group"
      aria-label="요일"
      className="mt-3 grid grid-cols-7 rounded-control border border-line-strong"
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
              'h-tap text-body font-semibold focus-visible:z-10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent',
              'not-first:border-l not-first:border-line-strong first:rounded-l-control last:rounded-r-control',
              selected ? 'bg-ink text-on-ink' : 'bg-surface text-ink',
            ].join(' ')}
          >
            {weekdayShortLabel(weekday)}
          </button>
        )
      })}
    </div>
  )
}
