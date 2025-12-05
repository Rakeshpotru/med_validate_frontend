// ProjectDetails.tsx
import { useMemo, useRef, useState, useEffect } from 'react'
import { useParams, useSearchParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ChevronDown } from 'lucide-react'
import { Button } from '../../components/ui/button'
import type { Member } from '../../components/project/types'
import ViewSwitcher, { type ViewKey } from '../../components/project/ViewSwitcher'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import TasksView from './TasksView'
import CommentsView from './CommentsView'
import IncidentsView from './IncidentView'
import RingGradientLoader from '../../components/RingGradientLoader'
import { Api_url } from '../../networkCalls/Apiurls'
import DecodedTokenValues from '../../components/DecryptToken';
import { getRequestStatus } from '../../networkCalls/NetworkCalls'

function getAvatarBg(name: string) {
  const colors = ['bg-red-500', 'bg-blue-500', 'bg-green-500', 'bg-yellow-500', 'bg-purple-500', 'bg-pink-500', 'bg-indigo-500', 'bg-orange-500']
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash)
  }
  const index = Math.abs(hash) % colors.length
  return colors[index]
}

const colorMap: Record<string, string> = {
  'bg-red-500': '#ef4444',
  'bg-blue-500': '#3b82f6',
  'bg-green-500': '#10b981',
  'bg-yellow-500': '#f59e0b',
  'bg-purple-500': '#8b5cf6',
  'bg-pink-500': '#ec4899',
  'bg-indigo-500': '#6366f1',
  'bg-orange-500': '#f97316',
}

