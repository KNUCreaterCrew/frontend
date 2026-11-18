// 백엔드 주소를 바꿀 때는 이 파일만 고친다(#7).
export function httpUrl(path: string): URL {
  return new URL(path, location.origin)
}

export function wsUrlFrom(origin: string, path: string): string {
  const url = new URL(path, origin)
  url.protocol = url.protocol === 'https:' ? 'wss:' : 'ws:'
  return url.href
}

export function wsUrl(path: string): string {
  return wsUrlFrom(location.origin, path)
}
