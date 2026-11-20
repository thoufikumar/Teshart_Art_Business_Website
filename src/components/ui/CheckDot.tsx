import Icon from "./Icon"

export default function CheckDot() {
  return (
    <span
      aria-hidden="true"
      className="grid size-5 place-items-center rounded-full bg-primary text-white"
    >
      <Icon name="check" className="size-3" />
    </span>
  )
}
