// TaskCard.tsx
import { motion } from 'framer-motion'
import { cn } from '../ui/utils'
import type { Member, Task } from './types'
import { AlertTriangle, MessageSquareText, Paperclip, MoreHorizontal } from 'lucide-react'
import { canViewDocumentInTasks } from "../../services/permissionsService";

export interface TaskCardProps {
  task: Task
  onOpen?: (id: string) => void
  className?: string
  projectId: number
}

function getAvatarBg(name: string) {
  const colors = ['bg-red-500', 'bg-blue-500', 'bg-green-500', 'bg-yellow-500', 'bg-purple-500', 'bg-pink-500', 'bg-indigo-500', 'bg-orange-500']
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash)
  }
  const index = Math.abs(hash) % colors.length
  return colors[index]
}

function TinyAvatars({ people }: { people: Member[] }) {
  return (
    <div className="flex -space-x-2">
      {people.slice(0, 3).map((m) => {
        const initial = m.name.charAt(0).toUpperCase()
        const avatarBg = getAvatarBg(m.name)
        return (
          <div
            key={m.id}
            className={cn(
              "h-6 w-6 rounded-full border-2 border-white shadow-sm relative hover:z-10 overflow-hidden flex items-center justify-center text-xs font-medium text-white transition-transform duration-300 hover:scale-110",
              avatarBg
            )}
            title={m.name}
          >
            <span>{initial}</span>
            {m.avatarUrl && (
              <img
                src={m.avatarUrl}
                alt={m.name}
                className="absolute inset-0 w-full h-full object-cover"
                onError={(e) => (e.currentTarget.style.display = 'none')}
              />
            )}
          </div>
        )
      })}
      {people.length > 3 && (
        <div 
          className="h-6 w-6 rounded-full border-2 border-white bg-gray-300 flex items-center justify-center text-xs font-medium text-gray-700"
          title={people.map(p => p.name).join(', ')}
        >
          +{people.length - 3}
        </div>
      )}
    </div>
  )
}

