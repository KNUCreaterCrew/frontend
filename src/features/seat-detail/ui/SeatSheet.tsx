import { useRef, useState } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import {
  AnimatePresence,
  LazyMotion,
  MotionConfig,
  animate,
  domMax,
  m,
  useDragControls,
  useMotionValue,
  useReducedMotion,
  useTransform,
} from 'motion/react'
import type { Seat } from '@/entities/room'
import { Button } from '@/shared/ui'
import { useNow } from '@/shared/lib'
import { shouldClose } from '../model/drag'
import { seatChangeNotice, sheetContent } from '../model/sheetContent'
import type { SheetBand } from '../model/sheetContent'

export interface SeatSheetProps {
  seat: Seat | null
  staleNotice: string | null
  edgeNotice: string | null
  onClose: () => void
  onCloseAutoFocus: (event: Event) => void
}

const SHEET_SECONDS = 0.24
const EASE = [0.16, 1, 0.3, 1] as const
const TRANSITION = { duration: SHEET_SECONDS, ease: EASE }

const BAND_CLASS: Record<SheetBand, string> = {
  empty: 'bg-empty',
  ink: 'bg-ink',
  hatched: 'pattern-unknown',
}

export function SeatSheet({ seat, ...rest }: SeatSheetProps) {
  // 닫히는 동안에는 마지막 좌석을 계속 그린다.
  const [lastSeat, setLastSeat] = useState(seat)
  if (seat !== null && seat !== lastSeat) setLastSeat(seat)
  const open = seat !== null

  return (
    <Dialog.Root
      open={open}
      onOpenChange={(next) => {
        if (!next) rest.onClose()
      }}
    >
      <LazyMotion features={domMax}>
        <MotionConfig reducedMotion="user">
          <AnimatePresence>
            {open && lastSeat !== null && <SheetLayers key="sheet" seat={lastSeat} {...rest} />}
          </AnimatePresence>
        </MotionConfig>
      </LazyMotion>
    </Dialog.Root>
  )
}

interface Tracked {
  seat: Seat
  edge: string | null
  notice: string | null
}

function SheetLayers({
  seat,
  staleNotice,
  edgeNotice,
  onClose,
  onCloseAutoFocus,
}: Omit<SeatSheetProps, 'seat'> & { seat: Seat }) {
  const now = useNow(1000)
  const content = sheetContent(seat, now)

  // 열린 동안 직전 좌석과 비교한 변화, 또는 새 장치 알림 중 가장 최근 것을 읽는다.
  const [tracked, setTracked] = useState<Tracked>({ seat, edge: edgeNotice, notice: null })
  if (tracked.seat !== seat || tracked.edge !== edgeNotice) {
    let notice = tracked.notice
    const sameSeat = tracked.seat.seatId === seat.seatId
    const seatNotice =
      sameSeat && tracked.seat !== seat ? seatChangeNotice(tracked.seat, seat) : null
    const newEdge = edgeNotice !== null && edgeNotice !== tracked.edge ? edgeNotice : null
    if (!sameSeat) notice = newEdge
    else if (seatNotice !== null && newEdge !== null) notice = `${seatNotice}, ${newEdge}`
    else notice = seatNotice ?? newEdge ?? notice
    setTracked({ seat, edge: edgeNotice, notice })
  }

  const reduceMotion = useReducedMotion()
  const dragY = useMotionValue(0)
  const scrimOpacity = useTransform(dragY, [0, 320], [1, 0.2])
  const dragControls = useDragControls()
  const sheetRef = useRef<HTMLDivElement>(null)
  const startDrag = (event: React.PointerEvent) => dragControls.start(event)

  return (
    <Dialog.Portal forceMount>
      <Dialog.Overlay asChild forceMount>
        <m.div
          className="fixed inset-0 z-30"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={reduceMotion ? { duration: 0 } : TRANSITION}
        >
          <m.div className="absolute inset-0 bg-scrim" style={{ opacity: scrimOpacity }} />
        </m.div>
      </Dialog.Overlay>
      <Dialog.Content
        asChild
        forceMount
        aria-describedby={undefined}
        onCloseAutoFocus={onCloseAutoFocus}
      >
        <m.div
          className="fixed inset-x-0 bottom-0 z-40 mx-auto flex max-h-sheet w-full flex-col bg-surface md:max-w-sheet"
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={TRANSITION}
        >
          <m.div
            ref={sheetRef}
            className="flex min-h-0 flex-1 flex-col"
            style={{ y: dragY }}
            drag="y"
            dragListener={false}
            dragControls={dragControls}
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0, bottom: 1 }}
            onDragEnd={(_event, info) => {
              const height = sheetRef.current?.offsetHeight ?? 0
              if (shouldClose({ offsetY: info.offset.y, velocityY: info.velocity.y, height })) {
                onClose()
              } else {
                if (reduceMotion) dragY.jump(0)
                else void animate(dragY, 0, TRANSITION)
              }
            }}
          >
            <div
              aria-hidden="true"
              className={`h-1.5 w-full shrink-0 ${BAND_CLASS[content.band]}`}
            />
            <div className="touch-none px-4" onPointerDown={startDrag}>
              <div className="py-3">
                <div aria-hidden="true" className="mx-auto h-1 w-8 bg-ink" />
              </div>
              <Dialog.Title className="text-sheet font-black tracking-tight">
                <span className="font-num text-ink tabular-nums">{content.seatLabel}</span>{' '}
                <span className={content.statusTone === 'empty' ? 'text-empty' : 'text-ink'}>
                  {content.statusLabel}
                </span>
              </Dialog.Title>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-safe">
              {content.reason !== null && (
                <p className="mt-2 text-body text-ink">{content.reason}</p>
              )}
              <dl className="mt-4 border-t-2 border-ink">
                {content.rows.map((row) => (
                  <div
                    key={row.key}
                    className="flex items-baseline justify-between gap-4 border-b border-ink py-3"
                  >
                    <dt className="text-body text-ink-soft">{row.label}</dt>
                    <dd className="text-right text-body font-bold text-ink">{row.value}</dd>
                  </div>
                ))}
              </dl>
              {staleNotice !== null && <p className="mt-3 text-body text-ink">{staleNotice}</p>}
              <Button className="mt-4" onClick={onClose}>
                닫기
              </Button>
            </div>
            <div aria-live="polite" aria-atomic="true" className="sr-only">
              {tracked.notice}
            </div>
          </m.div>
        </m.div>
      </Dialog.Content>
    </Dialog.Portal>
  )
}
