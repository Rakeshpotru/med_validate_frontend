// types.ts
export type StageKey = string

export interface Member {
  id: string
  name: string
  avatarUrl?: string
}

export interface Project {
  id: string
  title: string
  dueDate: string
  progressPct: number
  members: Member[]
}

export interface Task {
  id: string
  stage: StageKey
  title: string
  body: string
  dueDate: string
  warnings?: number
  comments?: number
  attachments?: number
  assignees: Member[]
  label?: string
  labelDaysLeft?: number
  task_status_id: number
  task_status_name: string
  task_order_id: number
}

// ------------------------------------------
export type PhaseStatus = 'In-Progress' | 'Completed' | 'Not Started' | 'Working on' | 'Closed' | 'Active' | 'Not Yet Started'
export interface Phase {
  id: string
  name: StageKey
  status: PhaseStatus
  updatedAt: Date
  assignees: Member[]
  lead?: Member
  dueDate: string
  tasks: Task[]
}