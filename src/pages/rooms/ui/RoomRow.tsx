import { Link } from 'react-router'
import { congestionLabel, getRoomListSummary } from '@/entities/room'
import type { RoomListItem } from '@/entities/room'
import { ChevronRightIcon, SeatSwatch } from '@/shared/ui'

const OFFLINE = '장치 연결이 끊겼어요'
const NO_READING = '아직 자리를 확인하지 못했어요'
const NO_SEATS = '등록된 좌석이 없어요'
const unknownSeatsSentence = (n: number) => `확인하지 못한 자리가 ${n}석 있어요`

const ROW = 'h-full'
// 카드 전체가 링크다
const LINK =
  'group relative block h-full min-h-tap rounded-glass glass transition motion-safe:hover:-translate-y-px focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent'
const BODY = 'min-w-0 p-5'
const NAME = 'block min-w-0 text-fact font-semibold break-keep wrap-anywhere text-ink'
const NUMBER = 'num text-row-number tracking-tight'
const COLUMN = 'w-1/3 shrink-0'
const LABEL = 'block text-label text-ink-soft'
const SENTENCE = 'mt-3 block text-body font-bold text-ink'

function Name({ children }: { children: string }) {
  return (
    <span className="flex items-start justify-between gap-3">
      <span className={NAME}>{children}</span>
      <ChevronRightIcon className="mt-1 size-4 shrink-0 text-ink-soft transition motion-safe:group-hover:translate-x-px" />
    </span>
  )
}

// "모름" 방에서 빈자리 라벨 옆에 둔다. 좌석 칸, 범례와 같은 점선 윤곽이라 흑백에서도 모름으로 읽힌다
function UnknownSwatch() {
  return <SeatSwatch tone="unknown" className="ml-2 align-middle" />
}

function Fact({ term, value }: { term: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-3 border-t border-line py-1 first:border-t-0">
      <dt className="text-body whitespace-nowrap text-ink-soft">{term}</dt>
      <dd className="num text-number font-semibold text-ink">{value}</dd>
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
          <div className={BODY}>
            <Name>{room.roomName}</Name>
            <span className="mt-2 block text-body text-ink-soft">{NO_SEATS}</span>
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
          aria-label={`${room.roomName}, 빈자리 확인 불가, ${unknown}, ${total}, ${sentence}`}
          className={LINK}
        >
          <div className={BODY}>
            <Name>{room.roomName}</Name>
            <div className="mt-3 flex items-start gap-4">
              <div className={COLUMN}>
                <span className={LABEL}>
                  빈자리
                  <UnknownSwatch />
                </span>
                <span className="block text-title font-bold whitespace-nowrap text-ink">
                  확인 불가
                </span>
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
        <div className={BODY}>
          <Name>{room.roomName}</Name>
          <div className="mt-3 flex items-start gap-4">
            <div className={COLUMN}>
              <span className={LABEL}>빈자리</span>
              <span className={`${NUMBER} font-bold text-empty-ink`}>{summary.availableSeats}</span>
              <span className="ml-1 text-body font-semibold text-ink-soft">석</span>
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
