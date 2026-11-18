import type { ButtonHTMLAttributes } from 'react'

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'plain'
}

const BASE =
  'font-bold focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-ink'

const VARIANTS = {
  primary: 'h-12 w-full bg-ink text-paper',
  plain: 'min-h-tap border-2 border-ink px-4 text-ink',
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
