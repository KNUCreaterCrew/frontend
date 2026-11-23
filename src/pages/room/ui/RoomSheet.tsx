import { useCallback, useLayoutEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { LazyMotion, animate, domMax, m, useMotionValue, useReducedMotion } from 'motion/react'

const EASE = [0.16, 1, 0.3, 1] as const
const TRANSITION = { duration: 0.24, ease: EASE }
// 이보다 짧게 펼쳐지면 손잡이를 두지 않는다
const MIN_RANGE_PX = 24
// 놓을 때 이 속도(px/s)를 넘으면 위치와 상관없이 그 방향으로 간다
const FLING_PX_S = 500

export interface SheetFold {
  /** 접힌 시트가 보여 줄 마지막 요소. 이 요소 아래가 펼쳐야 보인다 */
  mark: (el: HTMLElement | null) => void
  /** 접혀 있을 때만 보이는 안내 */
  hint: ReactNode
}

interface RoomSheetProps {
  /** PC 는 사이드 패널 안, 요약 아래를 채우는 스크롤 영역이다(끌기 없음) */
  desktop: boolean
  /** PC 에서 요약이 끝나는 화면 위치(px) */
  desktopTop: number | null
  /** 휴대폰에서 요약 띠가 끝나는 화면 위치(px). 펼친 시트는 이 아래에서 멈춘다 */
  mobileTop: number | null
  /** 접힌 시트가 화면 아래에서 덮는 높이(px). 바닥판 아래 여백으로 쓴다 */
  onCoverChange: (px: number) => void
  children: (fold: SheetFold | null) => ReactNode
}

/**
 * 휴대폰 아래의 유리 시트. 접힘(범례, 오늘 흐름 제목, 비교 문장)과 펼침(그래프, 요일별 평소) 두 단계.
 * 손잡이를 끌거나 눌러서 오가고, 접힌 동안 아래 내용에 포커스가 가면 펼친다.
 * 시트는 화면 아래에 붙은 채 높이만 바뀐다(둥근 아래 모서리와 그림자가 늘 보인다).
 * 끌기 중의 높이는 state 가 아니라 MotionValue 다.
 */
export function RoomSheet({
  desktop,
  desktopTop,
  mobileTop,
  onCoverChange,
  children,
}: RoomSheetProps) {
  if (desktop) {
    return (
      <div
        className="fixed bottom-4 left-4 z-20 w-side overflow-y-auto overscroll-contain rounded-b-glass fade-bottom px-5 pb-5"
        style={{ top: desktopTop ?? undefined }}
      >
        <div className="mt-5 border-t border-line pt-5">{children(null)}</div>
      </div>
    )
  }
  return (
    <MobileSheet mobileTop={mobileTop} onCoverChange={onCoverChange}>
      {children}
    </MobileSheet>
  )
}

function MobileSheet({
  mobileTop,
  onCoverChange,
  children,
}: Pick<RoomSheetProps, 'mobileTop' | 'onCoverChange' | 'children'>) {
  const sheetRef = useRef<HTMLDivElement>(null)
  const handleRef = useRef<HTMLDivElement>(null)
  const bodyRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const [foldEl, setFoldEl] = useState<HTMLElement | null>(null)
  const foldRef = useCallback((el: HTMLElement | null) => setFoldEl(el), [])
  // 접힌 높이와 펼친 높이(px). 끌기 중의 높이는 MotionValue 로만 바꾼다
  const [heights, setHeights] = useState<{ peek: number; full: number } | null>(null)
  const heightsRef = useRef<{ peek: number; full: number } | null>(null)
  const [expanded, setExpanded] = useState(false)
  const expandedRef = useRef(false)
  const dragged = useRef(false)
  const panStart = useRef(0)
  const height = useMotionValue(0)
  const reduceMotion = useReducedMotion()

  const moveTo = useCallback(
    (open: boolean) => {
      const h = heightsRef.current
      if (!h) return
      expandedRef.current = open
      setExpanded(open)
      if (!open) bodyRef.current?.scrollTo({ top: 0 })
      const target = open ? h.full : h.peek
      if (reduceMotion) height.jump(target)
      else void animate(height, target, TRANSITION)
    },
    [reduceMotion, height],
  )

  // 내용 전체 높이와 접힘 경계까지의 높이를 잰다. 시트 높이와 상관없이 내용의 자연 높이로 잰다
  useLayoutEffect(() => {
    const sheet = sheetRef.current
    const handle = handleRef.current
    const body = bodyRef.current
    const content = contentRef.current
    if (!sheet || !handle || !body || !content) return
    const measure = () => {
      const bodyStyle = getComputedStyle(body)
      const padTop = parseFloat(bodyStyle.paddingTop) || 0
      const padBottom = parseFloat(bodyStyle.paddingBottom) || 0
      const natural = handle.offsetHeight + padTop + content.offsetHeight + padBottom
      if (content.offsetHeight <= 0) return
      // 펼친 시트는 요약 띠 아래 12px 에서 멈춘다(큰 빈자리 숫자를 가리지 않는다)
      const bottomInset = parseFloat(getComputedStyle(sheet).bottom) || 0
      const max = Math.min(
        window.innerHeight * 0.85,
        window.innerHeight - bottomInset - (mobileTop ?? 0) - 12,
      )
      const full = Math.min(natural, max)
      let peek = full
      if (foldEl) {
        // 접힘 경계 요소가 아래 여백(pb-4)을 스스로 갖는다. 홈 표시줄이 있는 기기만 그 높이를 더한다
        const foldBottom =
          handle.offsetHeight +
          padTop +
          (foldEl.getBoundingClientRect().bottom - content.getBoundingClientRect().top)
        peek = Math.min(full, Math.ceil(foldBottom + Math.max(0, padBottom - 16)))
      }
      const next = { peek, full }
      const prev = heightsRef.current
      if (prev?.peek === next.peek && prev.full === next.full) return
      heightsRef.current = next
      setHeights(next)
      height.jump(expandedRef.current ? full : peek)
      onCoverChange(peek + bottomInset)
    }
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(content)
    if (foldEl) observer.observe(foldEl)
    // 웹 글꼴이 늦게 오면 글줄 높이가 바뀐다. 글꼴이 준비된 뒤 한 번 더 잰다
    let alive = true
    void document.fonts?.ready.then(() => {
      if (alive) measure()
    })
    window.addEventListener('resize', measure)
    return () => {
      alive = false
      observer.disconnect()
      window.removeEventListener('resize', measure)
    }
  }, [foldEl, mobileTop, onCoverChange, height])

  const canExpand = heights !== null && heights.full - heights.peek >= MIN_RANGE_PX
  const toggle = () => {
    if (dragged.current) {
      dragged.current = false
      return
    }
    moveTo(!expandedRef.current)
  }

  return (
    <LazyMotion features={domMax}>
      <m.div
        ref={sheetRef}
        data-room-sheet=""
        className="glass fixed inset-x-2 bottom-2 z-20 mx-auto flex max-w-sheet flex-col overflow-hidden rounded-sheet"
        style={heights === null ? undefined : { height }}
        onFocusCapture={(event) => {
          // 접힘 경계보다 뒤에 있는 요소에 포커스가 가면 펼친다(포커스가 잘린 내용을 먼저 스크롤하므로 위치로 보지 않는다)
          if (expandedRef.current || !canExpand || !foldEl) return
          const after =
            foldEl.compareDocumentPosition(event.target) & Node.DOCUMENT_POSITION_FOLLOWING
          if (after && !foldEl.contains(event.target)) moveTo(true)
        }}
      >
        <div ref={handleRef} className="shrink-0">
          {canExpand ? (
            <m.button
              type="button"
              aria-expanded={expanded}
              aria-label={expanded ? '빈자리 흐름 접기' : '빈자리 흐름 펼치기'}
              onClick={toggle}
              onPanStart={() => {
                dragged.current = true
                panStart.current = height.get()
              }}
              onPan={(_event, info) => {
                const h = heightsRef.current
                if (!h) return
                const next = panStart.current - info.offset.y
                height.set(Math.min(h.full, Math.max(h.peek, next)))
              }}
              onPanEnd={(_event, info) => {
                const h = heightsRef.current
                if (!h) return
                const v = info.velocity.y
                const open =
                  v < -FLING_PX_S
                    ? true
                    : v > FLING_PX_S
                      ? false
                      : height.get() > (h.peek + h.full) / 2
                moveTo(open)
                // 놓은 직후 오는 click 은 끌기의 끝이다. 다음 틱에 풀어 둔다
                setTimeout(() => {
                  dragged.current = false
                }, 0)
              }}
              className="flex h-tap w-full touch-none items-center justify-center rounded-t-sheet focus-visible:outline-2 focus-visible:-outline-offset-4 focus-visible:outline-accent"
            >
              <span aria-hidden="true" className="h-1 w-10 rounded-full bg-line-strong/50" />
            </m.button>
          ) : (
            <div aria-hidden="true" className="h-5" />
          )}
        </div>
        <div
          ref={bodyRef}
          className={`min-h-0 flex-1 overscroll-contain px-5 pb-safe ${expanded ? 'overflow-y-auto' : 'overflow-hidden'}`}
        >
          <div ref={contentRef}>
            {children({
              mark: foldRef,
              hint: (
                <p
                  className={`mt-1 pb-4 text-label text-ink-soft ${expanded || !canExpand ? 'invisible' : ''}`.trim()}
                >
                  위로 끌어 올리면 시간대별 흐름이 보여요.
                </p>
              ),
            })}
          </div>
        </div>
      </m.div>
    </LazyMotion>
  )
}
