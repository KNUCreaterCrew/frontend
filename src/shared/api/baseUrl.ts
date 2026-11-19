// 백엔드 주소는 `.env.production` 의 `VITE_API_ORIGIN` 으로 정한다. 값이 없으면(개발 서버, 테스트) 현재 출처를 쓴다.
export function apiOrigin(): string {
  const v = import.meta.env.VITE_API_ORIGIN
  return v ? new URL(v).origin : location.origin
}

export function httpUrl(path: string): URL {
  return new URL(path, apiOrigin())
}

export function wsUrlFrom(origin: string, path: string): string {
  const url = new URL(path, origin)
  url.protocol = url.protocol === 'https:' ? 'wss:' : 'ws:'
  return url.href
}

export function wsUrl(path: string): string {
  return wsUrlFrom(apiOrigin(), path)
}
