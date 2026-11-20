import { CHECKOUT_STEPS, type CheckoutStepIndex } from "../../config/routes"
import Icon from "../ui/Icon"

export interface ProgressStepperProps {
  step: number
  onStepClick?: (step: CheckoutStepIndex) => void
  compact?: boolean
  className?: string
}

export default function ProgressStepper({
  step,
  onStepClick,
  compact = false,
  className = "",
}: ProgressStepperProps) {
  if (compact) {
    return (
      <div className={`flex flex-col items-center gap-1 ${className}`} aria-label="Order progress">
        <div className="flex items-center justify-center gap-1.5">
          {CHECKOUT_STEPS.map((s, i) => {
            const done = i < step
            const cur = i === step
            const isClickable = Boolean(onStepClick && done)
            return (
              <div key={s.id} className="flex items-center">
                {i > 0 && (
                  <span
                    className={`h-0.5 w-5 rounded-full transition-colors ${
                      done || cur ? "bg-primary" : "bg-border"
                    }`}
                  />
                )}
                <button
                  type="button"
                  disabled={!isClickable}
                  onClick={() => isClickable && onStepClick?.(s.index)}
                  className={`grid size-5.5 place-items-center rounded-full text-[10px] font-medium transition-all ${
                    cur
                      ? "bg-primary text-white ring-2 ring-primary/20"
                      : done
                        ? "bg-surface-subtle text-primary border border-primary cursor-pointer"
                        : "border border-border bg-white text-muted-element"
                  }`}
                  aria-current={cur ? "step" : undefined}
                  aria-label={`Step ${i + 1}: ${s.label}`}
                >
                  {done ? <Icon name="check" className="size-2.5" /> : i + 1}
                </button>
              </div>
            )
          })}
        </div>
        <p className="text-[11px] text-text-secondary">
          Step {step + 1} of {CHECKOUT_STEPS.length}:{" "}
          <span className="font-medium text-primary">{CHECKOUT_STEPS[step]?.label}</span>
        </p>
      </div>
    )
  }

  return (
    <ol
      className={`flex items-center justify-center w-full max-w-2xl mx-auto gap-1 sm:gap-2 lg:gap-3 ${className}`}
      aria-label="Order progress"
    >
      {CHECKOUT_STEPS.map((s, i) => {
        const done = i < step
        const cur = i === step
        const isClickable = Boolean(onStepClick && done)

        return (
          <li
            key={s.id}
            className="flex items-center"
            aria-current={cur ? "step" : undefined}
          >
            <div className="flex items-center gap-1.5 sm:gap-2">
              <button
                type="button"
                disabled={!isClickable}
                onClick={() => isClickable && onStepClick?.(s.index)}
                aria-label={`Step ${i + 1}: ${s.label}${done ? " (completed, click to edit)" : cur ? " (current)" : ""}`}
                className={`grid size-5.5 sm:size-6 shrink-0 place-items-center rounded-full text-[10px] sm:text-[11px] font-medium transition-all ${
                  cur
                    ? "bg-primary text-white shadow-sm ring-2 ring-primary/20 font-semibold"
                    : done
                      ? "border border-primary bg-surface-subtle text-primary hover:bg-surface-subtle/80 cursor-pointer"
                      : "border border-border bg-white text-muted-element"
                }`}
              >
                {done ? <Icon name="check" className="size-3" /> : i + 1}
              </button>
              <button
                type="button"
                disabled={!isClickable}
                onClick={() => isClickable && onStepClick?.(s.index)}
                className={`text-[11px] sm:text-xs whitespace-nowrap transition-colors text-left ${
                  cur
                    ? "font-medium text-primary"
                    : done
                      ? "text-text-secondary hover:text-primary cursor-pointer"
                      : "text-muted-element"
                }`}
              >
                {s.label}
              </button>
            </div>
            {i < CHECKOUT_STEPS.length - 1 && (
              <span
                className={`mx-1.5 sm:mx-2 lg:mx-3 h-0.5 w-4 sm:w-6 lg:w-9 rounded-full transition-colors ${
                  done ? "bg-primary" : "bg-border"
                }`}
              />
            )}
          </li>
        )
      })}
    </ol>
  )
}
