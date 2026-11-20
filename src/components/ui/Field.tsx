import Icon, { type IconName } from "./Icon"

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
  className = "",
  type = "text",
}: FieldProps) {
  return (
    <label className={`block ${className}`}>
      <span
        className={`flex items-center gap-3 rounded-lg border bg-white px-3 py-2.5 transition-colors focus-within:border-primary focus-within:ring-1 focus-within:ring-primary ${
          error ? "border-error" : "border-border"
        }`}
      >
        <Icon name={icon} className="size-4 shrink-0 text-text-secondary" />
        <span className="min-w-0 flex-1">
          <span className="block text-xs font-medium text-primary">{label}</span>
          <input
            type={type}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            aria-invalid={Boolean(error)}
            className="w-full bg-transparent text-sm text-primary outline-none placeholder:text-text-secondary/70"
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
