export interface RadioProps {
  on: boolean
}

export default function Radio({ on }: RadioProps) {
  return (
    <span
      aria-hidden="true"
      className={`grid size-4 shrink-0 place-items-center rounded-full border ${
        on ? 'border-brown' : 'border-line-strong bg-white'
      }`}
    >
      {on && <span className="size-2 rounded-full bg-brown" />}
    </span>
  )
}

