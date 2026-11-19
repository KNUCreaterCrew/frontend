import type { ButtonHTMLAttributes } from 'react'

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'plain'
}

const BASE =
  'rounded-control font-semibold transition active:scale-98 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent'

const VARIANTS = {
  primary: 'h-12 w-full bg-ink text-on-ink hover:bg-ink/90',
  plain: 'min-h-tap bg-surface px-4 text-ink shadow-plate hover:bg-paper',
} as const

export function Button({ variant = 'primary', type = 'button', className, ...rest }: ButtonProps) {
  return (
    <button
      type={type}
      className={[BASE, VARIANTS[variant], className].filter(Boolean).join(' ')}
      {...rest}
    />
  )
}
