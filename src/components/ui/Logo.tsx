export interface LogoProps {
  onClick?: () => void
  className?: string
}

export default function Logo({ onClick, className = '' }: LogoProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center gap-2 text-[15px] font-medium tracking-tight text-ink ${className}`}
    >
      <span className="size-3.5 rounded-full bg-ink" aria-hidden="true" />
      <span>Teshart</span>
    </button>
  )
}

