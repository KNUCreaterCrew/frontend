import { UnlinkIcon } from '@/shared/ui'

// 요약 유리 맨 위 한 줄. 빨강은 "방금 바뀜"과 이 안내 두 곳에만 쓴다
export function EdgeOfflineBanner() {
  return (
    <section className="mb-3 flex gap-3 border-b border-line pb-3 text-ink area-alert">
      <UnlinkIcon className="mt-px size-5 shrink-0 text-live" />
      <div>
        <h2 className="text-alert font-bold text-live">장치 연결이 끊겼어요</h2>
        <p className="mt-px text-body">지금은 이 방 자리를 확인할 수 없어요.</p>
      </div>
    </section>
  )
}
