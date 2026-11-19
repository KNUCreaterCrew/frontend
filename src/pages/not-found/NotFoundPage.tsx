import { Link } from 'react-router'

export function NotFoundPage() {
  return (
    <main>
      <h1 className="text-title font-bold tracking-tight">페이지를 찾을 수 없어요</h1>
      <p className="mt-2">주소가 바뀌었거나 없는 페이지예요.</p>
      <Link
        to="/"
        className="mt-4 inline-flex min-h-tap items-center font-bold text-accent underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
      >
        처음으로
      </Link>
    </main>
  )
}
