import { WEEKDAYS, weekdayLabel, weekdayShortLabel } from '@/entities/room'
import type { Weekday } from '@/entities/room'

interface WeekdayPickerProps {
  value: Weekday
  onChange: (weekday: Weekday) => void
}

// 360px 에서도 칸 폭 44px 이상이 되도록 판 안쪽 여백까지 쓴다
export function WeekdayPicker({ value, onChange }: WeekdayPickerProps) {
  return (
    <div role="group" aria-label="요일" className="-mx-2 mt-3 grid grid-cols-7">
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
              'h-tap text-body font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent',
              selected ? 'bg-ink text-on-ink' : 'border border-line-strong bg-surface text-ink',
            ].join(' ')}
          >
            {weekdayShortLabel(weekday)}
          </button>
        )
      })}
    </div>
  )
}
