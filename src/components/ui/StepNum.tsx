export interface StepNumProps {
  n: number
}

export default function StepNum({ n }: StepNumProps) {
  return (
    <span className="grid size-6 shrink-0 place-items-center rounded-full bg-primary text-xs font-medium text-white">
      {n}
    </span>
  )
}
