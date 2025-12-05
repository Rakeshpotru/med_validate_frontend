import { useEffect, useMemo, useRef } from 'react'
import { cn } from '../ui/utils'
import ProjectListItem from './ProjectListItem'
import type { ProjectItem } from './types'

export interface ProjectListProps {
  items: ProjectItem[]
  activeId?: string
  onSelect?: (id: string) => void
  loading?: boolean
  emptyText?: string
  className?: string
}

export default function ProjectList({
  items,
  activeId,
  onSelect,
  loading,
  emptyText = 'No projects found.',
  className,
}: ProjectListProps) {
  const listRef = useRef<HTMLDivElement>(null)

  const activeIndex = useMemo(
    () => (activeId ? items.findIndex((it) => it.id === activeId) : -1),
    [activeId, items],
  )

  useEffect(() => {
    if (activeIndex >= 0 && listRef.current) {
      const el = listRef.current.querySelector<HTMLElement>(`[data-option-id="${items[activeIndex].id}"]`)
      el?.scrollIntoView({ block: 'nearest' })
    }
  }, [activeIndex, items])

  function handleKeyDown(e: React.KeyboardEvent<HTMLDivElement>) {
    if (!items.length) return
    const current = Math.max(0, activeIndex)
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      const next = current + 1 < items.length ? current + 1 : current
      if (next !== current) onSelect?.(items[next].id)
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      const prev = current - 1 >= 0 ? current - 1 : current
      if (prev !== current) onSelect?.(items[prev].id)
    } else if (e.key === 'Home') {
      e.preventDefault()
      onSelect?.(items[0].id)
    } else if (e.key === 'End') {
      e.preventDefault()
      onSelect?.(items[items.length - 1].id)
    }
  }

  return (
    <div
      ref={listRef}
      role="listbox"
      aria-activedescendant={activeId}
      tabIndex={0}
      onKeyDown={handleKeyDown}
      className={cn('p-3', className)}
    >
      {loading ? (
        <div className="grid gap-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-10 rounded-xl bg-[hsl(var(--surface-muted))] animate-pulse" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] p-4 text-sm opacity-70">
          {emptyText}
        </div>
      ) : (
        <ul className="grid gap-2">
          {items.map((it) => (
            <li key={it.id}>
              <div data-option-id={it.id} id={it.id}>
                <ProjectListItem
                  id={it.id}
                  name={it.name}
                  taskCount={it.taskCount}
                  status={it.status}
                  active={activeId === it.id}
                  onClick={(id) => onSelect?.(id)}
                />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
