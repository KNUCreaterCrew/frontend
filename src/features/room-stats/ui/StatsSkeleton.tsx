// 판 안에서 문장 한 줄과 그래프 자리만 잡는다
export function StatsSkeleton() {
  return (
    <div aria-hidden="true" className="motion-safe:animate-pulse">
      <div className="mt-2 h-4 w-2/3 bg-line" />
      <div className="mt-6 mb-6 ml-8 aspect-2/1 bg-line" />
    </div>
  )
}
