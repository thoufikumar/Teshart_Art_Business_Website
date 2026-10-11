import Icon, { type IconName } from './Icon'

export interface FieldProps {
  icon: IconName
  label: string
  value: string
  onChange: (value: string) => void
  placeholder: string
  error?: string
  className?: string
  type?: string
}

export default function Field({
  icon,
  label,
  value,
  onChange,
  placeholder,
  error,
  className = '',
  type = 'text',
}: FieldProps) {
  return (
    <label className={`block ${className}`}>
      <span
        className={`flex items-center gap-3 rounded-lg border bg-white px-3 py-2.5 focus-within:border-brown focus-within:ring-1 focus-within:ring-brown ${
          error ? 'border-error' : 'border-line'
        }`}
      >
        <Icon name={icon} className="size-4 shrink-0 text-muted" />
        <span className="min-w-0 flex-1">
          <span className="block text-xs font-medium">{label}</span>
          <input
            type={type}
            value={value}
            onChange={e => onChange(e.target.value)}
            placeholder={placeholder}
            aria-invalid={Boolean(error)}
            className="w-full bg-transparent text-sm outline-none placeholder:text-muted/70"
          />
        </span>
      </span>
      {error && (
        <span role="alert" className="mt-1 block text-xs text-error">
          {error}
        </span>
      )}
    </label>
  )
}

