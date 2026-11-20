import { type HTMLAttributes, type ReactNode } from 'react'

export interface ContainerProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
}

export default function Container({ children, className = '', ...rest }: ContainerProps) {
  return (
    <div className={`mx-auto w-full max-w-[1300px] px-5 sm:px-8 lg:px-12 ${className}`} {...rest}>
      {children}
    </div>
  )
}

