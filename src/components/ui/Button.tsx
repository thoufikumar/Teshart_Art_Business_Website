import { type ButtonHTMLAttributes, type ReactNode } from "react"

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode
  variant?: "primary" | "secondary" | "text" | "nav-glass" | "hero-cta"
}

export default function Button({
  children,
  onClick,
  variant = "primary",
  className = "",
  disabled,
  type = "button",
  ...rest
}: ButtonProps) {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium transition-colors cursor-pointer disabled:cursor-not-allowed"

  let variantClasses = ""
  if (variant === "primary") {
    variantClasses =
      "bg-primary text-white hover:bg-primary-hover active:bg-primary-active disabled:bg-border-strong disabled:text-text-secondary"
  } else if (variant === "secondary") {
    variantClasses =
      "border border-border-strong bg-white text-primary hover:bg-surface-subtle active:bg-border disabled:border-border disabled:text-muted-element"
  } else if (variant === "text") {
    variantClasses =
      "bg-transparent text-primary hover:text-primary-hover hover:underline disabled:text-muted-element p-0"
  } else if (variant === "nav-glass") {
    variantClasses = "btn-nav-glass"
  } else if (variant === "hero-cta") {
    variantClasses = "btn-hero-cta"
  }

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`${base} ${variantClasses} ${className}`}
      {...rest}
    >
      {children}
    </button>
  )
}
