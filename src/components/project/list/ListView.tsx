import { useMemo, useState } from 'react'
import type { Task, StageKey } from '../types'
import TaskCard from '../TaskCard'
import { ChevronDown } from 'lucide-react'

export interface ListViewProps {
  tasks: Task[]
  onOpenTask?: (id: string) => void
  projectId: number
}

function Section({ title, count, children, defaultOpen = true }: { title: string; count: number; children: React.ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <section className="rounded-xl bg-[hsl(var(--surface))] text-[hsl(var(--fg))] shadow-sm ring-1 ring-[hsl(var(--border))]">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between rounded-t-xl bg-[#1f3a9d] px-3 py-2 text-white focus-visible:outline-none focus-visible:ring-2"
        aria-expanded={open}
      >
        <div className="inline-flex items-center gap-2">
          <span className="inline-flex h-5 w-5 items-center justify-center rounded bg-white/10">≡</span>
          <span className="font-medium">{title}</span>
        </div>
        <div className='flex items-center gap-2 flex-shrink-0'>
        <span className="inline-flex h-6 min-w-6 items-center justify-center rounded-full bg-white/10 px-2 text-sm">{count}</span>
         <ChevronDown
          className={`h-4 w-4 transition-transform duration-200 ${
            open ? 'rotate-180' : ''
          }`}
        />
        </div>
      </button>
      {open && (
        <div className="grid gap-3 p-3 md:grid-cols-3">
          {children}
        </div>
      )}
    </section>
  )
}

export default function ListView({ tasks, onOpenTask, projectId }: ListViewProps) {
  const groups = useMemo(() => {
    const map = new Map<StageKey, Task[]>()
    for (const t of tasks) {
      const arr = map.get(t.stage) ?? []
      arr.push(t)
      map.set(t.stage, arr)
    }
    return Array.from(map.entries()) as Array<[StageKey, Task[]]>
  }, [tasks])

  return (
    <div className="grid gap-4">
      {groups.map(([stage, list]) => (
        <Section key={String(stage)} title={String(stage)} count={list.length}>
          {list.map((t) => (
            <TaskCard key={t.id} task={t} onOpen={onOpenTask} projectId={projectId} />
          ))}
        </Section>
      ))}
    </div>
  )
}
