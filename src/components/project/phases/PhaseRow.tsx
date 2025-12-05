import { useId, useRef, useEffect } from 'react'
import { ChevronRight, Calendar, Edit, Eye, Users } from 'lucide-react'  // New: Users icon
import { motion, AnimatePresence } from 'framer-motion'
import type { Phase } from '../types'
import StatusBadge from '../utils/StatusBadge'
import RelativeTime from '../utils/RelativeTime'
import AvatarGroup from '../utils/AvatarGroup'
import IconActionButton from '../utils/IconActionButton'
import TasksSubtable from './TasksSubtable'
import { canAssignUsers, canTransferOwnership } from "../../../services/permissionsService";
import userMapIcon from '../../../assets/usermap.png';
import userTransferIcon from '../../../assets/usertransfer.png';

export interface PhaseRowProps {
  phase: Phase
  isExpanded: boolean
  onToggleExpand: (phaseId: string) => void
  onOpenTask: (taskId: string) => void
  onEditTask: (taskId: string) => void
  onEditPhase: (phaseId: string) => void
  onViewPhase: (phaseId: string) => void
  onAddTask: (phaseId: string) => void
  isAdmin?: boolean  // New
  onOpenAssign?: (type: 'phase' | 'task', id: string, name: string) => void  // New
  onViewDocuments?: (taskId: string) => void 
  crntUserId?: string  // New
  onOpenTransfer?: (type: 'phase' | 'task', actualId: string, name: string, assignees: any[]) => void  // New
}

export default function PhaseRow({
  phase,
  isExpanded,
  onToggleExpand,
  onOpenTask,
  onEditTask,
  onEditPhase,
  onViewPhase,
  onAddTask,
  isAdmin = false,  // New
  onOpenAssign,  // New
  onViewDocuments,
  crntUserId,  // New
  onOpenTransfer,  // New
}: PhaseRowProps) {
  const expandedRegionId = useId()
  const caretButtonRef = useRef<HTMLButtonElement>(null)
  const firstTaskRef = useRef<HTMLDivElement>(null)

  const isCurrentUserInPhase = crntUserId && phase.assignees.some((a: any) => a.id === crntUserId);

  // Focus management
  useEffect(() => {
    if (isExpanded && firstTaskRef.current) {
      // When expanding, move focus to first task
      const firstFocusable = firstTaskRef.current.querySelector('button') as HTMLElement
      firstFocusable?.focus()
    }
  }, [isExpanded])

  const handleToggle = () => {
    onToggleExpand(phase.id)
    // When collapsing, focus returns to caret button automatically
    if (isExpanded) {
      setTimeout(() => caretButtonRef.current?.focus(), 100)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      handleToggle()
    }
  }

  return (
    <>
      <div
        role="row"  style={{ gridTemplateColumns: '60px 320px 1fr 1fr 1fr' }}
  className="grid  gap-4 border-b border-gray-200 bg-gray-50 px-4 py-2 text-xs uppercase tracking-wide text-[hsl(var(--fg))]/60"
      >
        {/* Expand/Collapse Caret */}
        <div role="cell">
          <button
            ref={caretButtonRef}
            type="button"
            aria-expanded={isExpanded}
            aria-controls={expandedRegionId}
            aria-label={isExpanded ? `Collapse ${phase.name} phase` : `Expand ${phase.name} phase`}
            onClick={handleToggle}
            onKeyDown={handleKeyDown}
            className="inline-flex h-6 w-6 items-center justify-center rounded text-[hsl(var(--fg))]/60 transition-transform hover:bg-[hsl(var(--surface-muted))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1f3a9d]"
          >
            <motion.div
              initial={false}
              animate={{ rotate: isExpanded ? 90 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <ChevronRight className="h-4 w-4" aria-hidden="true" />
            </motion.div>
          </button>
        </div>

        {/* Name */}
        <div role="cell" className="font-semibold text-[hsl(var(--fg))]">
          {phase.name}
        </div>

        {/* Status */}
        <div role="cell">
          <StatusBadge status={phase.status} />
        </div>

        {/* Last Updated */}
        

        {/* Assignee */}
<div role="cell">
  {phase.assignees.length > 0 ? (
    <AvatarGroup members={phase.assignees.slice(0, 5)} maxVisible={5} size="sm" />
  ) : (
    <span className="text-gray-400">---</span>
  )}
</div>

        

        {/* Actions */}
        <div role="cell" className="flex items-center gap-1">
          {/* Assign Users Button */}
          <span title="Assign Users">
          {/* <IconActionButton
            ariaLabel={`Assign users`}
            onClick={() => onOpenAssign?.('phase', phase.id.replace('phase-', ''), phase.name)}
            // icon={<Users className="h-4 w-4" />}
            icon={<img src={userMapIcon} alt="Assign Users" className="h-4 w-4" />}
            disabled={!canAssignUsers()}
          /> */}
          </span>
          {/* Transfer Ownership Button */}
          <span title="Transfer Ownership">
          {/* <IconActionButton
            ariaLabel={`Transfer Ownership`}
            onClick={() => onOpenTransfer?.('phase', phase.id.replace('phase-', ''), phase.name, phase.assignees)}
            icon={<img src={userTransferIcon} alt="Assign Users" className="h-4 w-4" />}
            // icon={<Users className="h-4 w-4" />}
            disabled={!(canTransferOwnership() && crntUserId && isCurrentUserInPhase)}
          /> */}
          ---
          </span>
        </div>
      </div>

      {/* Expanded Tasks Region */}
      <AnimatePresence initial={false}>
        {isExpanded && (
          <div id={expandedRegionId} ref={firstTaskRef} aria-label={`${phase.name} tasks`}>
            {/* Pass props to subtable (new) */}
            <TasksSubtable
              tasks={phase.tasks}
              phaseId={phase.id}
              onOpenTask={onOpenTask}
              onEditTask={onEditTask}
              onAddTask={onAddTask}
              isAdmin={isAdmin}
              onOpenAssign={onOpenAssign}
              onViewDocuments={onViewDocuments}
              crntUserId={crntUserId}  // New
              onOpenTransfer={onOpenTransfer}  // New
            />
          </div>
        )}
      </AnimatePresence>
    </>
  )
}