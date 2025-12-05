// // TasksView.tsx
// import { useMemo, useRef, useState, useEffect } from 'react'
// import { motion } from 'framer-motion'
// import { ChevronLeft, ChevronRight } from 'lucide-react'
// import { Button } from '../../components/ui/button'
// import BoardView from '../../components/project/board/BoardView'
// import ListView from '../../components/project/list/ListView'
// import CalendarView from '../../components/project/calendar/CalendarView'
// import type { Member, Task } from '../../components/project/types'
// import RingGradientLoader from '../../components/RingGradientLoader'

// interface Props {
//   members: Member[]
//   view: 'board' | 'list' | 'calendar'
//   onOpenTask: (id: string) => void
//   projectId: number
//   userId: number
// }

// export default function TasksView({ members, view, onOpenTask, projectId, userId }: Props) {
//   const [groups, setGroups] = useState<Array<[string, Task[]]>>([])
//   const [isLoadingTasks, setIsLoadingTasks] = useState(true)

//   const formatDate = (isoString: string | null) => {
//     if (!isoString) return ''
//     const date = new Date(isoString)
//     const day = date.getUTCDate()
//     const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
//     const month = months[date.getUTCMonth()]
//     const year = date.getUTCFullYear()
//     return `${day} ${month}, ${year}`
//   }

//   useEffect(() => {
//     setIsLoadingTasks(true)
//     fetch(`http://127.0.0.1:8012/api/transaction/new_getUserTasks?user_id=${userId}&project_id=${projectId}`)
//       .then(res => res.json())
//       .then(data => {
//         if (data.status_code === 200) {
//           const apiGroups: Array<[string, Task[]]> = data.data.map((phase: any) => {
//             const stage = phase.phase_name
//             const taskList: Task[] = phase.tasks.map((t: any) => {
//               const assignees: Member[] = t.users.map((u: any) => ({
//                 id: u.user_id.toString(),
//                 name: u.user_name,
//                 avatarUrl: u.user_image ? `http://127.0.0.1:8012/api/project_files/${u.user_image}.jpg` : undefined,
//               }))
//               return {
//                 id: t.project_task_id.toString(),
//                 stage,
//                 title: `${t.project_name}: ${t.task_name}`,
//                 body: t.task_description,
//                 dueDate: formatDate(t.task_end_date),
//                 warnings: t.incident_reports_count,
//                 comments: t.task_comments_count,
//                 attachments: t.task_docs_count,
//                 assignees,
//                 label: t.task_name,
//                 labelDaysLeft: t.left_days,
//               }
//             })
//             return [stage, taskList]
//           })
//           setGroups(apiGroups)
//         }
//         setIsLoadingTasks(false)
//       })
//       .catch(err => {
//         console.error('Failed to fetch tasks:', err)
//         setIsLoadingTasks(false)
//       })
//   }, [userId, projectId])

//   const tasks = useMemo(() => groups.flatMap(([, ts]) => ts), [groups])

//   const boardRef = useRef<HTMLDivElement | null>(null)
//   // Paging state for BoardView
//   const [page, setPage] = useState(0)
//   const [totalPages, setTotalPages] = useState(1)
//   const canPrev = page > 0
//   const canNext = page < totalPages - 1
//   function goPrev() {
//     if (canPrev) setPage((p) => Math.max(0, p - 1))
//   }
//   function goNext() {
//     if (canNext) setPage((p) => Math.min(totalPages - 1, p + 1))
//   }
//   function onPageInfo(info: { current: number; total: number }) {
//     setPage(info.current)
//     setTotalPages(info.total)
//   }

//   if (isLoadingTasks) {
//     return <div className="flex items-center justify-center h-64"><RingGradientLoader /></div>
//   }

