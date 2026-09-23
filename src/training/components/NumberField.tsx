import { input } from './ui'

interface NumberFieldProps {
  value: number
  onChange: (value: number) => void
  min?: number
  step?: number
  className?: string
  ariaLabel: string
}

export function NumberField({ value, onChange, min = 0, step = 1, className = 'w-16', ariaLabel }: NumberFieldProps) {
  return (
    <input
      type="number"
      inputMode="decimal"
      min={min}
      step={step}
      value={Number.isFinite(value) ? value : 0}
      aria-label={ariaLabel}
      onFocus={(e) => e.currentTarget.select()}
      onChange={(e) => {
        const n = parseFloat(e.target.value)
        onChange(Number.isFinite(n) ? Math.max(min, n) : 0)
      }}
      className={`${input} ${className} text-center tabular-nums`}
    />
  )
}
