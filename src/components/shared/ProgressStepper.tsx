import { CHECKOUT_STEPS } from '../../config/routes'
import Icon from '../ui/Icon'

export interface ProgressStepperProps {
  step: number
}

export default function ProgressStepper({ step }: ProgressStepperProps) {
  return (
    <ol className="grid grid-cols-4" aria-label="Order progress">
      {CHECKOUT_STEPS.map((s, i) => {
        const done = i < step
        const cur = i === step
        return (
          <li
            key={s.id}
            className="relative flex flex-col items-center gap-1.5 text-center"
            aria-current={cur ? 'step' : undefined}
          >
            {i > 0 && (
              <span
                className={`absolute right-1/2 top-3 h-px w-[calc(100%-28px)] -translate-x-[14px] ${
                  done || cur ? 'bg-brown' : 'bg-line-strong'
                }`}
              />
            )}
            <span
              className={`relative z-10 grid size-6 place-items-center rounded-full border text-[11px] ${
                cur
                  ? 'border-brown bg-brown text-white'
                  : done
                    ? 'border-brown bg-paper text-brown'
                    : 'border-line-strong bg-paper text-muted'
              }`}
            >
              {done ? <Icon name="check" className="size-3" /> : i + 1}
            </span>
            <span className={`text-[11px] sm:text-xs ${cur ? 'font-medium text-ink' : 'text-muted'}`}>
              {s.label}
            </span>
          </li>
        )
      })}
    </ol>
  )
}

