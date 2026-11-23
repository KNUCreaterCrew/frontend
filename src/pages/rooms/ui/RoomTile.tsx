import { Link } from 'react-router'
import { getRoomListSummary } from '@/entities/room'
import type { RoomListItem } from '@/entities/room'
import { ChevronRightIcon } from '@/shared/ui'
import { CountPips } from './CountPips'

const OFFLINE = '장치 연결이 끊겼어요'
const NO_READING = '아직 자리를 확인하지 못했어요'
const NO_SEATS = '등록된 좌석이 없어요'
const unknownSeatsSentence = (n: number) => `확인하지 못한 자리가 ${n}석 있어요`

// 휴대폰에서 방이 하나뿐이면 타일이 한 줄을 다 쓴다. 넓은 화면에서는 한 칸 그대로
const ITEM = 'only:col-span-full md:only:col-span-1'
// 타일 전체가 링크다. 좌석 무대의 바닥판 위에 놓인 유리 판.
// 격자의 모든 줄이 같은 높이(auto-rows-fr)이고 타일이 칸을 다 채워, 내용이 적어도 크기가 같다
const LINK =
  'glass group relative flex h-full min-h-tap flex-col rounded-glass p-4 transition motion-safe:hover:-translate-y-px focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent md:p-5'
// 이름은 두 줄까지. 더 길면 말줄임하고 전체 이름은 링크 이름으로 읽힌다
const NAME =
  'tile-name min-w-0 line-clamp-2 text-fact font-semibold break-keep wrap-anywhere text-ink'
const SENTENCE = 'mt-2 block text-label font-bold text-ink'

function Name({ children }: { children: string }) {
  return (
    <span className="flex items-start justify-between gap-2">
      <span className={NAME}>{children}</span>
      <ChevronRightIcon className="mt-1 size-4 shrink-0 text-ink-soft transition motion-safe:group-hover:translate-x-px" />
    </span>
  )
}

// 확인 불가와 전체를 한 줄로. 좁으면 두 줄로 접힌다
function Facts({ unknown, total }: { unknown: number; total: number }) {
  return (
    <dl className="mt-2 flex flex-wrap gap-x-3 text-label">
      <div className="flex gap-1">
        <dt className="text-ink-soft">확인 불가</dt>
        <dd className="num font-semibold text-ink">{`${unknown}석`}</dd>
      </div>
      <div className="flex gap-1">
        <dt className="text-ink-soft">전체</dt>
        <dd className="num font-semibold text-ink">{`${total}석`}</dd>
      </div>
    </dl>
  )
}

export function RoomTile({ room }: { room: RoomListItem }) {
  const summary = getRoomListSummary(room)
  const to = `/rooms/${encodeURIComponent(room.roomId)}`

  if (summary.kind === 'noSeats') {
    return (
      <li className={ITEM}>
        <Link to={to} aria-label={`${room.roomName}, ${NO_SEATS}`} className={LINK}>
          <Name>{room.roomName}</Name>
          <span className="mt-2 block text-label text-ink-soft">{NO_SEATS}</span>
        </Link>
      </li>
    )
  }

  const total = `전체 ${summary.totalSeats}석`
  const unknown = `확인 불가 ${summary.unknownSeats}석`

  if (summary.kind === 'allUnknown') {
    const sentence = summary.edgeOnline ? NO_READING : OFFLINE
    return (
      <li className={ITEM}>
        <Link
          to={to}
          aria-label={`${room.roomName}, 빈자리 확인 불가, ${unknown}, ${total}, ${sentence}`}
          className={LINK}
        >
          <Name>{room.roomName}</Name>
          <span className="mt-2 flex items-baseline gap-2">
            <span className="text-label text-ink-soft">빈자리</span>
            <span className="text-heading font-bold whitespace-nowrap text-ink">확인 불가</span>
          </span>
          <CountPips available={0} unknown={summary.unknownSeats} total={summary.totalSeats} />
          <Facts unknown={summary.unknownSeats} total={summary.totalSeats} />
          <span className={SENTENCE}>{sentence}</span>
        </Link>
      </li>
    )
  }

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
    ...sentences,
  ].join(', ')
  return (
    <li className={ITEM}>
      <Link to={to} aria-label={name} className={LINK}>
        <Name>{room.roomName}</Name>
        <span className="mt-1 flex items-baseline gap-1">
          <span className="mr-1 text-label text-ink-soft">빈자리</span>
          <span className="num text-row-number font-bold tracking-tight text-empty-ink">
            {summary.availableSeats}
          </span>
          <span className="text-body font-semibold text-ink-soft">석</span>
        </span>
        <CountPips
          available={summary.availableSeats}
          unknown={summary.unknownSeats}
          total={summary.totalSeats}
        />
        <Facts unknown={summary.unknownSeats} total={summary.totalSeats} />
        {sentences.map((text) => (
          <span key={text} className={SENTENCE}>
            {text}
          </span>
        ))}
      </Link>
    </li>
  )
}
