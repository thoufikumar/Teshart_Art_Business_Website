import { type ButtonHTMLAttributes, type ReactNode } from 'react'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode
  variant?: 'primary' | 'secondary'
}

export default function Button({
  children,
  onClick,
  variant = 'primary',
  className = '',
  disabled,
  type = 'button',
  ...rest
}: ButtonProps) {
  const base =
    'inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium transition-colors disabled:cursor-not-allowed'
  const variantClasses =
    variant === 'primary'
      ? 'bg-brown text-white hover:bg-brown-hover active:bg-brown-pressed disabled:bg-disabled'
      : 'border border-line-strong bg-ivory text-ink hover:bg-sand disabled:text-disabled'

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`${base} ${variantClasses} ${className}`}
      {...rest}
    >
      {children}
    </button>
  )
}

