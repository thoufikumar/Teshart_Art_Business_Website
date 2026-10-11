import { type HTMLAttributes, type ReactNode } from 'react'

export interface ContainerProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
}

export default function Container({ children, className = '', ...rest }: ContainerProps) {
  return (
    <div className={`mx-auto max-w-[1240px] px-5 md:px-10 ${className}`} {...rest}>
      {children}
    </div>
  )
}

