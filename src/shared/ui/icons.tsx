import type { SVGProps } from 'react'

// 선 아이콘은 모두 한 굵기(1.8)로 직접 그린다. 장식이라 화면 읽기 도구에는 숨긴다.
const STROKE = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.8,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
} as const

export function ChevronLeftIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 16 16" aria-hidden="true" focusable="false" {...props}>
      <path d="M10 3 5 8l5 5" {...STROKE} />
    </svg>
  )
}

export function ChevronRightIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 16 16" aria-hidden="true" focusable="false" {...props}>
      <path d="m6 3 5 5-5 5" {...STROKE} />
    </svg>
  )
}

/** 연결이 끊긴 장치. 끊어진 고리 두 개 */
export function UnlinkIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 20 20" aria-hidden="true" focusable="false" {...props}>
      <path
        d="M8.5 5.5 10 4a3.5 3.5 0 0 1 5 5l-1.5 1.5M11.5 14.5 10 16a3.5 3.5 0 0 1-5-5l1.5-1.5M3 3l2 2M17 17l-2-2"
        {...STROKE}
      />
    </svg>
  )
}
