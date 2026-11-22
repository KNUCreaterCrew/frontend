import type { StatsDataSource } from '@/entities/room'

export function usualSourceSentence(source: StatsDataSource): string | null {
  switch (source) {
    case 'SEED':
      return '평소 값은 최근 4주 예시 데이터예요.'
    case 'MIXED':
      return '평소 값에는 예시 데이터가 섞여 있어요.'
    case 'UNRECOGNIZED':
      return '평소 값의 출처를 알 수 없어요.'
    default:
      return null
  }
}
