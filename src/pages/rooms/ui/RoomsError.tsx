import { ApiError } from '@/shared/api'
import { Button } from '@/shared/ui'

type Props = { error: unknown; onRetry: () => void }

export function RoomsError({ error, onRetry }: Props) {
  const network = error instanceof ApiError && error.kind === 'network'
  return (
    <main className="mt-6">
      <h1 className="text-title font-black tracking-tight">방 목록을 불러오지 못했어요.</h1>
      <p className="mt-2">
        {network ? '인터넷 연결을 확인해 주세요.' : '잠시 뒤 다시 시도해 주세요.'}
      </p>
      <div className="mt-6">
        <Button variant="primary" onClick={onRetry}>
          다시 시도
        </Button>
      </div>
    </main>
  )
}
