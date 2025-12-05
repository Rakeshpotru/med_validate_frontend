import { ChevronLeft, ChevronRight } from 'lucide-react'
import type { Task } from '../types'
import TaskCard from '../TaskCard'

export interface CalendarViewProps {
  tasks: Task[]
  onOpenTask?: (id: string) => void
  projectId: number
}

export default function CalendarView({ tasks, onOpenTask, projectId }: CalendarViewProps) {
  // Minimal stubbed month grid for the refactor scope
  const days = Array.from({ length: 30 }, (_, i) => i + 1)
  const selected = 12

  return (
    <div className="grid gap-4 md:grid-cols-[1fr_320px]">
      {/* Month grid */}
      <section className="rounded-2xl bg-[hsl(var(--surface))] p-4 text-[hsl(var(--fg))] shadow-sm ring-1 ring-[hsl(var(--border))]">
        <div className="mb-3 flex items-center justify-between">
          <div className="inline-flex items-center gap-2">
            <button className="rounded p-1 hover:bg-[hsl(var(--surface-muted))] focus-visible:outline-none focus-visible:ring-2" aria-label="Previous month">
              <ChevronLeft className="h-4 w-4" />
            </button>
            <h3 className="text-sm font-semibold">Sep 2025</h3>
            <button className="rounded p-1 hover:bg-[hsl(var(--surface-muted))] focus-visible:outline-none focus-visible:ring-2" aria-label="Next month">
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
          <button className="rounded border border-[hsl(var(--border))] px-2 py-1 text-sm hover:bg-[hsl(var(--surface-muted))] focus-visible:outline-none focus-visible:ring-2">
            Today
          </button>
        </div>

        <div className="grid grid-cols-7 gap-2">
          {['Mo','Tu','We','Th','Fr','Sa','Su'].map((d) => (
            <div key={d} className="px-2 py-1 text-center text-xs opacity-70">{d}</div>
          ))}
          {days.map((d) => (
            <button
              key={d}
              className={
                'aspect-square rounded-lg border border-[hsl(var(--border))] text-sm focus-visible:outline-none focus-visible:ring-2 ' +
                (d === selected ? 'bg-[#1f3a9d] text-white' : 'hover:bg-[hsl(var(--surface-muted))]')
              }
            >
              {d}
              <div className="mt-5 h-0.5 w-8 bg-[#1f3a9d]" />
            </button>
          ))}
        </div>
      </section>

      {/* Tasks List */}
      <aside className="rounded-2xl bg-[hsl(var(--surface))] p-4 text-[hsl(var(--fg))] shadow-sm ring-1 ring-[hsl(var(--border))]">
        <h4 className="mb-4 text-lg font-semibold">Tasks</h4>
        <div className="space-y-3">
          {tasks.slice(0, 5).map((task) => (
            <div key={task.id} onClick={() => onOpenTask?.(task.id)}>
              <TaskCard task={task} onOpen={onOpenTask} projectId={projectId} />
            </div>
          ))}
        </div>
      </aside>
    </div>
  )
}
