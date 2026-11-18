import { Suspense, lazy, useCallback, useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router'
import { getRoomSummary } from '@/entities/room'
import type { Seat } from '@/entities/room'
import { useRoomLive } from '@/features/room-live'
import { freshnessWarning, useElapsed, useNow } from '@/shared/lib'
import { getRoomScreenState } from './lib/screenState'
import { EdgeOfflineBanner } from './ui/EdgeOfflineBanner'
import { Legend } from './ui/Legend'
import { RoomError } from './ui/RoomError'
import { RoomLoading } from './ui/RoomLoading'
import { RoomNotFound } from './ui/RoomNotFound'
import { SheetErrorBoundary } from './ui/SheetErrorBoundary'
import { RoomSummary } from './ui/RoomSummary'
import { SeatMap } from './ui/SeatMap'
import { TopBar } from './ui/TopBar'

// 시트 코드는 좌석을 처음 누를 때까지 필요 없으니 따로 받는다. 방이 준비되면 미리 받아 둔다.
const loadSeatDetail = () => import('@/features/seat-detail')
const makeSeatSheet = () => lazy(() => loadSeatDetail().then((m) => ({ default: m.SeatSheet })))
type SeatSheetComponent = ReturnType<typeof makeSeatSheet>

const SHEET_FAILED = '좌석 정보를 불러오지 못했어요. 다시 눌러 주세요.'

const SEAT_PARAM = 'seat'

interface SheetSlotProps {
  seat: Seat | null
  dataUpdatedAt: number
  refreshFailed: boolean
  edgeNotice: string | null
  onClose: () => void
  onCloseAutoFocus: (event: Event) => void
  Sheet: SeatSheetComponent
  onLoadFailed: () => void
}

// 1초마다 다시 그리는 시계는 여기서만 쓴다(방 화면 전체가 매초 다시 그려지지 않게)
function SheetSlot({ dataUpdatedAt, refreshFailed, Sheet, onLoadFailed, ...rest }: SheetSlotProps) {
  const now = useNow(1000)
  return (
    <SheetErrorBoundary onError={onLoadFailed}>
      <Suspense fallback={null}>
        <Sheet staleNotice={freshnessWarning(dataUpdatedAt, refreshFailed, now)} {...rest} />
      </Suspense>
    </SheetErrorBoundary>
  )
}

export function RoomPage() {
  const { roomId = '' } = useParams()
  const [attempt, setAttempt] = useState(0)
  const [outletsHidden, setOutletsHidden] = useState(false)
  const live = useRoomLive(roomId)
  const { data, status, fetchStatus, error, failureReason, dataUpdatedAt } = live.query
  const elapsedMs = useElapsed(status === 'pending' && fetchStatus !== 'paused', attempt)
  const state = getRoomScreenState({
    status,
    hasData: data !== undefined,
    error,
    elapsedMs,
    fetchStatus,
  })

  const navigate = useNavigate()
  const location = useLocation()
  const searchRef = useRef(location.search)
  useEffect(() => {
    searchRef.current = location.search
  }, [location.search])
  const seatParam = new URLSearchParams(location.search).get(SEAT_PARAM)
  const seat = (seatParam !== null && data?.seats.find((s) => s.seatId === seatParam)) || null
  const openedSeatId = useRef<string | null>(null)
  const shownLabels = useRef(new Map<string, string>())
  const focusHeading = useRef(false)
  const headingRef = useRef<HTMLHeadingElement>(null)
  const [goneNotice, setGoneNotice] = useState<string | null>(null)
  // 시트가 떠 있는 동안 Radix 가 화면 나머지를 가리므로, 알림은 닫힌 뒤 포커스가 돌아올 때 쓴다
  const pendingGone = useRef<string | null>(null)
  const closing = useRef(false)
  // 받기 실패 뒤 다시 누르면 새 lazy 와 새 경계로 처음부터 다시 받는다
  const [sheet, setSheet] = useState(() => ({ gen: 0, Sheet: makeSeatSheet() }))
  const [loadFailed, setLoadFailed] = useState(false)
  const [sheetUsed, setSheetUsed] = useState(false)
  if (seat !== null && !sheetUsed) setSheetUsed(true)
  const ready = data !== undefined

  useEffect(() => {
    if (ready) loadSeatDetail().catch(() => {})
  }, [ready])

  // 주소가 바뀌면 닫기 요청이 처리된 것이다
  useEffect(() => {
    closing.current = false
  }, [location.key])

  useEffect(() => {
    if (seat === null) return
    openedSeatId.current = seat.seatId
    shownLabels.current.set(seat.seatId, seat.label)
    focusHeading.current = false
  }, [seat])

  // 열린 좌석이 데이터에서 사라졌거나 처음부터 없는 ID 면 param 을 지운다
  useEffect(() => {
    if (!ready || seatParam === null || seat !== null) return
    const label = shownLabels.current.get(seatParam)
    if (label !== undefined) {
      focusHeading.current = true
      pendingGone.current = `${label} 좌석 정보가 없어져 닫았어요`
      // 눌러서 연 시트면 열기 전 기록으로 돌아가 죽은 항목을 남기지 않는다
      if ((location.state as { seatSheet?: boolean } | null)?.seatSheet) {
        if (!closing.current) {
          closing.current = true
          void navigate(-1)
        }
        return
      }
    }
    const params = new URLSearchParams(searchRef.current)
    params.delete(SEAT_PARAM)
    const search = params.toString()
    void navigate({ search: search ? `?${search}` : '' }, { replace: true })
  }, [ready, seatParam, seat, navigate, location.state])

  const openSeat = useCallback(
    (seatId: string) => {
      const params = new URLSearchParams(searchRef.current)
      params.set(SEAT_PARAM, seatId)
      setGoneNotice(null)
      pendingGone.current = null
      if (loadFailed) setSheet((prev) => ({ gen: prev.gen + 1, Sheet: makeSeatSheet() }))
      setLoadFailed(false)
      closing.current = false
      void navigate({ search: `?${params.toString()}` }, { state: { seatSheet: true } })
    },
    [navigate, loadFailed],
  )

  const closeSheet = () => {
    if (closing.current) return
    closing.current = true
    if ((location.state as { seatSheet?: boolean } | null)?.seatSheet) {
      void navigate(-1)
      return
    }
    const params = new URLSearchParams(location.search)
    params.delete(SEAT_PARAM)
    const search = params.toString()
    void navigate({ search: search ? `?${search}` : '' }, { replace: true })
  }

  const returnFocus = (event: Event) => {
    event.preventDefault()
    if (pendingGone.current !== null) {
      setGoneNotice(pendingGone.current)
      pendingGone.current = null
    }
    if (focusHeading.current) {
      headingRef.current?.focus()
      return
    }
    const button = Array.from(document.querySelectorAll<HTMLElement>('[data-seat-id]')).find(
      (el) => el.dataset.seatId === openedSeatId.current,
    )
    button?.focus()
    button?.scrollIntoView?.({ block: 'nearest' })
  }

  // 시트 코드를 받지 못했으면 좌석 param 을 지우고 좌석으로 돌아가 다시 누르게 한다
  const sheetLoadFailed = () => {
    setLoadFailed(true)
    closing.current = false
    const params = new URLSearchParams(searchRef.current)
    params.delete(SEAT_PARAM)
    const search = params.toString()
    void navigate({ search: search ? `?${search}` : '' }, { replace: true })
    const button = Array.from(document.querySelectorAll<HTMLElement>('[data-seat-id]')).find(
      (el) => el.dataset.seatId === openedSeatId.current,
    )
    button?.focus()
  }

  const retry = () => {
    setAttempt((n) => n + 1)
    live.restart()
  }

  if (state === 'notFound') {
    return <RoomNotFound roomId={roomId} />
  }
  if (state === 'error') {
    return (
      <>
        <TopBar updatedAt={null} />
        <RoomError roomId={roomId} error={error ?? failureReason} onRetry={retry} />
      </>
    )
  }
  if (state === 'loading' || !data) {
    return (
      <>
        <TopBar updatedAt={null} />
        <RoomLoading elapsedMs={elapsedMs} paused={fetchStatus === 'paused'} />
      </>
    )
  }

  const summary = getRoomSummary(data)
  return (
    <>
      <TopBar updatedAt={dataUpdatedAt} refreshFailed={state === 'refreshFailed'} />
      <main>
        <div aria-live="polite" aria-atomic="true" className="sr-only">
          {live.edgeNotice}
        </div>
        <div aria-live="polite" aria-atomic="true" className="sr-only">
          {goneNotice ?? (loadFailed ? SHEET_FAILED : null)}
        </div>
        {!data.edgeOnline && <EdgeOfflineBanner />}
        <h1
          ref={headingRef}
          tabIndex={-1}
          className="mt-6 text-title font-black tracking-tight focus:outline-hidden"
        >
          {data.roomName}
        </h1>
        <RoomSummary summary={summary} />
        {summary.kind === 'allUnknown' && data.edgeOnline && (
          <p className="mt-4 text-body">
            지금은 모든 자리를 확인할 수 없어요. 만석이라는 뜻은 아니에요.
          </p>
        )}
        <div className="mt-6">
          {summary.kind === 'noSeats' ? (
            <p className="border-t-6 border-ink py-6">이 방에는 등록된 좌석이 없어요.</p>
          ) : (
            <SeatMap
              seats={data.seats}
              highlights={live.highlights}
              onOutletsHiddenChange={setOutletsHidden}
              onSelect={openSeat}
              selectedSeatId={seat?.seatId ?? null}
            />
          )}
        </div>
        {loadFailed && <p className="mt-4 text-body text-ink">{SHEET_FAILED}</p>}
        <Legend outletsHidden={outletsHidden} />
      </main>
      {sheetUsed && (
        <SheetSlot
          seat={seat}
          dataUpdatedAt={dataUpdatedAt}
          refreshFailed={state === 'refreshFailed'}
          edgeNotice={live.edgeNotice}
          onClose={closeSheet}
          onCloseAutoFocus={returnFocus}
          key={sheet.gen}
          Sheet={sheet.Sheet}
          onLoadFailed={sheetLoadFailed}
        />
      )}
    </>
  )
}
