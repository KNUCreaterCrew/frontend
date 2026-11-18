import { Link } from 'react-router'

export function RoomNotFound({ roomId }: { roomId: string }) {
  return (
    <main className="mt-6">
      <h1 className="text-title font-black tracking-tight">이 방을 찾을 수 없어요</h1>
      <p className="mt-2">
        {`${roomId} 방은 등록되어 있지 않아요. QR이 바뀌었을 수 있으니 방 목록에서 골라 주세요.`}
      </p>
      <Link
        to="/"
        className="mt-6 inline-flex min-h-tap items-center font-bold underline underline-offset-4 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-ink"
      >
        방 목록으로
      </Link>
    </main>
  )
}
