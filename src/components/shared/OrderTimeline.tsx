import { CUSTOMER_TRACKING_MILESTONES } from '../../domain/order'
import Icon from '../ui/Icon'

export interface OrderTimelineProps {
  current: number
}

export default function OrderTimeline({ current }: OrderTimelineProps) {
  return (
    <ol className="space-y-0" aria-label="Order tracking timeline">
      {CUSTOMER_TRACKING_MILESTONES.map((m, i) => {
        const done = i < current
        const cur = i === current
        return (
          <li key={m.id} className="relative flex gap-4 pb-6 last:pb-0">
            {i < CUSTOMER_TRACKING_MILESTONES.length - 1 && (
              <span
                className={`absolute left-[11px] top-6 h-full w-px ${
                  done ? 'bg-brown' : 'bg-line-strong'
                }`}
              />
            )}
            <span
              className={`relative z-10 grid size-6 shrink-0 place-items-center rounded-full border ${
                done
                  ? 'border-brown bg-brown text-white'
                  : cur
                    ? 'border-brown bg-paper'
                    : 'border-line-strong bg-paper'
              }`}
            >
              {done ? (
                <Icon name="check" className="size-3" />
              ) : (
                cur && <span className="size-2 rounded-full bg-brown" />
              )}
            </span>
            <div>
              <p className={`text-sm ${done || cur ? 'font-medium' : 'text-muted'}`}>{m.label}</p>
              <p className="text-xs text-muted">
                {done ? 'Completed' : cur ? 'Current status' : 'Upcoming'}
              </p>
            </div>
          </li>
        )
      })}
    </ol>
  )
}

