import { Link } from 'react-router'

export function RoomNotFound({ roomId }: { roomId: string }) {
  return (
    <main className="page flex min-h-dvh items-center justify-center">
      <section className="glass relative w-full max-w-sheet rounded-glass p-6">
        <h1 className="text-title font-bold tracking-tight">이 방을 찾을 수 없어요</h1>
        <p className="mt-2">
          {`${roomId} 방은 등록되어 있지 않아요. QR이 바뀌었을 수 있으니 방 목록에서 골라 주세요.`}
        </p>
        <Link
          to="/"
          className="mt-6 flex h-12 w-full items-center justify-center rounded-full bg-ink font-semibold text-on-ink transition hover:bg-ink/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent active:scale-98"
        >
          방 목록으로
        </Link>
      </section>
    </main>
  )
}
