import type { SVGProps } from 'react'

export function OutletIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 14 14" aria-hidden="true" focusable="false" {...props}>
      <path
        d="M4 1v4M10 1v4M2 5h10v3a5 5 0 0 1-10 0zM7 12v2"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
      />
    </svg>
  )
}
