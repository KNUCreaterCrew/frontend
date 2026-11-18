import { Link } from 'react-router'
import { congestionLabel, getRoomListSummary } from '@/entities/room'
import type { RoomListItem } from '@/entities/room'

const OFFLINE = '장치 연결이 끊겼어요'
const NO_READING = '아직 자리를 확인하지 못했어요'
const NO_SEATS = '등록된 좌석이 없어요'

const ROW = 'border-b-2 border-ink'
const LINK =
  'flex min-h-tap gap-3 py-4 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-ink'
const NAME = 'block text-fact font-black break-keep wrap-anywhere'
const NUMBER = 'font-num text-row-number tracking-tight tabular-nums'
const SENTENCE = 'block border-t border-ink pt-1 text-body font-bold'

function Fact({ term, value }: { term: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-3 border-t border-ink py-1 first:border-t-0">
      <dt className="text-body whitespace-nowrap">{term}</dt>
      <dd className="font-num text-number font-bold tabular-nums">{value}</dd>
    </div>
  )
}

export function RoomRow({ room }: { room: RoomListItem }) {
  const summary = getRoomListSummary(room)
  const to = `/rooms/${encodeURIComponent(room.roomId)}`

  if (summary.kind === 'noSeats') {
    return (
      <li className={ROW}>
        <Link to={to} aria-label={`${room.roomName}, ${NO_SEATS}`} className={`${LINK} flex-col`}>
          <span className={NAME}>{room.roomName}</span>
          <span className="text-body">{NO_SEATS}</span>
        </Link>
      </li>
    )
  }

  const total = `전체 ${summary.totalSeats}석`
  const unknown = `확인 불가 ${summary.unknownSeats}석`

  if (summary.kind === 'allUnknown') {
    const sentence = summary.edgeOnline ? NO_READING : OFFLINE
    return (
      <li className={ROW}>
        <Link
          to={to}
          aria-label={`${room.roomName}, 빈자리 모름, ${unknown}, ${total}, ${sentence}`}
          className={LINK}
        >
          <span aria-hidden="true" className="w-band shrink-0 pattern-unknown" />
          <div className="min-w-0 flex-1">
            <span className={NAME}>{room.roomName}</span>
            <div className="mt-2 flex items-end gap-4">
              <span className={`${NUMBER} shrink-0 font-black text-ink`}>모름</span>
              <div className="min-w-0 flex-1">
                <dl>
                  <Fact term="확인 불가" value={`${summary.unknownSeats}석`} />
                  <Fact term="전체" value={`${summary.totalSeats}석`} />
                </dl>
                <span className={SENTENCE}>{sentence}</span>
              </div>
            </div>
          </div>
        </Link>
      </li>
    )
  }

  const congestion = congestionLabel(summary.congestionLevel)
  const name =
    `${room.roomName}, 빈자리 ${summary.availableSeats}석, ${unknown}, ${total}, ${congestion}` +
    (summary.edgeOnline ? '' : `, ${OFFLINE}`)
  return (
    <li className={ROW}>
      <Link to={to} aria-label={name} className={`${LINK} flex-col`}>
        <span className={NAME}>{room.roomName}</span>
        <div className="flex items-end gap-4">
          <span className="shrink-0">
            <span className={`${NUMBER} font-extrabold text-empty`}>{summary.availableSeats}</span>
            <span className="text-body font-bold">석</span>
          </span>
          <div className="min-w-0 flex-1">
            <dl>
              <Fact term="확인 불가" value={`${summary.unknownSeats}석`} />
              <Fact term="전체" value={`${summary.totalSeats}석`} />
              <Fact term="혼잡도" value={congestion} />
            </dl>
            {!summary.edgeOnline && <span className={SENTENCE}>{OFFLINE}</span>}
          </div>
        </div>
      </Link>
    </li>
  )
}
