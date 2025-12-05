// import { useState, useCallback } from 'react'
// import { Calendar, Edit, Eye, MessageCircle, Paperclip, AlertTriangle, Users,  File } from 'lucide-react'  // New: Users icon
// import { motion } from 'framer-motion'
// import type { Task } from '../types'
// import RelativeTime from '../utils/RelativeTime'
// import IconActionButton from '../utils/IconActionButton'
// import AvatarGroup from '../utils/AvatarGroup'
// import { canAssignUsers, canTransferOwnership, canViewDocumentInProjectdetail } from "../../../services/permissionsService";
// import userMapIcon from '../../../assets/usermap.png';
// import userTransferIcon from '../../../assets/usertransfer.png';
// import documentIcon from '../../../assets/document.png';
// import taskworklog from '../../../assets/taskworklog.png';
// import TaskWorkLog from './TaskWorkLog'

// export interface TasksSubtableProps {
//   tasks: Task[]
//   phaseId: string
//   onOpenTask: (id: string) => void
//   onEditTask: (id: string) => void
//   onAddTask: (phaseId: string) => void
//   isAdmin?: boolean  // New
//   onOpenAssign?: (type: 'phase' | 'task', id: string, name: string) => void  // New
//    onViewDocuments?: (taskId: string) => void
//    crntUserId?: string  // New
//    onOpenTransfer?: (type: 'phase' | 'task', actualId: string, name: string, assignees: any[]) => void  // New
// }

// const labelStyles: Record<NonNullable<Task['label']>, string> = {
//   Creation: 'bg-blue-100 text-blue-700 border-blue-200',
//   Verification: 'bg-purple-100 text-purple-700 border-purple-200',
//   Execution: 'bg-indigo-100 text-indigo-700 border-indigo-200',
//   Signoff: 'bg-teal-100 text-teal-700 border-teal-200',
//   Completed: 'bg-green-100 text-green-700 border-green-200',
// }

// export default function TasksSubtable({ 
//   tasks, 
//   phaseId, 
//   onOpenTask, 
//   onEditTask, 
//   onAddTask, 
//   isAdmin = false,  // New
//   onOpenAssign,  // New
//   onViewDocuments,
//   crntUserId,  // New
//   onOpenTransfer,  // New
// }: TasksSubtableProps) {

//    // Updated state to track task for dynamic props
//   const [isWorkLogOpen, setIsWorkLogOpen] = useState(false);
//   const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);  // New: Track task ID
//   const handleOpenWorkLog = useCallback((taskId: string) => {
//     setSelectedTaskId(taskId);
//     setIsWorkLogOpen(true);
//   }, []);

//   const handleCloseWorkLog = useCallback(() => {
//     setIsWorkLogOpen(false);
//     setSelectedTaskId(null);  // Reset
//   }, []);

//   return (
//     <>
//     <motion.div
//       initial={{ opacity: 0, height: 0 }}
//       animate={{ opacity: 1, height: 'auto' }}
//       exit={{ opacity: 0, height: 0 }}
//       transition={{ duration: 0.2 }}
//       className="overflow-hidden"
//     >
//       <div className="bg-gray-50/50">
//         <div role="table" aria-label="Phase tasks" className="w-full">
//           {/* Tasks */}
//           {tasks.map((task) => {
//             const isCurrentUserInTask = crntUserId && task.assignees.some((a: any) => a.id === crntUserId);
//             const isCompleted = task.label === 'Completed'; // Adapt based on your status logic (e.g., status_id === 3 || 6)
//             const buttonClass = !isCurrentUserInTask || isCompleted ? 'opacity-50 cursor-not-allowed' : '';
//             const buttonTitle = isCurrentUserInTask 
//               ? (isCompleted ? 'The task has been completed.' : 'Transfer task ownership') 
//               : 'You are not assigned to this task';

