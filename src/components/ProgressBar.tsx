interface ProgressBarProps {
  percent: number
  colorClass?: string
  trackClass?: string
  heightClass?: string
}

export function ProgressBar({
  percent,
  colorClass = 'bg-violet-500',
  trackClass = 'bg-neutral-200 dark:bg-neutral-800',
  heightClass = 'h-2',
}: ProgressBarProps) {
  const clamped = Math.max(0, Math.min(100, percent))
  return (
    <div
      className={`w-full ${heightClass} ${trackClass} rounded-full overflow-hidden`}
      role="progressbar"
      aria-valuenow={clamped}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div
        className={`h-full ${colorClass} rounded-full transition-all duration-300 ease-out`}
        style={{ width: `${clamped}%` }}
      />
    </div>
  )
}
