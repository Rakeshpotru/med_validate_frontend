import { useId } from 'react'
import { motion } from 'framer-motion'
import { cn } from '../ui/utils'
import type { Member, Project } from './types'

export interface ProjectHeaderProps {
  project: Project
  activeTab: 'tasks' | 'comments' | 'incident'
  onTabChange: (tab: 'tasks' | 'comments' | 'incident') => void
  showTabs?: boolean
}

function Avatar({ m }: { m: Member }) {
  const alt = m.name ?? 'Member'
  return (
    <img
      src={m.avatarUrl || 'data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2240%22 height=%2240%22><rect width=%2240%22 height=%2240%22 fill=%22%231f3a9d%22/></svg>'}
      alt={alt}
      className="h-8 w-8 rounded-full border-2 border-white object-cover shadow-sm ring-transparent hover:ring-2 hover:ring-[#1f3a9d]"
      onError={(e) => {
        const img = e.currentTarget
        if (!img.dataset.fallback) {
          img.dataset.fallback = '1'
          const BASE = (import.meta as any).env?.BASE_URL ?? '/'
          img.src = `${BASE}users_profile/default.jpg`
        }
      }}
    />
  )
}

export default function ProjectHeader({ project, activeTab, onTabChange, showTabs = true }: ProjectHeaderProps) {
  const tabs: Array<{ key: 'tasks' | 'comments' | 'incident'; label: string }> = [
    { key: 'tasks', label: 'Tasks' },
    { key: 'comments', label: 'Comments' },
    { key: 'incident', label: 'Incident' },
  ]
  const sliderId = useId()

  return (
    <motion.section
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="rounded-2xl bg-[hsl(var(--surface))] p-4 text-[hsl(var(--fg))]"
      aria-labelledby="project-header-title"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#1f3a9d]/10 text-[#1f3a9d]">🔧</div>
          <div>
            <h2 id="project-header-title" className="text-base font-semibold">
              {project.title} ({Math.max(0, Math.ceil((new Date(project.dueDate).getTime() - Date.now()) / 86400000))} Days left)
            </h2>
            <p className="mt-1 text-xs"><span className="text-[#1f3a9d] font-medium">Due date:</span> <span className="opacity-70">{project.dueDate}</span></p>
            <div className="mt-3">
              <div className="relative">
                <div className="h-2 w-full overflow-hidden rounded-full bg-[hsl(var(--muted))]" aria-hidden="true" />
                <motion.div
                  role="progressbar"
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-valuenow={project.progressPct}
                  className="absolute left-0 top-0 h-2 rounded-full bg-[#1f3a9d]"
                  style={{ width: `${project.progressPct}%` }}
                  layoutId={sliderId}
                  transition={{ duration: 0.25 }}
                />
                {/* Knob */}
                <motion.div
                  aria-hidden
                  className="absolute top-1/2 h-3 w-3 -translate-y-1/2 rounded-full border-2 border-white bg-[#1f3a9d] shadow-sm"
                  style={{ left: `calc(${project.progressPct}% - 6px)` }}
                  layoutId={sliderId + '-knob'}
                  transition={{ duration: 0.25 }}
                />
              </div>
              <div className="mt-1 text-right text-xs font-medium opacity-70">{project.progressPct}%</div>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {project.members.slice(0, 4).map((m) => (
            <Avatar key={m.id} m={m} />
          ))}
          {project.members.length > 4 && (
            <div
              className="relative z-10 -ml-2 inline-flex items-center rounded-full bg-[#1f3a9d]/10 px-2 py-0.5 text-xs font-medium text-[#1f3a9d]"
              aria-label={`+${project.members.length - 4} more members`}
              title={`+${project.members.length - 4} more`}
            >
              +{project.members.length - 4}
            </div>
          )}
        </div>
      </div>

      {/* Tabs (optional) */}
      {showTabs && (
        <div className="mt-4">
          <div role="tablist" aria-label="Project sections" className="inline-flex items-center gap-2">
            {tabs.map((t) => (
              <button
                key={t.key}
                role="tab"
                aria-selected={activeTab === t.key}
                aria-controls={`panel-${t.key}`}
                onClick={() => onTabChange(t.key)}
                className={cn(
                  'rounded-full border px-3 py-1 text-sm focus-visible:outline-none focus-visible:ring-2 border-b-2',
                  activeTab === t.key
                    ? 'bg-[#1f3a9d] text-white border-transparent border-b-[#1f3a9d]'
                    : 'bg-[hsl(var(--surface))] text-[hsl(var(--fg))] border-[hsl(var(--border))] hover:bg-[hsl(var(--surface-muted))] border-b-transparent',
                )}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </motion.section>
  )
}
