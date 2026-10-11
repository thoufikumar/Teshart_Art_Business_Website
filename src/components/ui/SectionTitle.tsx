import { type ReactNode } from 'react'
import StepNum from './StepNum'

export interface SectionTitleProps {
  n: number
  children: ReactNode
  right?: ReactNode
}

export default function SectionTitle({ n, children, right }: SectionTitleProps) {
  return (
    <div className="mb-4 flex items-center justify-between gap-3">
      <div className="flex items-center gap-3">
        <StepNum n={n} />
        <h2 className="text-[17px] font-medium">{children}</h2>
      </div>
      {right}
    </div>
  )
}