export default function TaskCard({ task, className, onOpen, projectId }: TaskCardProps) {
  const days = task.labelDaysLeft ?? 0
  const label = task.label ?? ''
  const getLabelBg = (labelStr: string) => {
    const colors = ['bg-red-500', 'bg-blue-500', 'bg-green-500', 'bg-yellow-500', 'bg-purple-500', 'bg-pink-500', 'bg-indigo-500', 'bg-orange-500']
    let hash = 0
    for (let i = 0; i < labelStr.length; i++) {
      hash = labelStr.charCodeAt(i) + ((hash << 5) - hash)
    }
    const index = Math.abs(hash) % colors.length
    return colors[index]
  }
  const labelBg = getLabelBg(label)
  const labelText = 'text-white'

  const hasPermission = canViewDocumentInTasks()
  const isStatusClickable =
    // task.task_status_name === "Active" || task.task_status_name === "Reverted"
    task.task_status_id === 1 || task.task_status_id === 5

  const isClickable = hasPermission && isStatusClickable


  const handleClick = () => {
    // if (hasPermission) {
      onOpen?.(task.id); // If permission is allowed, open the task
    // } else {
      // alert("You do not have permission to click this task.");
    // }
  };

  return (
    <motion.article
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      // tabIndex={0}
      // // onClick={() => onOpen?.(task.id)}
      // // onKeyDown={(e) => { if (e.key === 'Enter') onOpen?.(task.id) }}
      // onClick={handleClick}  // Use the handleClick here
      // onKeyDown={(e) => { if (e.key === 'Enter') handleClick() }}
      // className={cn(
      //   'group relative cursor-pointer overflow-hidden rounded-lg border border-gray-200 bg-white p-0 shadow-sm outline-none transition-all duration-200 hover:shadow-md focus-visible:ring-2 focus-visible:ring-blue-500',
      tabIndex={isClickable ? 0 : -1}

      onClick={isClickable ? handleClick : undefined}

      onKeyDown={isClickable ? (e) => { if (e.key === 'Enter') handleClick() } : undefined}

      className={cn(

        'group relative overflow-hidden rounded-lg border border-gray-200 bg-white p-0 shadow-sm outline-none transition-all duration-200',

        isClickable 

          ? 'cursor-pointer hover:shadow-md focus-visible:ring-2 focus-visible:ring-blue-500'

          : 'cursor-not-allowed',

      className,
      )}
    >
      {/* Header bar */}
      <div
        className={cn(
          'flex h-8 items-center justify-between rounded-t-lg px-3 text-xs font-bold',
          labelBg,
          labelText
        )}
        role="heading"
        aria-level={3}
      >
        {/* <span>{label}{days ? ` (${days} days left)` : ''}</span> */}
        <span className='capitalize'>{label}</span>
        {projectId === 0 && (
        <h3
        className="text-white bg-[#ffffff26] px-2 py-0.5 rounded text-xs font-semibold truncate max-w-[50%] text-right"
        title={task.title} // Hover shows the full title
        >
        {task.title}
        </h3>
          )}
        {/* <button
          type="button"
          aria-label="Open quick menu"
          className="inline-flex h-6 w-6 items-center justify-center rounded text-white/90 hover:bg-white/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
          onClick={(e) => {
            e.stopPropagation()
            // TODO: hook up DropdownMenu
          }}
        >
          <MoreHorizontal className="h-4 w-4" />
        </button> */}
      </div>

      {/* Content */}
      <div className="p-3">
        {/* Title */}
        {/* {projectId === 0 && (
          // <h3 className="text-sm font-semibold text-[white] font-semibold line-clamp-2 bg-gray-800 px-[7px] py-[3px] rounded-[5px] mb-2">
          <h3 className="text-sm font-semibold text-[] font-semibold">
          {task.title}
          </h3>
        )} */}
        <div className={'flex justify-between'}>
        {/* <h3 className="text-sm font-semibold text-gray-900 line-clamp-2"> */}
          {/* {task.label} */}
        {/* </h3> */}
         <h3 className={`text-sm font-semibold {} text-blue-900 line-clamp-2`}>
          {task.task_status_name}
          {/* Pending */}
        </h3>
        </div>
        {/* Description */}
        {task.body && (
          <p className="mt-1 text-xs text-gray-500 line-clamp-2">
            {task.body}
          </p>
        )}

        {/* Avatars */}
        {task.assignees?.length > 0 && (
          <div className="mt-2">
            <TinyAvatars people={task.assignees} />
          </div>
        )}

        {/* Footer */}
        <div className="mt-3 pt-2 border-t border-gray-100">
          <div className="flex items-center justify-between">
            {/* Icons row */}
            <div className="flex items-center gap-1">
              <span className="flex items-center gap-1 hover:bg-[#afedaa] rounded-[8px] px-[6px] py-[2px] text-xs text-[#1f3a9d] hover:text-black transition-colors duration-300 ease-in-out">
              <AlertTriangle className="h-3.5 w-3.5" />
              <span>{task.warnings ?? 0}</span>
              </span>
              <span className="flex items-center gap-1 text-xs hover:bg-[#bfaaed] rounded-[8px] px-[6px] py-[2px] text-[#1f3a9d] hover:text-black transition-colors duration-300 ease-in-out">
                <MessageSquareText className="h-3.5 w-3.5" />
                <span>{task.comments ?? 0}</span>
              </span>
              <span className="flex items-center gap-1 text-xs hover:bg-[#edcfaa] rounded-[8px] px-[6px] py-[2px] text-[#1f3a9d] hover:text-black transition-colors duration-300 ease-in-out">
                <Paperclip className="h-3.5 w-3.5" />
                <span>{task.attachments ?? 0}</span>
              </span>
            </div>

            {/* Due date */}
            {/* {task.dueDate && (
              <span className="text-xs font-medium text-[#1f3a9d]">
                {task.dueDate}
              </span>
            )} */}
          </div>
        </div>
      </div>
    </motion.article>
  )
}