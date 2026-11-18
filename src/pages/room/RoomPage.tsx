import { useState } from 'react'
import { useParams } from 'react-router'
import { getRoomSummary } from '@/entities/room'
import { useRoomLive } from '@/features/room-live'
import { useElapsed } from '@/shared/lib'
import { getRoomScreenState } from './lib/screenState'
import { EdgeOfflineBanner } from './ui/EdgeOfflineBanner'
import { Legend } from './ui/Legend'
import { RoomError } from './ui/RoomError'
import { RoomLoading } from './ui/RoomLoading'
import { RoomNotFound } from './ui/RoomNotFound'
import { RoomSummary } from './ui/RoomSummary'
import { SeatMap } from './ui/SeatMap'
import { TopBar } from './ui/TopBar'

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
        {!data.edgeOnline && <EdgeOfflineBanner />}
        <h1 className="mt-6 text-title font-black tracking-tight">{data.roomName}</h1>
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
            <SeatMap seats={data.seats} onOutletsHiddenChange={setOutletsHidden} />
          )}
        </div>
        <Legend outletsHidden={outletsHidden} />
      </main>
    </>
  )
}
