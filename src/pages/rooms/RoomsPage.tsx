import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { roomListQueryOptions } from '@/entities/room'
import { getScreenState, useElapsed } from '@/shared/lib'
import { RoomRow } from './ui/RoomRow'
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
  if (state === 'loading' || !data) {
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
      <main className="pt-6 lg:pt-10">
        <h1 className="text-title font-bold tracking-tight">어느 방으로 갈까요</h1>
        {data.length === 0 ? (
          <p className="mt-4 text-body text-ink-soft">아직 등록된 방이 없어요.</p>
        ) : (
          <ul className="mt-5 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {data.map((room) => (
              <RoomRow key={room.roomId} room={room} />
            ))}
          </ul>
        )}
      </main>
    </>
  )
}
