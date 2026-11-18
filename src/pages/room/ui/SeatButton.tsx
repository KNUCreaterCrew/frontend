import type { CSSProperties } from 'react'
import { seatAccessibleName, seatStatusLabel } from '@/entities/room'
import type { Seat, SeatStatus } from '@/entities/room'
import { OutletIcon } from '@/shared/ui'
import type { CellStage } from '../lib/geometry'

const FACE: Record<SeatStatus, string> = {
  EMPTY: 'bg-empty text-on-empty',
  OCCUPIED: 'bg-ink text-paper',
  AWAY: 'border-3 border-ink bg-paper text-ink',
  UNKNOWN: 'pattern-unknown border-2 border-ink bg-paper text-ink',
  UNRECOGNIZED: 'pattern-unknown border-2 border-ink bg-paper text-ink',
}

function isHatched(status: SeatStatus): boolean {
  return status === 'UNKNOWN' || status === 'UNRECOGNIZED'
}

interface SeatButtonProps {
  seat: Seat
  stage: CellStage
  style?: CSSProperties
}

export function SeatButton({ seat, stage, style }: SeatButtonProps) {
  const showText = stage !== 'zoom'
  const hatched = isHatched(seat.status)
  const away = seat.status === 'AWAY'
  const chip = hatched ? 'self-start bg-paper px-1' : ''

  return (
    <button
      type="button"
      aria-label={seatAccessibleName(seat)}
      style={style}
      className={`absolute overflow-hidden text-left focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-ink ${FACE[seat.status]}`}
    >
      {away && (
        <span
          aria-hidden="true"
          className="absolute inset-x-0 bottom-0 bg-ink"
          style={{ height: '25%' }}
        />
      )}
      {showText && (
        <span
          className="absolute inset-x-0 top-0 flex flex-col justify-between p-1"
          style={{ bottom: away ? '25%' : 0 }}
        >
          <span
            className={`font-num font-extrabold tabular-nums ${stage === 'full' ? 'text-number' : 'text-label'} ${chip}`}
          >
            {seat.label}
          </span>
          {stage === 'full' && (
            <span className={`text-label font-bold ${chip}`}>{seatStatusLabel(seat.status)}</span>
          )}
          {seat.hasOutlet && (
            <span className={`absolute top-1 right-1 ${hatched ? 'bg-paper p-px' : ''}`}>
              <OutletIcon className="size-3" />
            </span>
          )}
        </span>
      )}
    </button>
  )
}
