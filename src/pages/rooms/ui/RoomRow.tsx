import { Link } from 'react-router'
import { congestionLabel, getRoomListSummary } from '@/entities/room'
import type { RoomListItem } from '@/entities/room'

const OFFLINE = '장치 연결이 끊겼어요'
const NO_READING = '아직 자리를 확인하지 못했어요'
const NO_SEATS = '등록된 좌석이 없어요'
const unknownSeatsSentence = (n: number) => `확인하지 못한 자리가 ${n}석 있어요`

const ROW = 'border-b-2 border-ink'
const LINK =
  'flex min-h-tap gap-3 py-4 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-ink'
const NAME = 'block text-fact font-black break-keep wrap-anywhere underline underline-offset-4'
const NUMBER = 'font-num text-row-number tracking-tight tabular-nums'
const COLUMN = 'w-1/3 shrink-0'
const LABEL = 'block text-label'
const SENTENCE = 'mt-2 block text-body font-bold'

function Gutter({ unknown = false }: { unknown?: boolean }) {
  return (
    <span
      aria-hidden="true"
      className={`w-band shrink-0 ${unknown ? 'pattern-unknown' : ''}`.trim()}
    />
  )
}

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
        <Link to={to} aria-label={`${room.roomName}, ${NO_SEATS}`} className={LINK}>
          <Gutter />
          <div className="min-w-0 flex-1">
            <span className={NAME}>{room.roomName}</span>
            <span className="mt-2 block text-body">{NO_SEATS}</span>
          </div>
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
          <Gutter unknown />
          <div className="min-w-0 flex-1">
            <span className={NAME}>{room.roomName}</span>
            <div className="mt-2 flex items-start gap-4">
              <div className={COLUMN}>
                <span className={LABEL}>빈자리</span>
                <span className="block text-title font-black text-ink">모름</span>
              </div>
              <dl className="min-w-0 flex-1">
                <Fact term="확인 불가" value={`${summary.unknownSeats}석`} />
                <Fact term="전체" value={`${summary.totalSeats}석`} />
              </dl>
            </div>
            <span className={SENTENCE}>{sentence}</span>
          </div>
        </Link>
      </li>
    )
  }

  const congestion = congestionLabel(summary.congestionLevel)
  const sentences = [
    ...(summary.availableSeats === 0 && summary.unknownSeats >= 1
      ? [unknownSeatsSentence(summary.unknownSeats)]
      : []),
    ...(summary.edgeOnline ? [] : [OFFLINE]),
  ]
  const name = [
    room.roomName,
    `빈자리 ${summary.availableSeats}석`,
    unknown,
    total,
    congestion,
    ...sentences,
  ].join(', ')
  return (
    <li className={ROW}>
      <Link to={to} aria-label={name} className={LINK}>
        <Gutter />
        <div className="min-w-0 flex-1">
          <span className={NAME}>{room.roomName}</span>
          <div className="mt-2 flex items-start gap-4">
            <div className={COLUMN}>
              <span className={LABEL}>빈자리</span>
              <span className={`${NUMBER} font-extrabold text-empty`}>
                {summary.availableSeats}
              </span>
              <span className="text-body font-bold">석</span>
            </div>
            <dl className="min-w-0 flex-1">
              <Fact term="확인 불가" value={`${summary.unknownSeats}석`} />
              <Fact term="전체" value={`${summary.totalSeats}석`} />
              <Fact term="혼잡도" value={congestion} />
            </dl>
          </div>
          {sentences.map((text) => (
            <span key={text} className={SENTENCE}>
              {text}
            </span>
          ))}
        </div>
      </Link>
    </li>
  )
}
