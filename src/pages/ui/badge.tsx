import { cn } from './utils'

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'secondary' | 'outline'
}

export function Badge({ className, variant = 'default', ...props }: BadgeProps) {
  const base = 'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium'
  const variants: Record<NonNullable<BadgeProps['variant']>, string> = {
    default: 'bg-blue-600/10 text-[hsl(var(--fg))]',
    secondary: 'bg-black/10 dark:bg-white/10 text-[hsl(var(--fg))] ',
    outline: 'border border-[hsl(var(--border))] text-[hsl(var(--fg))] ',
  }
  return <span className={cn(base, variants[variant], className)} {...props} />
}

export default Badge
