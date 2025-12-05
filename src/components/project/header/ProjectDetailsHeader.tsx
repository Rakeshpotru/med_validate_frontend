import { motion } from 'framer-motion'
import { ChevronLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import type { Project } from '../types'
import AvatarGroup from '../utils/AvatarGroup'

export interface ProjectDetailsHeaderProps {
  project: Project
  onBack?: () => void
}

export default function ProjectDetailsHeader({ project, onBack }: ProjectDetailsHeaderProps) {
  const navigate = useNavigate()

  const handleBack = () => {
    if (onBack) {
      onBack()
    } else {
      navigate(-1)
    }
  }

  const daysLeft = project.daysLeft ?? Math.max(0, Math.ceil((new Date(project.dueDate).getTime() - Date.now()) / 86400000))

  return (
    <motion.section
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="sticky top-0 z-10 rounded-2xl bg-white p-4 shadow-sm"
      aria-labelledby="project-details-header-title"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <button
            type="button"
            onClick={handleBack}
            aria-label="Go back"
            className="mt-1 inline-flex h-8 w-8 items-center justify-center rounded-lg text-[hsl(var(--fg))]/60 transition-colors hover:bg-[hsl(var(--surface-muted))] hover:text-[hsl(var(--fg))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1f3a9d]"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#1f3a9d]/10 text-[#1f3a9d]">
            🔧
          </div>
          <div>
            <h1 id="project-details-header-title" className="text-base font-semibold text-[hsl(var(--fg))]">
              {project.title} ({daysLeft} Days left)
            </h1>
            <p className="mt-1 text-xs text-[hsl(var(--fg))]/70">
              <span className="font-medium text-[#1f3a9d]">Due date:</span> {project.dueDate}
            </p>
            <div className="mt-3 w-64">
              <div className="relative">
                <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200" aria-hidden="true" />
                <motion.div
                  role="progressbar"
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-valuenow={project.progressPct}
                  aria-label={`Project progress: ${project.progressPct}%`}
                  className="absolute left-0 top-0 h-2 rounded-full bg-[#1f3a9d]"
                  style={{ width: `${project.progressPct}%` }}
                  initial={{ width: 0 }}
                  animate={{ width: `${project.progressPct}%` }}
                  transition={{ duration: 0.5, ease: 'easeOut' }}
                />
                {/* Knob */}
                <motion.div
                  aria-hidden
                  className="absolute top-1/2 h-3 w-3 -translate-y-1/2 rounded-full border-2 border-white bg-[#1f3a9d] shadow-sm"
                  style={{ left: `calc(${project.progressPct}% - 6px)` }}
                  initial={{ left: '-6px' }}
                  animate={{ left: `calc(${project.progressPct}% - 6px)` }}
                  transition={{ duration: 0.5, ease: 'easeOut' }}
                />
              </div>
              <div className="mt-1 text-right text-xs font-medium text-[#1f3a9d]">{project.progressPct}%</div>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <AvatarGroup members={project.members} maxVisible={4} size="md" />
          {project.members.length > 4 && (
            <div
              className="inline-flex items-center rounded-full bg-[#1f3a9d]/10 px-2 py-0.5 text-xs font-medium text-[#1f3a9d]"
              aria-label={`+${project.members.length - 4} more members`}
            >
              +{project.members.length - 4}
            </div>
          )}
        </div>
      </div>
    </motion.section>
  )
}
