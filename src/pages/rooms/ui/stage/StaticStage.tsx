import type { StageLayout, StageTone } from '../../lib/stageLayout'

// 동작 줄이기, WebGL 없음, three.js 를 못 불러왔을 때의 정지 그림. 좌석도처럼 위에서 본 평면이다
const TONE: Record<StageTone, string> = {
  empty: 'stage-empty',
  away: 'stage-away',
  occupied: 'stage-occupied',
  unknown: 'stage-unknown',
}

export function StaticStage({ layout }: { layout: StageLayout }) {
  const pad = 12
  return (
    <svg
      aria-hidden="true"
      className="block size-full"
      viewBox={`${-pad} ${-pad} ${layout.width + pad * 2} ${layout.height + pad * 2}`}
      preserveAspectRatio="xMidYMid meet"
    >
      {layout.seats.map((seat) => (
        <rect
          key={seat.seatId}
          data-tone={seat.tone}
          x={seat.x}
          y={seat.y}
          width={seat.width}
          height={seat.height}
          rx={Math.min(seat.width, seat.height) * 0.18}
          className={TONE[seat.tone]}
        />
      ))}
    </svg>
  )
}
