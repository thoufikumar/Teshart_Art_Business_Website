import { ICON_PATHS } from './Icon'

export interface StarsProps {
  count?: number
}

export default function Stars({ count = 5 }: StarsProps) {
  return (
    <div className="flex gap-0.5 text-[#d9a441]" aria-label={`${count} out of 5 stars`}>
      {Array.from({ length: count }).map((_, i) => (
        <svg key={i} viewBox="0 0 24 24" className="size-3.5 fill-current" aria-hidden="true">
          {ICON_PATHS.star}
        </svg>
      ))}
    </div>
  )
}

