import { Button } from '@/shared/ui'

interface MapZoomToggleProps {
  zoomed: boolean
  onToggle: () => void
}

export function MapZoomToggle({ zoomed, onToggle }: MapZoomToggleProps) {
  return (
    <>
      {zoomed && <p className="mt-2 text-label">옆으로 밀면 나머지 좌석이 보여요</p>}
      <Button variant="plain" className="mt-2 w-full" onClick={onToggle}>
        {zoomed ? '전체 보기' : '확대'}
      </Button>
    </>
  )
}
