import type { ReactNode } from 'react'

export interface IconActionButtonProps {
  ariaLabel: string
  onClick: () => void
  icon: ReactNode
  disabled?: boolean
}

export default function IconActionButton({ ariaLabel, onClick, icon, disabled = false }: IconActionButtonProps) {
  return (
    <button
      type="button"
      aria-label={ariaLabel}
      onClick={onClick}
      disabled={disabled}
      className="inline-flex h-8 w-8 items-center justify-center rounded-md text-[hsl(var(--fg))]/60 transition-colors hover:bg-[hsl(var(--surface-muted))] hover:text-[hsl(var(--fg))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1f3a9d] disabled:pointer-events-none disabled:opacity-50"
    >
      {icon}
    </button>
  )
}
