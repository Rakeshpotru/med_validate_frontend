import type { PhaseStatus } from '../types'

export interface StatusBadgeProps {
  status: PhaseStatus
}

const statusStyles: Record<PhaseStatus, string> = {
  'In-Progress': 'bg-orange-100 text-orange-700 border-orange-200',
  'Completed': 'bg-green-100 text-green-700 border-green-200',
  'Not Started': 'bg-gray-100 text-gray-600 border-gray-200',
  'Working on': 'bg-pink-100 text-pink-700 border-pink-200',
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium ${statusStyles[status]}`}
      role="status"
      aria-label={`Status: ${status}`}
    >
      {status}
    </span>
  )
}