export default function ProjectDetails() {
  const { id = 'all' } = useParams()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  // Local state for active tab to sync instantly with clicks, fallback to URL
  const [activeTab, setActiveTab] = useState<'tasks' | 'comments' | 'incident'>(
    (searchParams.get('tab') as 'tasks' | 'comments' | 'incident') || 'tasks'
  )
  const view = activeTab === 'tasks' ? (searchParams.get('view') as ViewKey || 'board') : undefined
  const [projects, setProjects] = useState([])
  const [isLoadingProjects, setIsLoadingProjects] = useState(true)
  const { user_id, user_name, user_role_id, user_role_name, user_email } = DecodedTokenValues();
  const userId = user_id;
  const selectedProjectId = id === 'all' ? 0 : parseInt(id) || 0

  // Sync local activeTab with URL params on mount/change
  useEffect(() => {
    const urlTab = searchParams.get('tab') as 'tasks' | 'comments' | 'incident'
    if (urlTab && urlTab !== activeTab) {
      setActiveTab(activeTab)
    }
  }, [searchParams, activeTab])

  // Fetch projects
  // useEffect(() => {
  //   if (!userId) return;
  //   setIsLoadingProjects(true)
  //   fetch(`${Api_url.myworks_projects}/${userId}`)
  //     .then(res => res.json())
  //     .then(data => {
  //       setProjects(data.data || [])
  //       setIsLoadingProjects(false)
  //     })
  //     .catch(err => {
  //       console.error('Failed to fetch projects:', err)
  //       setIsLoadingProjects(false)
  //     })
  // }, [])
  useEffect(() => {
  const fetchProjects = async () => {
    if (!userId) return;
    setIsLoadingProjects(true);
    const result = await getRequestStatus<any>(`${Api_url.myworks_projects}/${userId}`);
    if (result.status === 200) {
      setProjects(result.data?.data || []);
    }
    setIsLoadingProjects(false);
  };

  fetchProjects();
}, [userId]);
// useEffect(() => {
//   const fetchProjects = async () => {
//     setIsLoadingProjects(true);
//     const result = await getRequestStatus<any>(`${Api_url.myworks_projects}`);
//     if (result.status === 200) {
//       setProjects(result.data?.data || []);
//     }
//     setIsLoadingProjects(false);
//   };

//   fetchProjects();
// }, []);

  const selectedProjectRaw = useMemo(() => {
    if (selectedProjectId === 0 || !projects.length) return null
    return projects.find((p: any) => p.project_id === selectedProjectId)
  }, [projects, selectedProjectId])

  const BASE = (import.meta as any).env?.BASE_URL ?? '/'
  const allMembers: Member[] = useMemo(() => {
    const userMap = new Map()
    projects.forEach((p: any) => {
      // FIXED: Handle missing p.users - assume empty if not present
      if (p.users) {
        p.users.forEach((u: any) => {
          if (!userMap.has(u.user_id)) {
            userMap.set(u.user_id, {
              id: u.user_id.toString(),
              name: u.user_name,
              avatarUrl: u.user_image ? `${Api_url.user_images}/${u.user_image}` : undefined,
            })
          }
        })
      }
    })
    return Array.from(userMap.values())
  }, [projects])

  const members: Member[] = useMemo(() => {
    if (selectedProjectId === 0) return allMembers
    if (!selectedProjectRaw || !selectedProjectRaw.users) return []
    return selectedProjectRaw.users.map((u: any) => ({
      id: u.user_id.toString(),
      name: u.user_name,
      avatarUrl: u.user_image ? `${Api_url.user_images}/${u.user_image}` : undefined,
    }))
  }, [selectedProjectRaw, selectedProjectId, allMembers])

  const avgProgress = useMemo(() => {
    if (projects.length === 0) return 0
    // FIXED: Handle missing p.completed_percentage - default to 0
    return Math.round(projects.reduce((sum: number, p: any) => sum + (p.completed_percentage || 0), 0) / projects.length)
  }, [projects])

  const project: any = useMemo(() => {
    if (selectedProjectId === 0) {
      return { 
        id: 'all', 
        title: 'All Projects', 
        dueDate: '', 
        progressPct: avgProgress, 
        members: allMembers, 
        daysLeft: null 
      }
    }
    if (!selectedProjectRaw) {
      return { id: 'p1', title: 'Loading...', dueDate: '', progressPct: 0, members: [], daysLeft: null }
    }
    const formatDate = (isoString: string | null) => {
      if (!isoString) return ''
      const date = new Date(isoString)
      const day = date.getDate()
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
      const month = months[date.getMonth()]
      const year = date.getFullYear()
      return `${day} ${month}, ${year}`
    }
    return {
      id: selectedProjectRaw.project_id.toString(),
      title: selectedProjectRaw.project_name,
      dueDate: formatDate(selectedProjectRaw.end_date), // FIXED: Handle missing end_date
      progressPct: selectedProjectRaw.completed_percentage || 0, // FIXED: Default to 0
      members,
      daysLeft: selectedProjectRaw.left_days || null, // FIXED: Default to null
    }
  }, [selectedProjectRaw, selectedProjectId, members, allMembers, avgProgress])

  function onOpenTask(id: string) {
    console.log('open task', id)
  }

  // Custom dropdown state
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false)
      }
    }
    // FIXED: Use 'click' instead of 'mousedown' to avoid interfering with trigger click
    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [])

  function onChangeView(v: ViewKey) {
    if (activeTab !== 'tasks') return
    const next = new URLSearchParams(searchParams)
    next.set('view', v)
    setSearchParams(next, { replace: true })
  }

  // Use local state for instant feedback, then sync to URL
  function onTabChange(newTab: 'tasks' | 'comments' | 'incident') {
    setActiveTab(newTab) // Instant local update for smooth UX
    // Debounced URL sync
    requestAnimationFrame(() => {
      const next = new URLSearchParams(searchParams)
      next.set('tab', newTab)
      if (newTab !== 'tasks') next.delete('view')
      setSearchParams(next, { replace: true })
    })
  }

  function onProjectChange(pid: number) {
    const currentTab = activeTab // Use local state
    const currentView = searchParams.get('view') || 'board'
    const query = new URLSearchParams()
    if (currentTab) query.set('tab', currentTab)
    if (currentTab === 'tasks' && currentView) query.set('view', currentView)
    const queryString = query.toString() ? `?${query.toString()}` : ''
    navigate(`/project/${pid}${queryString}`)
    // Force close immediately
    setIsDropdownOpen(false)
  }

  if (isLoadingProjects) {
    return <div className="flex items-center justify-center h-64"><RingGradientLoader /></div>
  }

  if (project.title === 'Loading...') {
    return <div className="flex items-center justify-center h-64"><RingGradientLoader /></div>
  }

  return (
    <div className="grid gap-4 ">  {/*overflow-x-hidden*/}
      {/* Custom Project Header with Animated Dropdown */}
      <div className="relative bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2 relative">
              {/* Custom Dropdown Trigger - FIXED: Add stopPropagation */}
              <div
                ref={dropdownRef}
                className="flex items-center gap-2 text-xl font-semibold text-gray-900 bg-transparent border-none focus:outline-none cursor-pointer group"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsDropdownOpen(!isDropdownOpen);
                }}
              >
                <span>{project.title}</span>
                {selectedProjectId !== 0 && project.daysLeft && project.daysLeft > 0 && (
                  <span className="text-sm text-gray-500">({project.daysLeft} Days left)</span>
                )}
                <ChevronDown className={`h-5 w-5 text-gray-400 group-hover:text-gray-600 transition-transform duration-300 ease-in-out ${isDropdownOpen ? 'rotate-180' : ''}`} />
              </div>
              {/* Animated Dropdown Menu */}
              <motion.ul
                initial={{ opacity: 0, scale: 0.95, y: -8 }}
                animate={isDropdownOpen ? { opacity: 1, scale: 1, y: 0 } : { opacity: 0, scale: 0.95, y: -8 }}
                transition={{ duration: 0.2, ease: 'easeOut' }}
                className="absolute top-full left-0 mt-2 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-50 overflow-hidden"
                style={{ 
                  originY: 0,
                  pointerEvents: isDropdownOpen ? 'auto' : 'none'
                }}
              >
                <motion.li key="all">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onProjectChange(0);
                    }}
                    className={`w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-200 flex items-center gap-2 ${selectedProjectId === 0 ? 'bg-gray-100 font-medium' : ''}`}
                  >
                    All Projects
                  </button>
                </motion.li>
                <div className='h-80 overflow-y-auto' >
                {projects.map((proj: any) => (
                  <motion.li key={proj.project_id}>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onProjectChange(proj.project_id);
                      }}
                      className={`w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-200 flex items-center gap-2 ${selectedProjectId === proj.project_id ? 'bg-gray-100 font-medium' : ''}`}
                    >
                      {proj.project_name}
                    </button>
                  </motion.li>
                ))}
                </div>
              </motion.ul>
            </div>
            {selectedProjectId !== 0 && (
              <div className="text-sm text-gray-500 mb-4">
                Due date: {project.dueDate ? project.dueDate : 'N/A'}
              </div>
            )}
            <div className="flex items-center gap-2">
              <div className="w-85 bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${project.progressPct}%` }}
                ></div>
              </div>
              <span className="text-sm text-gray-500">{project.progressPct}%</span>
            </div>
          </div>
          <div className="flex items-center gap-1 ml-4 flex-shrink-0">
            {project.members.slice(0, 3).map((member) => {
              const initial = member.name.charAt(0).toUpperCase()
              const avatarClass = getAvatarBg(member.name)
              const bgColor = colorMap[avatarClass]
              return (
                <div
                  key={member.id}
                  className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium text-white overflow-hidden relative transition-transform duration-300 hover:scale-120"
                  title={member.name}
                  style={{ backgroundColor: bgColor }}
                >
                  <span className="absolute inset-0 flex items-center justify-center">
                    {initial}
                  </span>
                  {member.avatarUrl && (
                    <img
                      src={member.avatarUrl}
                      alt=""
                      className="w-full h-full object-cover rounded-full"
                      onError={(e) => (e.currentTarget.style.display = 'none')}
                      style={{ position: 'absolute', top: 0, left: 0 }}
                    />
                  )}
                </div>
              )
            })}
            {project.members.length > 3 && (
              <div 
                className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-xs font-medium text-gray-700 transition-transform duration-300 hover:scale-110"
                title={project.members.map(m => m.name).join(', ')}
              >
                +{project.members.length - 3}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Unified control bar: Tabs (left) + Conditional controls (right) for tasks only */}
      <div className="flex items-center justify-between rounded-lg bg-[hsl(var(--surface))] p-2 text-[hsl(var(--fg))]">
        <div role="tablist" aria-label="Project sections" className="inline-flex items-center gap-2">
          {([
            { key: 'tasks', label: 'Tasks' },
            { key: 'comments', label: 'Comments' },
            { key: 'incident', label: 'Incident' },
          ] as const).map((t) => (
            <button
              key={t.key}
              role="tab"
              aria-selected={activeTab === t.key}
              aria-controls={`panel-${t.key}`}
              onClick={() => onTabChange(t.key)}
              className={[
                'rounded-full border px-3 py-1 text-sm focus-visible:outline-none focus-visible:ring-2 border-b-2 transition-all duration-200',
                activeTab === t.key
                  ? 'bg-[#1f3a9d] text-white border-transparent border-b-[#1f3a9d]'
                  : 'bg-[hsl(var(--surface))] text-[hsl(var(--fg))] border-[hsl(var(--border))] hover:bg-[hsl(var(--surface-muted))]',
              ].join(' ')}
            >
              {t.label}
            </button>
          ))}
        </div>
        {activeTab === 'tasks' && (
          <div className="flex items-center gap-2">
            <ViewSwitcher value={view} onChange={onChangeView} />
          </div>
        )}
      </div>

      {/* Conditional rendering of views */}
      {activeTab === 'tasks' && (
        <TasksView
          members={members}
          view={view}
          onOpenTask={onOpenTask}
          projectId={selectedProjectId}
          userId={userId}
        />
      )}
      {activeTab === 'comments' && (
        <CommentsView projectId={selectedProjectId} userId={userId} />
      )}
      {activeTab === 'incident' && (
        <IncidentsView projectId={selectedProjectId} userId={userId} />
      )}
    </div>
  )
}