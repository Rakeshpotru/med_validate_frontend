// import { useState, useMemo, useEffect, useRef } from 'react'
// import { ArrowUpDown } from 'lucide-react'
// import type { Phase } from '../types'
// import PhaseRow from './PhaseRow'

// export interface PhasesTableProps {
//   phases: Phase[]
//   initialExpanded?: string[]
//   onOpenTask: (taskId: string) => void
//   onEditTask: (taskId: string) => void
//   onEditPhase: (phaseId: string) => void
//   onViewPhase: (phaseId: string) => void
//   onAddTask: (phaseId: string) => void
//   onExpandedChange?: (expanded: string[]) => void
// }

// type SortColumn = 'name' | 'status' | 'updated' | 'dueDate' | null
// type SortDirection = 'asc' | 'desc'
// type FilterOption = 'all' | 'open' | 'completed'

// export default function PhasesTable({
//   phases,
//   initialExpanded = [],
//   onOpenTask,
//   onEditTask,
//   onEditPhase,
//   onViewPhase,
//   onAddTask,
//   onExpandedChange,
// }: PhasesTableProps) {
//   const [expandedPhases, setExpandedPhases] = useState<Set<string>>(new Set(initialExpanded))
//   const [sortColumn, setSortColumn] = useState<SortColumn>(null)
//   const [sortDirection, setSortDirection] = useState<SortDirection>('asc')
//   const [filter, setFilter] = useState<FilterOption>('all')

//   const handleToggleExpand = (phaseId: string) => {
//     setExpandedPhases((prev) => {
//       const next = new Set(prev)
//       if (next.has(phaseId)) {
//         next.delete(phaseId)
//       } else {
//         next.add(phaseId)
//       }
//       return next
//     })
//   }

//   // Keep the latest callback in a ref (avoid effect re-running due to new fn identity)
//   const expandedCbRef = useRef<PhasesTableProps['onExpandedChange']>(onExpandedChange)
//   useEffect(() => {
//     expandedCbRef.current = onExpandedChange
//   }, [onExpandedChange])

//   // Notify parent only when expandedPhases actually changes
//   useEffect(() => {
//     expandedCbRef.current?.(Array.from(expandedPhases))
//   }, [expandedPhases])

//   const handleSort = (column: SortColumn) => {
//     if (sortColumn === column) {
//       setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'))
//     } else {
//       setSortColumn(column)
//       setSortDirection('asc')
//     }
//   }

//   const sortedAndFilteredPhases = useMemo(() => {
//     let result = [...phases]

//     // Filter
//     if (filter === 'open') {
//       result = result.filter((p) => p.status !== 'Completed')
//     } else if (filter === 'completed') {
//       result = result.filter((p) => p.status === 'Completed')
//     }

//     // Sort
//     if (sortColumn) {
//       result.sort((a, b) => {
//         let aVal: string | number | Date
//         let bVal: string | number | Date

//         switch (sortColumn) {
//           case 'name':
//             aVal = a.name
//             bVal = b.name
//             break
//           case 'status':
//             aVal = a.status
//             bVal = b.status
//             break
//           case 'updated':
//             aVal = a.updatedAt.getTime()
//             bVal = b.updatedAt.getTime()
//             break
//           case 'dueDate':
//             aVal = new Date(a.dueDate).getTime()
//             bVal = new Date(b.dueDate).getTime()
//             break
//           default:
//             return 0
//         }

//         if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1
//         if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1
//         return 0
//       })
//     }

//     return result
//   }, [phases, filter, sortColumn, sortDirection])

//   const SortButton = ({ column, children }: { column: SortColumn; children: React.ReactNode }) => (
//     <button
//       type="button"
//       onClick={() => handleSort(column)}
//       className="inline-flex items-center gap-1 font-semibold text-[hsl(var(--fg))]/80 transition-colors hover:text-[hsl(var(--fg))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1f3a9d]"
//       aria-label={`Sort by ${children}`}
//     >
//       {children}
//       <ArrowUpDown
//         className={`h-3.5 w-3.5 transition-opacity ${sortColumn === column ? 'opacity-100' : 'opacity-40'}`}
//         aria-hidden="true"
//       />
//     </button>
//   )

