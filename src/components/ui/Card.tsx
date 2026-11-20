import { type HTMLAttributes, type ReactNode } from "react"

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
}

export default function Card({ children, className = "", ...rest }: CardProps) {
  return (
    <div
      className={`rounded-xl border border-border bg-white shadow-card ${className}`}
      {...rest}
    >
      {children}
    </div>
  )
}
