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

/** 짐 있음. 손잡이 달린 가방 */
export function BagIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 16 16" aria-hidden="true" focusable="false" {...props}>
      <path d="M3.5 6h9l-.7 7.5H4.2L3.5 6Z" {...STROKE} />
      <path d="M6 6V4.8a2 2 0 0 1 4 0V6" {...STROKE} />
    </svg>
  )
}

/** 확인 불가. 물음표 */
export function QuestionIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 16 16" aria-hidden="true" focusable="false" {...props}>
      <path d="M5.8 5.8a2.3 2.3 0 1 1 3.3 2.1c-.7.3-1.1.9-1.1 1.6v.3" {...STROKE} />
      <path d="M8 12.4h.01" {...STROKE} strokeWidth={2.4} />
    </svg>
  )
}
