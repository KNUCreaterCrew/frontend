import { ApiError } from '@/shared/api'
import { Button } from '@/shared/ui'

type Props = { roomId: string; error: unknown; onRetry: () => void }

export function RoomError({ roomId, error, onRetry }: Props) {
  const network = error instanceof ApiError && error.kind === 'network'
  return (
    <main className="mt-6">
      <h1 className="text-title font-bold tracking-tight">방 정보를 불러오지 못했어요</h1>
      <p className="mt-2">
        {network ? '인터넷 연결을 확인해 주세요.' : '잠시 뒤 다시 시도해 주세요.'}
      </p>
      <p className="mt-2 num text-label">{`방 ID: ${roomId}`}</p>
      <div className="mt-6">
        <Button variant="primary" onClick={onRetry}>
          다시 시도
        </Button>
      </div>
    </main>
  )
}
