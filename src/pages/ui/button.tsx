import React from 'react'
import { cn } from './utils'

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'ghost' | 'outline' | 'secondary'
  size?: 'sm' | 'md' | 'lg' | 'icon'
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'md', ...props }, ref) => {
    const base = 'inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none'
    const variants: Record<NonNullable<ButtonProps['variant']>, string> = {
      default: 'bg-blue-600/90 text-white hover:bg-blue-600',
      ghost: 'bg-transparent hover:bg-black/5 dark:hover:bg-white/5',
      outline: 'border border-[hsl(var(--border))] bg-transparent hover:bg-black/5 dark:hover:bg-white/5',
      secondary: 'bg-black/10 dark:bg-white/10 hover:bg-black/20 dark:hover:bg-white/20',
    }
    const sizes: Record<NonNullable<ButtonProps['size']>, string> = {
      sm: 'h-8 px-2',
      md: 'h-9 px-3',
      lg: 'h-10 px-4',
      icon: 'h-9 w-9',
    }

    return (
      <button
        ref={ref}
        className={cn('bg-[hsl(var(--bg))] text-[hsl(var(--fg))]', base, variants[variant], sizes[size], className)}
        {...props}
      />
    )
  }
)

Button.displayName = 'Button'

export default Button
