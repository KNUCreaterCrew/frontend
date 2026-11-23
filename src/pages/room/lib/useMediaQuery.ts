import { useSyncExternalStore } from 'react'

/** PC 사이드 패널 구조가 되는 폭(tokens.css 의 --breakpoint-lg, 64rem) */
export const DESKTOP_QUERY = '(min-width: 64rem)'

// matchMedia 가 없는 환경(테스트의 jsdom 등)에서는 휴대폰 구조로 본다
export function useMediaQuery(query: string): boolean {
  return useSyncExternalStore(
    (onChange) => {
      if (typeof window.matchMedia !== 'function') return () => {}
      const list = window.matchMedia(query)
      list.addEventListener('change', onChange)
      return () => list.removeEventListener('change', onChange)
    },
    () => typeof window.matchMedia === 'function' && window.matchMedia(query).matches,
    () => false,
  )
}
