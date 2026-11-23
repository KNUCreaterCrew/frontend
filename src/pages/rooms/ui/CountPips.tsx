// 방 타일의 개수 점. 좌석 배치가 아니라 개수다: 범례와 같은 순서로 빈자리, 쓰는 중(사용 중과 짐 있음을
// 목록 응답이 나누지 않아 합친 것), 확인 불가.
// 숫자가 이미 같은 것을 말하므로 화면 읽기 도구에는 숨긴다. 좌석이 많으면 같은 순서의 비율 막대로 바꾼다
const MAX_PIPS = 48

export function CountPips({
  available,
  unknown,
  total,
}: {
  available: number
  unknown: number
  total: number
}) {
  const taken = Math.max(total - available - unknown, 0)
  if (total > MAX_PIPS) {
    const pct = (n: number) => `${(n / total) * 100}%`
    return (
      <span aria-hidden="true" className="mt-2 flex h-2 gap-px overflow-hidden rounded-full">
        {available > 0 && (
          <span className="rounded-full pip-empty" style={{ width: pct(available) }} />
        )}
        {taken > 0 && <span className="rounded-full pip-taken" style={{ width: pct(taken) }} />}
        {unknown > 0 && (
          <span className="rounded-full pip-unknown" style={{ width: pct(unknown) }} />
        )}
      </span>
    )
  }
  const pips = [
    ...Array<string>(available).fill('pip-empty'),
    ...Array<string>(taken).fill('pip-taken'),
    ...Array<string>(unknown).fill('pip-unknown'),
  ]
  return (
    <span aria-hidden="true" className="mt-2 flex flex-wrap gap-1">
      {pips.map((tone, i) => (
        <span key={i} data-pip={tone} className={`size-2 rounded-chip ${tone}`} />
      ))}
    </span>
  )
}