//             return (
//               <div
//                 key={task.id}
//                 role="row" style={{ gridTemplateColumns: '60px 320px 1fr 1fr 1fr' }}
//                 className="grid  items-center gap-4 border-b border-gray-200 bg-gray-50/30 px-4 py-3 text-sm last:border-b-0 hover:bg-gray-50/50"
//               >
//                 {/* Empty cell to align with caret column */}
//                 <div role="cell" className="w-6" />

//                 {/* Title */}
//                 <div role="cell" className="min-w-0 font-medium text-[hsl(var(--fg))] truncate">
//                   {task.title}
//                 </div>

//                 {/* Status (Label) */}
//                 <div role="cell" className="flex items-center min-w-0">
//                   {task.label && (
//                     <span
//                       className={`inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium ${labelStyles[task.label]}`}
//                     >
//                       {task.label}
//                     </span>
//                   )}
//                 </div>

                

//                 {/* Assignees */}
//                 <div role="cell" className="min-w-0">
//                   <AvatarGroup members={task.assignees.slice(0, 5)} maxVisible={5} size="sm" />
//                 </div>

                

//                 {/* Meta (alerts/comments/attachments + actions) */}
//                 <div role="cell" className="flex items-center gap-2 min-w-0">
//                   <div className="flex items-center gap-1">
//                     {/* Assign Button */}
//                     <span title="Assign Users">                      
//                     <IconActionButton
//                       ariaLabel={`Assign users`}
//                       onClick={() => canAssignUsers() && onOpenAssign?.('task', task.id.replace('task-', ''), task.title)}
//                       // icon={<Users className="h-4 w-4" />}
//                       icon={<img src={userMapIcon} alt="Assign Users" className="h-4 w-4" />}
//                       disabled={!canAssignUsers()}                    
//                     />
//                    </span>                   
//                     {/* Transfer Button */}
//                      <span  title="Transfer Ownership">                      
//                     <IconActionButton
//                       ariaLabel={'Transfer Ownership'}
//                       onClick={() => (isCurrentUserInTask && !isCompleted && canTransferOwnership()) && onOpenTransfer?.('task', task.id.replace('task-', ''), task.title, task.assignees)}
//                       // icon={<Users className="h-4 w-4" />}
//                       icon={<img src={userTransferIcon} alt="Assign Users" className="h-4 w-4" />}
//                       disabled={!isCurrentUserInTask || isCompleted || !canTransferOwnership()}                     
//                     />
//                     </span>

//                     {/* Task WorkLog Button */}
//                       <span title="Task WorkLog">                 
//                         <IconActionButton
//                           ariaLabel={'Task WorkLog'}
//                           onClick={handleOpenWorkLog(task.id)}  // 👉 Added handler here
//                           // icon={<Eye className="h-4 w-4" />}
//                           icon={<img src={taskworklog} alt="Assign Users" className="h-4 w-4" />}                                          
//                         />
//                       </span>

//                     {/* View Documents Button */}
//                     <span  title="View Document">
//                       <IconActionButton
//                         ariaLabel={`View document`}
//                         onClick={() => canViewDocumentInProjectdetail() && onViewDocuments?.(task.id)}
//                         // icon={<File className="h-4 w-4" />}
//                         icon={<img src={documentIcon} alt="Assign Users" className="h-4 w-4" />}
//                         disabled={!canViewDocumentInProjectdetail()}
//                       />   
//                       </span>               
//                       </div>
//                 </div>
//               </div>
//             )
//           })}
//         </div>
//       </div>
//     </motion.div>

//       {/* TaskWorkLog Side Panel */}
//       {isWorkLogOpen && selectedTaskId && (
//         <TaskWorkLog 
//           isOpen={isWorkLogOpen} 
//           onClose={handleCloseWorkLog}
//           projectTaskId={selectedTaskId.replace('task-', '')} 
//         />
//       )}
//     </>

//   )
// }

