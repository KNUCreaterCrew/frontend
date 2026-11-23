import { useEffect, useRef } from 'react'
import type { StageLayout } from '../../lib/stageLayout'
import { createSeatScene, type SeatScene } from './seatScene'

type Props = { layout: StageLayout; onFail: () => void }

/** three.js 무대. 따로 늦게 불러오는 묶음이다(RoomStage 의 lazy). 장식이라 화면 읽기 도구에는 숨긴다 */
export default function SeatStageCanvas({ layout, onFail }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const sceneRef = useRef<SeatScene | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    let scene: SeatScene
    try {
      scene = createSeatScene(canvas, { onContextLost: onFail })
    } catch {
      onFail()
      return
    }
    sceneRef.current = scene
    return () => {
      sceneRef.current = null
      scene.dispose()
    }
  }, [onFail])

  // 위 효과가 먼저 돌아 장면이 있다(효과는 적힌 순서대로 돈다)
  useEffect(() => {
    sceneRef.current?.setLayout(layout)
  }, [layout])

  return <canvas ref={canvasRef} aria-hidden="true" className="block size-full" />
}
