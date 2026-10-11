import { type ReactNode } from 'react'

export interface EyebrowProps {
  children: ReactNode
  className?: string
}

export default function Eyebrow({ children, className = '' }: EyebrowProps) {
  return (
    <p className={`text-[11px] font-medium uppercase tracking-[0.18em] text-brown ${className}`}>
      {children}
    </p>
  )
}

