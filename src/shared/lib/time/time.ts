const kstFormat = new Intl.DateTimeFormat('en-GB', {
  timeZone: 'Asia/Seoul',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  hourCycle: 'h23',
})

export function formatRelative(from: string | number, now: number): string {
  const fromMs = typeof from === 'number' ? from : Date.parse(from)
  const seconds = Math.floor((now - fromMs) / 1000)
  if (seconds < 1) return '방금'
  if (seconds < 60) return `${seconds}초 전`
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}분 전`
  return `${Math.floor(minutes / 60)}시간 전`
}

export function formatKstTime(iso: string): string {
  return kstFormat.format(new Date(iso))
}

// 상대 시각과 KST 절대 시각을 나눠서 준다. null 이면 화면이 "아직 확인하지 못함"을 쓴다.
export function lastObservedParts(
  iso: string | null,
  now: number,
): { relative: string; time: string } | null {
  if (iso === null) return null
  return { relative: formatRelative(iso, now), time: formatKstTime(iso) }
}
