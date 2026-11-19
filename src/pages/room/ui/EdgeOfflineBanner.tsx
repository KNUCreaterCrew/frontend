import { UnlinkIcon } from '@/shared/ui'

export function EdgeOfflineBanner() {
  return (
    <section className="flex gap-3 rounded-panel bg-live-tint p-4 text-ink">
      <UnlinkIcon className="mt-px size-5 shrink-0 text-live" />
      <div>
        <h2 className="text-alert font-bold text-live">장치 연결이 끊겼어요</h2>
        <p className="mt-1">지금은 이 방 자리를 확인할 수 없어요.</p>
      </div>
    </section>
  )
}
