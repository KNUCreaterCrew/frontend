import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { presentRoomListItem, roomListQueryOptions } from '@/entities/room'
import { getScreenState, useElapsed } from '@/shared/lib'
import { pickStageRoom } from './lib/pickStageRoom'
import { RoomStage } from './ui/RoomStage'
import { RoomTile } from './ui/RoomTile'
import { RoomsError } from './ui/RoomsError'
import { RoomsLoading } from './ui/RoomsLoading'
import { RoomsTopBar } from './ui/RoomsTopBar'

export function RoomsPage() {
  const [attempt, setAttempt] = useState(0)
  const { data, status, fetchStatus, error, failureReason, dataUpdatedAt, refetch } =
    useQuery(roomListQueryOptions())
  const elapsedMs = useElapsed(status === 'pending' && fetchStatus !== 'paused', attempt)
  const state = getScreenState({
    status,
    hasData: data !== undefined,
    error,
    elapsedMs,
    fetchStatus,
  })
  const rooms = useMemo(() => data?.map(presentRoomListItem), [data])
  const pick = useMemo(() => (rooms ? pickStageRoom(rooms) : null), [rooms])

  // 404 도 목록에서는 오류로 다룬다
  if (state === 'error' || state === 'notFound') {
    return (
      <>
        <RoomsTopBar updatedAt={null} />
        <RoomsError
          error={error ?? failureReason}
          onRetry={() => {
            setAttempt((n) => n + 1)
            void refetch()
          }}
        />
      </>
    )
  }
  if (state === 'loading' || !rooms) {
    return (
      <>
        <RoomsTopBar updatedAt={null} />
        <RoomsLoading elapsedMs={elapsedMs} paused={fetchStatus === 'paused'} />
      </>
    )
  }

  return (
    <>
      <RoomsTopBar updatedAt={dataUpdatedAt} refreshFailed={state === 'refreshFailed'} />
      <main>
        {pick && <RoomStage pick={pick} />}
        <div className={`page ${pick ? 'pt-6' : 'pt-below-float'}`}>
          <div className="flex items-baseline justify-between gap-3">
            <h1 className="text-heading font-bold tracking-tight">방을 골라 주세요</h1>
            {rooms.length > 0 && (
              <p className="num text-label text-ink-soft">{`${rooms.length}곳`}</p>
            )}
          </div>
          {rooms.length === 0 ? (
            <p className="mt-4 text-body text-ink-soft">아직 등록된 방이 없어요.</p>
          ) : (
            <ul className="mt-4 grid auto-rows-fr grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
              {rooms.map((room) => (
                <RoomTile key={room.roomId} room={room} />
              ))}
            </ul>
          )}
        </div>
      </main>
    </>
  )
}