import { useState, useCallback } from 'react'  // 👈 useCallback for all handlers
import { Calendar, Edit, Eye, MessageCircle, Paperclip, AlertTriangle, Users, File } from 'lucide-react'
import { motion } from 'framer-motion'
import type { Task } from '../types'
import RelativeTime from '../utils/RelativeTime'
import IconActionButton from '../utils/IconActionButton'
import AvatarGroup from '../utils/AvatarGroup'
import { canAssignUsers, canTransferOwnership, canViewDocumentInProjectdetail,canViewTaskWorkLog } from "../../../services/permissionsService";
import userMapIcon from '../../../assets/usermap.png';
import userTransferIcon from '../../../assets/usertransfer.png';
import documentIcon from '../../../assets/document.png';
import taskworklog from '../../../assets/taskworklog.png';
import TaskWorkLog from './TaskWorkLog'
import DecodedTokenValues from '../../../components/DecryptToken';

export interface TasksSubtableProps {
  tasks: Task[]
  phaseId: string
  onOpenTask: (id: string) => void
  onEditTask: (id: string) => void
  onAddTask: (phaseId: string) => void
  isAdmin?: boolean
  onOpenAssign?: (type: 'phase' | 'task', id: string, name: string) => void
  onViewDocuments?: (taskId: string) => void
  crntUserId?: string
  onOpenTransfer?: (type: 'phase' | 'task', actualId: string, name: string, assignees: any[]) => void
}

const labelStyles: Record<NonNullable<Task['label']>, string> = {
  Creation: 'bg-blue-100 text-blue-700 border-blue-200',
  Verification: 'bg-purple-100 text-purple-700 border-purple-200',
  Execution: 'bg-indigo-100 text-indigo-700 border-indigo-200',
  Signoff: 'bg-teal-100 text-teal-700 border-teal-200',
  Completed: 'bg-green-100 text-green-700 border-green-200',
}

