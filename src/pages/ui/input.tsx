import * as React from 'react'
import { cn } from './utils'

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = 'text', ...props }, ref) => {
    return (
      <input
        type={type}
        ref={ref}
        className={cn(
          'flex h-9 w-full rounded-md border border-[hsl(var(--border))] bg-transparent px-3 py-2 text-sm text-[hsl(var(--fg))] outline-none placeholder:opacity-60 focus-visible:ring-2',
          className
        )}
        {...props}
      />
    )
  }
)

Input.displayName = 'Input'

export default Input