//   return (
//     <div className="rounded-lg bg-white shadow-sm">
//       {/* Filter Controls */}
//       <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
//         <h2 className="text-lg font-semibold text-[hsl(var(--fg))]">Phases</h2>
//         <div className="flex items-center gap-2">
//           <label htmlFor="phase-filter" className="text-sm font-medium text-[hsl(var(--fg))]/70">
//             Filter:
//           </label>
//           <select
//             id="phase-filter"
//             value={filter}
//             onChange={(e) => setFilter(e.target.value as FilterOption)}
//             className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm text-[hsl(var(--fg))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1f3a9d]"
//           >
//             <option value="all">All</option>
//             <option value="open">Open</option>
//             <option value="completed">Completed</option>
//           </select>
//         </div>
//       </div>

//       {/* Table */}
//       <div role="table" aria-label="Project phases" className="w-full">
//         {/* Header */}
//         <div
//           role="row"
//           className="grid grid-cols-[auto_1.5fr_1fr_1.5fr_1.5fr_1.5fr_auto] gap-4 border-b border-gray-200 bg-gray-50 px-4 py-2 text-xs uppercase tracking-wide text-[hsl(var(--fg))]/60"
//         >
//           <div role="columnheader" aria-label="Expand/collapse control" />
//           <div role="columnheader">
//             <SortButton column="name">Name</SortButton>
//           </div>
//           <div role="columnheader">
//             <SortButton column="status">Status</SortButton>
//           </div>
          
//           <div role="columnheader">Assignee</div>
          
//           <div role="columnheader">Actions</div>
//         </div>

//         {/* Rows */}
//         <div role="rowgroup">
//           {sortedAndFilteredPhases.map((phase) => (
//             <PhaseRow
//               key={phase.id}
//               phase={phase}
//               isExpanded={expandedPhases.has(phase.id)}
//               onToggleExpand={handleToggleExpand}
//               onOpenTask={onOpenTask}
//               onEditTask={onEditTask}
//               onEditPhase={onEditPhase}
//               onViewPhase={onViewPhase}
//               onAddTask={onAddTask}
//             />
//           ))}
//         </div>
//       </div>

//       {sortedAndFilteredPhases.length === 0 && (
//         <div className="px-4 py-8 text-center text-sm text-[hsl(var(--fg))]/60">No phases found.</div>
//       )}
//     </div>
//   )
// }


import { useState, useMemo, useEffect, useRef } from 'react'
import { ArrowUpDown } from 'lucide-react'
import type { Phase } from '../types'
import PhaseRow from './PhaseRow'

export interface PhasesTableProps {
  phases: Phase[]
  initialExpanded?: string[]
  onOpenTask: (taskId: string) => void
  onEditTask: (taskId: string) => void
  onEditPhase: (phaseId: string) => void
  onViewPhase: (phaseId: string) => void
  onAddTask: (phaseId: string) => void
  onExpandedChange?: (expanded: string[]) => void
  isAdmin?: boolean  // New: for admin-only features
  onOpenAssign?: (type: 'phase' | 'task', id: string, name: string) => void  // New: assign handler
  onViewDocuments?: (taskId: string) => void  // New: documents view handler
  crntUserId?: string  // New: for ownership checks
  onOpenTransfer?: (type: 'phase' | 'task', actualId: string, name: string, assignees: any[]) => void  // New: transfer handler
}

type SortColumn = 'name' | 'status' | 'updated' | 'dueDate' | null
type SortDirection = 'asc' | 'desc'
type FilterOption = 'all' | 'active' | 'completed' | 'closed' | 'not yet started'