export default function TasksSubtable({ 
  tasks, 
  phaseId, 
  onOpenTask, 
  onEditTask, 
  onAddTask, 
  isAdmin = false,
  onOpenAssign,
  onViewDocuments,
  crntUserId,
  onOpenTransfer,
}: TasksSubtableProps) {

  // 👈 New: Track open task for dynamic props (prevents generic panel)
  const [isWorkLogOpen, setIsWorkLogOpen] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);

  // 👈 Fixed: Memoized handlers (stable props → no child re-render loops)
  const handleOpenWorkLog = useCallback((taskId: string) => {
    setSelectedTaskId(taskId);
    setIsWorkLogOpen(true);
  }, []);

  const handleCloseWorkLog = useCallback(() => {
    setIsWorkLogOpen(false);
    setSelectedTaskId(null);
  }, []);

  // 👈 New: Memoized per-action handlers (pass task data as args; stable across renders)
  const handleAssignClick = useCallback((taskId: string, taskTitle: string) => {
    if (canAssignUsers()) {
      onOpenAssign?.('task', taskId.replace('task-', ''), taskTitle);
    }
  }, [onOpenAssign]);

  const handleTransferClick = useCallback((isCurrentUserInTask: boolean, isCompleted: boolean, taskId: string, taskTitle: string, assignees: any[]) => {
    if (isCurrentUserInTask && !isCompleted && canTransferOwnership()) {
      onOpenTransfer?.('task', taskId.replace('task-', ''), taskTitle, assignees);
    }
  }, [onOpenTransfer]);

  const handleViewDocumentsClick = useCallback((taskId: string) => {
    if (canViewDocumentInProjectdetail()) {
      onViewDocuments?.(taskId);
    }
  }, [onViewDocuments]);
  return (
    <>
      <motion.div
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: 'auto' }}
        exit={{ opacity: 0, height: 0 }}
        transition={{ duration: 0.2 }}
        className="overflow-hidden"
      >
        <div className="bg-gray-50/50">
          <div role="table" aria-label="Phase tasks" className="w-full">
            {/* Tasks */}
            {tasks.map((task) => {
              const isCurrentUserInTask = crntUserId && task.assignees.some((a: any) => a.id === crntUserId);
              const isCompleted = task.task_status_id === 3;
              const isNotStarted = task.task_status_id === 8;
              const actualTaskId = task.id.replace('task-', '');  // 👈 Pre-compute for handlers

              return (
                <div
                  key={task.id}
                  role="row" style={{ gridTemplateColumns: '60px 320px 1fr 1fr 1fr' }}
                  className="grid items-center gap-4 border-b border-gray-200 bg-gray-50/30 px-4 py-3 text-sm last:border-b-0 hover:bg-gray-50/50"
                >
                  {/* Empty cell to align with caret column */}
                  <div role="cell" className="w-6" />

                  {/* Title */}
                  <div role="cell" className="min-w-0 font-medium text-[hsl(var(--fg))] truncate">
                    {task.title}
                  </div>

                  {/* Status (Label) */}
                  <div role="cell" className="flex items-center min-w-0">
                    {task.task_status_name && (
                      <span
                        className={`inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium ${labelStyles[task.task_status_name]}`}
                      >
                        {task.task_status_name}
                      </span>
                    )}
                  </div>

                  {/* Assignees */}
                  <div role="cell" className="min-w-0">
                    <AvatarGroup members={task.assignees.slice(0, 5)} maxVisible={5} size="sm" />
                  </div>

                  {/* Meta (alerts/comments/attachments + actions) */}
                  <div role="cell" className="flex items-center gap-2 min-w-0">
                    <div className="flex items-center gap-1">
                      {/* Assign Button - 👈 Now stable onClick */}
                      <span title="Assign Users">                      
                        <IconActionButton
                          ariaLabel={`Assign users`}
                          onClick={() => handleAssignClick(task.id, task.title)}  // 👈 Memoized + task-specific
                          icon={<img src={userMapIcon} alt="Assign Users" className="h-4 w-4" />}
                          disabled={!canAssignUsers() || isCompleted}                    
                        />
                      </span>                   
                      {/* Transfer Button - 👈 Now stable */}
                      <span title="Transfer Ownership">                      
                        <IconActionButton
                          ariaLabel={'Transfer Ownership'}
                          onClick={() => handleTransferClick(isCurrentUserInTask, isCompleted, task.id, task.title, task.assignees)}  // 👈 Memoized
                          icon={<img src={userTransferIcon} alt="Transfer Ownership" className="h-4 w-4" />}
                          disabled={!isCurrentUserInTask || isCompleted || !canTransferOwnership()}                     
                        />
                      </span>

                      {/* Task WorkLog Button - Already stable */}
                      <span title="Task WorkLog">                 
                        <IconActionButton
                          ariaLabel={'Task WorkLog'}
                          onClick={() => handleOpenWorkLog(task.id)}
                          icon={<img src={taskworklog} alt="Task WorkLog" className="h-4 w-4" />}
                          disabled={!(isCurrentUserInTask || canViewTaskWorkLog())}                                          
                        />
                      </span>

                      {/* View Documents Button - 👈 Now stable */}
                      <span title="View Document">
                        <IconActionButton
                          ariaLabel={`View document`}
                          onClick={() => handleViewDocumentsClick(task.id)}  // 👈 Memoized
                          icon={<img src={documentIcon} alt="View Document" className="h-4 w-4" />}
                          disabled={!canViewDocumentInProjectdetail() || isNotStarted}
                        />   
                      </span>               
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </motion.div>

      {/* TaskWorkLog Side Panel */}
      {isWorkLogOpen && selectedTaskId && (
        <TaskWorkLog 
          isOpen={isWorkLogOpen} 
          onClose={handleCloseWorkLog}
          projectTaskId={selectedTaskId.replace('task-', '')}
        />
      )}
    </>
  )
}