//   // FIXED: Render pager only inside BoardView if needed, but since BoardView handles its own, no extra here
//   return (
//     <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
//       {view === 'board' && (
//         <BoardView
//           groups={groups}
//           onOpenTask={onOpenTask}
//           outerRef={(el: HTMLDivElement | null) => {
//             boardRef.current = el
//           }}
//           externalPage={page}
//           onPageInfo={onPageInfo}
//         />
//       )}
//       {view === 'list' && <ListView tasks={tasks} onOpenTask={onOpenTask} />}
//       {view === 'calendar' && <CalendarView tasks={tasks} onOpenTask={onOpenTask} />}
//     </motion.div>
//   )
// }

// TasksView.tsx
import { useMemo, useRef, useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ChevronLeft, ChevronRight, Search } from 'lucide-react'
import { Button } from '../../components/ui/button'
import BoardView from '../../components/project/board/BoardView'
import ListView from '../../components/project/list/ListView'
import CalendarView from '../../components/project/calendar/CalendarView'
import type { Member, Task } from '../../components/project/types'
import RingGradientLoader from '../../components/RingGradientLoader'
import { Api_url } from '../../networkCalls/Apiurls'
import { useNavigate } from 'react-router-dom'
import { getRequestStatus } from '../../networkCalls/NetworkCalls'


interface Props {
  members: Member[]
  view: 'board' | 'list' | 'calendar'
  // onOpenTask: (id: string) => void
  projectId: number
  userId: number
}

