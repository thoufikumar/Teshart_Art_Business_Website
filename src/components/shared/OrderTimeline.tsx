import { CUSTOMER_TRACKING_MILESTONES } from "../../domain/order"
import Icon from "../ui/Icon"

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
          <li key={m.id} className="relative flex gap-3.5 pb-4 sm:pb-4.5 last:pb-0">
            {i < CUSTOMER_TRACKING_MILESTONES.length - 1 && (
              <span
                className={`absolute left-[11px] top-6 h-full w-px ${
                  done ? "bg-primary" : "bg-border"
                }`}
              />
            )}
            <span
              className={`relative z-10 grid size-6 shrink-0 place-items-center rounded-full border ${
                done
                  ? "border-primary bg-primary text-white"
                  : cur
                    ? "border-primary bg-white ring-4 ring-primary/10"
                    : "border-border bg-white"
              }`}
            >
              {done ? (
                <Icon name="check" className="size-3" />
              ) : cur ? (
                <span className="size-2 rounded-full bg-primary" />
              ) : (
                <span className="size-1.5 rounded-full bg-border" />
              )}
            </span>
            <div className="pt-0.5">
              <p className={`text-sm ${done || cur ? "font-medium text-primary" : "text-text-secondary"}`}>
                {m.label}
              </p>
              <p className="text-[11px] text-text-secondary">
                {done ? "Completed" : cur ? "Current status" : "Upcoming"}
              </p>
            </div>
          </li>
        )
      })}
    </ol>
  )
}
