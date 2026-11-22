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
export function timeParts(
  iso: string | null,
  now: number,
): { relative: string; time: string } | null {
  if (iso === null) return null
  return { relative: formatRelative(iso, now), time: formatKstTime(iso) }
}

export const lastObservedParts = timeParts

// 갱신이 멈췄을 때 보일 문구. 실패가 우선이고, 1분 이상 지나면 오래됐다고 알린다.
export function freshnessWarning(
  updatedAt: number | null,
  refreshFailed: boolean,
  now: number,
): string | null {
  if (refreshFailed) {
    return updatedAt === null
      ? '갱신하지 못했어요'
      : `갱신하지 못했어요, ${formatRelative(updatedAt, now)} 정보`
  }
  if (updatedAt !== null && now - updatedAt >= 60_000) return '1분 넘게 갱신되지 않았어요'
  return null
}

export type KstWeekday = 'MON' | 'TUE' | 'WED' | 'THU' | 'FRI' | 'SAT' | 'SUN'

export interface KstClock {
  date: string
  weekday: KstWeekday
  hour: number
  minuteOfDay: number
}

const kstClockFormat = new Intl.DateTimeFormat('en-CA', {
  timeZone: 'Asia/Seoul',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  weekday: 'short',
  hourCycle: 'h23',
})

const weekdayByShort: Record<string, KstWeekday> = {
  Mon: 'MON',
  Tue: 'TUE',
  Wed: 'WED',
  Thu: 'THU',
  Fri: 'FRI',
  Sat: 'SAT',
  Sun: 'SUN',
}

// 서버 시각이 아니라 브라우저 시계로 KST 날짜, 요일, 시를 구한다.
export function kstClock(nowMs: number): KstClock {
  const parts: Record<string, string> = {}
  for (const part of kstClockFormat.formatToParts(new Date(nowMs))) parts[part.type] = part.value
  const hour = Number(parts.hour) % 24
  const minute = Number(parts.minute)
  return {
    date: `${parts.year}-${parts.month}-${parts.day}`,
    weekday: weekdayByShort[parts.weekday ?? ''] ?? 'MON',
    hour,
    minuteOfDay: hour * 60 + minute,
  }
}

export function formatKstHour(hour: number): string {
  return `${hour}시`
}