export default function TasksView({ members, view, projectId, userId }: Props) {
  const [groups, setGroups] = useState<Array<[string, Task[]]>>([])
  const [isLoadingTasks, setIsLoadingTasks] = useState(true)
  const [isViewLoading, setIsViewLoading] = useState(false)
  const lastProjectIdRef = useRef<number | null>(null)
  const lastViewRef = useRef<string>('')
  const navigate = useNavigate()

  const formatDate = (isoString: string | null) => {
    if (!isoString) return ''
    const date = new Date(isoString)
    const day = date.getUTCDate()
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    const month = months[date.getUTCMonth()]
    const year = date.getUTCFullYear()
    return `${day} ${month}, ${year}`
  }

// Show loader for 1 second when switching to list or calendar
  useEffect(() => {
    if (view !== lastViewRef.current) {
      setIsViewLoading(true)
      const timer = setTimeout(() => {
        setIsViewLoading(false)
      }, 100)
      return () => clearTimeout(timer)
    }
    lastViewRef.current = view
  }, [view])

  // useEffect(() => {
  //   lastProjectIdRef.current = projectId
  //   setIsLoadingTasks(true)
  //   fetch(`${Api_url.myworks_tasks}?user_id=${userId}&project_id=${projectId}`)
  //     .then(res => res.json())
  //     .then(data => {
  //       if (data.status_code === 200) {
  //         const apiGroups: Array<[string, Task[]]> = data.data.map((phase: any) => {
  //           const stage = phase.phase_name
  //           const taskList: Task[] = phase.tasks.map((t: any) => {
  //             const assignees: Member[] = t.users.map((u: any) => ({
  //               id: u.user_id.toString(),
  //               name: u.user_name,
  //               avatarUrl: u.user_image ? `${Api_url.user_images}/${u.user_image}` : undefined,
  //             }))
  //             return {
  //               id: t.project_task_id.toString(),
  //               stage,
  //               // title: `${t.project_name}: ${t.task_name}`,
  //               title: `${t.project_name}`,
  //               body: t.task_description,
  //               dueDate: formatDate(t.task_end_date),
  //               warnings: t.incident_reports_count,
  //               comments: t.task_comments_count,
  //               attachments: t.task_docs_count,
  //               assignees,
  //               label: t.task_name,
  //               labelDaysLeft: t.left_days,
  //               task_status_id: t.task_status_id,
  //               task_status_name: t.task_status_name,
  //               task_order_id: t.task_order_id
  //             }
  //           })
  //           return [stage, taskList]
  //         })
  //         setGroups(apiGroups)
  //       }
  //       else {

  //       setGroups([])

  //     }
  //       setIsLoadingTasks(false)
  //     })
  //     .catch(err => {
  //       console.error('Failed to fetch tasks:', err)
  //       setIsLoadingTasks(false)
  //     })
  // }, [userId, projectId])
  useEffect(() => {
  lastProjectIdRef.current = projectId
  const fetchTasks = async () => {
    setIsLoadingTasks(true)
    const result = await getRequestStatus<any>(`${Api_url.myworks_tasks}?user_id=${userId}&project_id=${projectId}`)
    const data = result.data
    if (data.status_code === 200) {
      const apiGroups: Array<[string, Task[]]> = data.data.map((phase: any) => {
        const stage = phase.phase_name
        const taskList: Task[] = phase.tasks.map((t: any) => {
          const assignees: Member[] = t.users.map((u: any) => ({
            id: u.user_id.toString(),
            name: u.user_name,
            avatarUrl: u.user_image ? `${Api_url.user_images}/${u.user_image}` : undefined,
          }))
          return {
            id: t.project_task_id.toString(),
            stage,
            // title: `${t.project_name}: ${t.task_name}`,
            title: `${t.project_name}`,
            body: t.task_description,
            dueDate: formatDate(t.task_end_date),
            warnings: t.incident_reports_count,
            comments: t.task_comments_count,
            attachments: t.task_docs_count,
            assignees,
            label: t.task_name,
            labelDaysLeft: t.left_days,
            task_status_id: t.task_status_id,
            task_status_name: t.task_status_name,
            task_order_id: t.task_order_id,
            project_id: t.project_id,
          }
        })
        return [stage, taskList]
      })
      setGroups(apiGroups)
    }
    else {
      setGroups([])
    }
    setIsLoadingTasks(false)
  }

  fetchTasks()
}, [userId, projectId])

   const onOpenTask = (id: string): void => {
    const task = tasks.find(t => t.id === id);
    if (task) {
      navigate(`/task-documents/${id}`, {
        state: {
           projectId: task.project_id,
          projectName: task.title.split(':')[0].trim(), // Extract from "ProjectName: TaskName"
          phaseName: task.stage,
          taskName: task.label,
          dueDate: task.dueDate,
          task_order_id: task.task_order_id,
          editdocument: true
        },
      });
    }
  };


  const tasks = useMemo(() => groups.flatMap(([, ts]) => ts), [groups])

  const boardRef = useRef<HTMLDivElement | null>(null)
  // Paging state for BoardView
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const canPrev = page > 0
  const canNext = page < totalPages - 1
  function goPrev() {
    if (canPrev) setPage((p) => Math.max(0, p - 1))
  }
  function goNext() {
    if (canNext) setPage((p) => Math.min(totalPages - 1, p + 1))
  }
  function onPageInfo(info: { current: number; total: number }) {
    setPage(info.current)
    setTotalPages(info.total)
  }

  if (isLoadingTasks || isViewLoading) {
    return <div className="flex items-center justify-center h-64"><RingGradientLoader /></div>
  }

const hasNoTasks = groups.length === 0 || tasks.length === 0
  if (hasNoTasks) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col items-center justify-center h-80 text-center p-8 bg-gradient-to-r from-purple-100 to-blue-50 rounded-lg shadow-lg"
    >
      <div className="w-20 h-20 mb-6 p-4 rounded-full bg-gradient-to-br from-indigo-300 to-blue-300 flex items-center justify-center shadow-xl">
        <Search className="w-10 h-10 text-indigo-600" />
      </div>
      <h3 className="text-2xl font-bold text-gray-900 mb-3">No Tasks Found</h3>
    </motion.div>
  );
}
  // FIXED: Render pager only inside BoardView if needed, but since BoardView handles its own, no extra here
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
      {view === 'board' && (
        <BoardView
          groups={groups}
          onOpenTask={onOpenTask}
          projectId={projectId}
          outerRef={(el: HTMLDivElement | null) => {
            boardRef.current = el
          }}
          externalPage={page}
          onPageInfo={onPageInfo}
        />
      )}
      {view === 'list' && <ListView tasks={tasks} onOpenTask={onOpenTask} projectId={projectId} />}
      {view === 'calendar' && <CalendarView tasks={tasks} onOpenTask={onOpenTask} projectId={projectId} />}
    </motion.div>
  )
}