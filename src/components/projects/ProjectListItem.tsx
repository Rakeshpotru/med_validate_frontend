import type { StatusKind } from './types'
import { cn } from '../ui/utils'

export interface ProjectListItemProps {
  id: string
  name: string
  taskCount: number
  status: StatusKind
  active?: boolean
  onClick?: (id: string) => void
}

const statusBg: Record<StatusKind, string> = {
  danger: 'bg-rose-500',
  success: 'bg-emerald-500',
  info: 'bg-sky-500',
  warning: 'bg-yellow-400 text-black',
}

export default function ProjectListItem({ id, name, taskCount, status, active, onClick }: ProjectListItemProps) {
  return (
    <button
      role="option"
      aria-selected={!!active}
      type="button"
      onClick={() => onClick?.(id)}
      className={cn(
        'flex w-full items-center gap-3 px-3 py-2 rounded-lg text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--ring))] focus-visible:ring-offset-2',
        active && 'bg-[#1f3a9d]/10 ring-1 ring-[#1f3a9d]/20'
      )}
    >
      <span className={cn('inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white', statusBg[status])}>
        !
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate font-medium">{name}</span>
        <span className="block text-sm opacity-70">{taskCount} Tasks</span>
      </span>
    </button>
  )
}
