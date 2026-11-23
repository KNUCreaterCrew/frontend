import { Component, Suspense, lazy, useCallback, useMemo, useState, type ReactNode } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useReducedMotion } from 'motion/react'
import { Link } from 'react-router'
import { roomPreviewQueryOptions } from '@/entities/room'
import { isNotFoundError } from '@/shared/api'
import { ChevronRightIcon } from '@/shared/ui'
import type { StagePick } from '../lib/pickStageRoom'
import { toStageLayout } from '../lib/stageLayout'
import { StaticStage } from './stage/StaticStage'

// three.js 는 이 묶음에만 있다. 첫 화면의 숫자와 목록은 기다리지 않는다
const SeatStageCanvas = lazy(() => import('./stage/SeatStageCanvas'))

// jsdom 같은 환경에는 WebGLRenderingContext 자체가 없다. 실제 문맥은 장면을 만들 때 다시 확인한다
function canUseWebGL(): boolean {
  if (typeof window === 'undefined' || typeof window.WebGLRenderingContext === 'undefined') {
    return false
  }
  try {
    const canvas = document.createElement('canvas')
    return Boolean(canvas.getContext('webgl2') ?? canvas.getContext('webgl'))
  } catch {
    return false
  }
}

// 묶음을 못 불러오면 정지 그림으로 바꾼다
class StageBoundary extends Component<{ fallback: ReactNode; children: ReactNode }> {
  state = { failed: false }
  static getDerivedStateFromError() {
    return { failed: true }
  }
  render() {
    return this.state.failed ? this.props.fallback : this.props.children
  }
}

// 휴대폰은 안내와 방 이름을 두 줄로 나눠 "방" 같은 글자가 홀로 줄바꿈되지 않게 한다
const CAPTION =
  'glass group pointer-events-auto relative inline-flex min-h-tap max-w-full items-center gap-3 rounded-glass py-2 pr-4 pl-5 text-ink transition active:scale-98 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent md:rounded-full'

/** 머리 영역: 빈자리가 가장 많은 방의 실제 좌석이 블록으로 서 있고, 확인된 빈자리만 빛난다 */
export function RoomStage({ pick }: { pick: StagePick }) {
  const { room, hasEmpty } = pick
  const reduceMotion = useReducedMotion() === true
  const [webgl] = useState(canUseWebGL)
  const [failed, setFailed] = useState(false)
  const onFail = useCallback(() => setFailed(true), [])
  const { data, error } = useQuery(roomPreviewQueryOptions(room.roomId))
  const layout = useMemo(() => (data ? toStageLayout(data) : null), [data])

  // 목록에 있지만 조회에서 없는 방이면 무대를 비우고 안내도 하지 않는다
  if (isNotFoundError(error)) return null

  const still = layout && <StaticStage layout={layout} />
  const to = `/rooms/${encodeURIComponent(room.roomId)}`
  const label = hasEmpty ? '지금 빈자리가 가장 많은 방' : '확인된 빈자리가 있는 방이 없어요'
  const name = hasEmpty
    ? `${label}, ${room.roomName}, 빈자리 ${room.availableSeats}석`
    : `${label}, ${room.roomName} 좌석 보기`

  return (
    <section aria-label="좌석 무대" className="relative">
      <div className="relative rooms-stage">
        {layout &&
          (webgl && !reduceMotion && !failed ? (
            <StageBoundary fallback={still}>
              <Suspense fallback={null}>
                <SeatStageCanvas layout={layout} onFail={onFail} />
              </Suspense>
            </StageBoundary>
          ) : (
            <div className="page-x h-full pt-16 pb-12">{still}</div>
          ))}
      </div>
      <div className="pointer-events-none absolute inset-x-0 bottom-0 page-x flex">
        <Link to={to} aria-label={name} className={CAPTION}>
          <span className="flex min-w-0 flex-col md:flex-row md:items-baseline md:gap-2">
            <span className="text-label text-ink-soft">{label}</span>
            <span className="text-body font-bold">
              {room.roomName}
              {hasEmpty && (
                <span className="ml-1 num whitespace-nowrap text-empty-ink">{`${room.availableSeats}석`}</span>
              )}
            </span>
          </span>
          <ChevronRightIcon className="size-4 shrink-0 text-ink-soft transition motion-safe:group-hover:translate-x-px" />
        </Link>
      </div>
    </section>
  )
}
