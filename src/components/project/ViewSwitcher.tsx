import { useMemo } from 'react'
import { cn } from '../ui/utils'
import { LayoutPanelLeft, List as ListIcon, Calendar as CalendarIcon } from 'lucide-react'

export type ViewKey = 'board' | 'list' | 'calendar'

export interface ViewSwitcherProps {
  value: ViewKey
  onChange: (v: ViewKey) => void
  className?: string
}

export default function ViewSwitcher({ value, onChange, className }: ViewSwitcherProps) {
  const items = useMemo(
    () => [
      { key: 'board' as const, label: 'Board', Icon: LayoutPanelLeft },
      { key: 'list' as const, label: 'List', Icon: ListIcon },
      // { key: 'calendar' as const, label: 'Calendar', Icon: CalendarIcon },
    ],
    [],
  )

  return (
    <div role="tablist" aria-label="Views" className={cn('inline-flex gap-2', className)}>
      {items.map(({ key, label, Icon }) => (
        <button
          key={key}
          role="tab"
          aria-selected={value === key}
          onClick={() => onChange(key)}
          className={cn(
            'inline-flex items-center gap-2 rounded-full border px-3 py-1 text-sm focus-visible:outline-none focus-visible:ring-2',
            value === key
              ? 'bg-[#1f3a9d] text-white border-transparent'
              : 'bg-white text-[hsl(var(--fg))] border-[hsl(var(--border))] hover:bg-black/5 dark:hover:bg-white/10',
          )}
        >
          <Icon className="h-4 w-4" />
          {label}
        </button>
      ))}
    </div>
  )
}