export default function PhasesTable({
  phases,
  initialExpanded = [],
  onOpenTask,
  onEditTask,
  onEditPhase,
  onViewPhase,
  onAddTask,
  onExpandedChange,
  isAdmin = false,  // New
  onOpenAssign,  // New
  onViewDocuments,
  crntUserId,  // New
  onOpenTransfer,  // New
}: PhasesTableProps) {
  const [expandedPhases, setExpandedPhases] = useState<Set<string>>(new Set(initialExpanded))
  const [sortColumn, setSortColumn] = useState<SortColumn>(null)
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc')
  const [filter, setFilter] = useState<FilterOption>('all')

  const handleToggleExpand = (phaseId: string) => {
    setExpandedPhases((prev) => {
      const next = new Set(prev)
      if (next.has(phaseId)) {
        next.delete(phaseId)
      } else {
        next.add(phaseId)
      }
      return next
    })
  }

  // Keep the latest callback in a ref (avoid effect re-running due to new fn identity)
  const expandedCbRef = useRef<PhasesTableProps['onExpandedChange']>(onExpandedChange)
  useEffect(() => {
    expandedCbRef.current = onExpandedChange
  }, [onExpandedChange])

  // Notify parent only when expandedPhases actually changes
  useEffect(() => {
    expandedCbRef.current?.(Array.from(expandedPhases))
  }, [expandedPhases])

  const handleSort = (column: SortColumn) => {
    if (sortColumn === column) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortColumn(column)
      setSortDirection('asc')
    }
  }

  const sortedAndFilteredPhases = useMemo(() => {
    let result = [...phases]

    // Filter
    if (filter === 'active') {
      result = result.filter((p) => p.status == 'Active')
    } else if (filter === 'closed') {
      result = result.filter((p) => p.status === 'Closed')
    } else if (filter === 'not yet started') {
      result = result.filter((p) => p.status === 'Not Yet Started')
    }

    // Sort
    if (sortColumn) {
      result.sort((a, b) => {
        let aVal: string | number | Date
        let bVal: string | number | Date

        switch (sortColumn) {
          case 'name':
            aVal = a.name
            bVal = b.name
            break
          case 'status':
            aVal = a.status
            bVal = b.status
            break
          case 'updated':
            aVal = a.updatedAt.getTime()
            bVal = b.updatedAt.getTime()
            break
          case 'dueDate':
            aVal = new Date(a.dueDate).getTime()
            bVal = new Date(b.dueDate).getTime()
            break
          default:
            return 0
        }

        if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1
        if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1
        return 0
      })
    }

    return result
  }, [phases, filter, sortColumn, sortDirection])

  const SortButton = ({ column, children }: { column: SortColumn; children: React.ReactNode }) => (
    <button
      type="button"
      onClick={() => handleSort(column)}
      className="inline-flex items-center gap-1 font-semibold text-[hsl(var(--fg))]/80 transition-colors hover:text-[hsl(var(--fg))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1f3a9d]"
      aria-label={`Sort by ${children}`}
    >
      {children}
      <ArrowUpDown
        className={`h-3.5 w-3.5 transition-opacity ${sortColumn === column ? 'opacity-100' : 'opacity-40'}`}
        aria-hidden="true"
      />
    </button>
  )

  return (
    <div className="rounded-lg bg-white shadow-sm">
      {/* Filter Controls */}
      <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
        <h2 className="text-lg font-semibold text-[hsl(var(--fg))]">Phases</h2>
        <div className="flex items-center gap-2">
          <label htmlFor="phase-filter" className="text-sm font-medium text-[hsl(var(--fg))]/70">
            Filter:
          </label>
          <select
            id="phase-filter"
            value={filter}
            onChange={(e) => setFilter(e.target.value as FilterOption)}
            className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm text-[hsl(var(--fg))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1f3a9d]"
          >
            <option value="all">All </option>
            <option value="not yet started">Not Yet Started</option>
            <option value="active">Active</option>
            <option value="closed">Closed</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div role="table" aria-label="Project phases" className="w-full">
        {/* Header */}
        <div
          role="row"  style={{ gridTemplateColumns: '60px 320px 1fr 1fr 1fr' }}
  className="grid  gap-4 border-b border-gray-200 bg-gray-50 px-4 py-2 text-xs uppercase tracking-wide text-[hsl(var(--fg))]/60"
        >
          <div className='w-[60px]' role="columnheader" aria-label="Expand/collapse control" />
          <div role="columnheader">
            <SortButton column="name">Name</SortButton>
          </div>
          <div role="columnheader">
            <SortButton column="status">Status</SortButton>
          </div>
          
          <div role="columnheader">Assignee</div>
          
          <div role="columnheader">Actions</div>
        </div>

        {/* Rows */}
        <div role="rowgroup">
          {sortedAndFilteredPhases.map((phase) => (
            <PhaseRow
              key={phase.id}
              phase={phase}
              isExpanded={expandedPhases.has(phase.id)}
              onToggleExpand={handleToggleExpand}
              onOpenTask={onOpenTask}
              onEditTask={onEditTask}
              onEditPhase={onEditPhase}
              onViewPhase={onViewPhase}
              onAddTask={onAddTask}
              isAdmin={isAdmin}  // New
              onOpenAssign={onOpenAssign}  // New
              onViewDocuments={onViewDocuments}
              crntUserId={crntUserId}  // New
              onOpenTransfer={onOpenTransfer}  // New
            />
          ))}
        </div>
      </div>

      {sortedAndFilteredPhases.length === 0 && (
        <div className="px-4 py-8 text-center text-sm text-[hsl(var(--fg))]/60">No phases found.</div>
      )}
    </div>
  )
}