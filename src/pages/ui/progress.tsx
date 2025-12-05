export interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: number // 0..100
}

export function Progress({ value = 0, className, ...props }: ProgressProps) {
  const clamped = Math.max(0, Math.min(100, value))
  return (
    <div
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(clamped)}
      className={`h-2 w-full overflow-hidden rounded-full bg-black/10 dark:bg-white/10 ${className ?? ''}`}
      {...props}
    >
      <div className="h-full rounded-full bg-blue-500" style={{ width: `${clamped}%` }} />
    </div>
  )
}

export default Progress
