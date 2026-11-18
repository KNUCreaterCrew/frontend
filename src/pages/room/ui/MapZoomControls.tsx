import { Button } from '@/shared/ui'

interface MapZoomControlsProps {
  zoomed: boolean
  onZoomIn: () => void
  onZoomOut: () => void
}

export function MapZoomControls({ zoomed, onZoomIn, onZoomOut }: MapZoomControlsProps) {
  return (
    <div className="mt-2 flex gap-2">
      <Button variant="plain" className="flex-1" disabled={zoomed} onClick={onZoomIn}>
        확대
      </Button>
      <Button variant="plain" className="flex-1" disabled={!zoomed} onClick={onZoomOut}>
        축소
      </Button>
    </div>
  )
}
