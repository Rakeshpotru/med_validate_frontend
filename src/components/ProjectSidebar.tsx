import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import ProjectList from './projects/ProjectList'
import type { ProjectItem } from './projects/types'

export function ProjectSidebar() {
  const [activeId, setActiveId] = useState<string | undefined>('1')
  const navigate = useNavigate()

  const items: ProjectItem[] = [
    { id: '1', name: 'Aurelia Chantria', taskCount: 12, status: 'danger' },
    { id: '2', name: 'Aurelia Chantria', taskCount: 12, status: 'danger' },
    { id: '3', name: 'HPLC System', taskCount: 12, status: 'success' },
    { id: '4', name: 'Box Application', taskCount: 12, status: 'info' },
    { id: '5', name: 'Microscope', taskCount: 12, status: 'warning' },
  ]

  return (
    <section aria-label="My Projects" className="w-[280px] md:w-[300px] lg:w-[320px]">
      <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--surface))] shadow-sm">
        {/* Header */}
        <div className="rounded-t-xl bg-[#1f3a9d] px-3 py-2">
          <h2 className="py-1.5 text-sm font-medium text-white">My Projects</h2>
        </div>

        {/* List */}
        <ProjectList
          items={items}
          activeId={activeId}
          onSelect={(id) => {
            setActiveId(id)
            navigate(`/project/${id}?view=board`)
          }}
        />
      </div>
    </section>
  )
}

export default ProjectSidebar
