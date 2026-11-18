import { getLoadingStage } from '@/shared/lib'

const NOTICE = {
  waking: '서버를 깨우는 중이에요. 처음 열면 1분쯤 걸릴 수 있어요.',
  slow: '생각보다 오래 걸려요. 조금만 더 기다려 주세요.',
} as const

const OFFLINE = '인터넷에 연결되어 있지 않아요. 연결되면 바로 불러올게요.'

export function LoadingStatus({
  elapsedMs,
  paused = false,
}: {
  elapsedMs: number
  paused?: boolean
}) {
  const stage = getLoadingStage(elapsedMs)
  return (
    <p role="status" className="font-bold">
      {paused ? OFFLINE : stage === 'initial' ? '' : NOTICE[stage]}
    </p>
  )
}
