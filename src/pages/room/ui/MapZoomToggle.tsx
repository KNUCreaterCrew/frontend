interface MapZoomToggleProps {
  zoomed: boolean
  onToggle: () => void
}

// 바닥판 위에 떠 있는 유리 캡슐 하나가 "확대"와 "전체 보기"를 오간다
export function MapZoomToggle({ zoomed, onToggle }: MapZoomToggleProps) {
  return (
    <div className="flex flex-col items-center gap-2 px-3">
      {zoomed && <p className="text-label text-ink-soft">옆으로 밀면 나머지 좌석이 보여요</p>}
      <button
        type="button"
        onClick={onToggle}
        className="glass relative min-h-tap rounded-full px-6 font-semibold text-ink transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent active:scale-98"
      >
        {zoomed ? '전체 보기' : '확대'}
      </button>
    </div>
  )
}
