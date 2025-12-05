export type StatusKind = 'danger' | 'success' | 'info' | 'warning'

export interface ProjectItem {
  id: string
  name: string
  taskCount: number
  status: StatusKind
}
