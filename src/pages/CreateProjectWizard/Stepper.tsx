import { Check } from 'lucide-react'

export function Stepper({ 
  current, 
  onStepClick, 
  allowAdvance, 
  isEditMode = false 
}: { 
  current: 1|2|3; 
  onStepClick: (s: 1|2|3) => void; 
  allowAdvance: boolean 
  isEditMode?: boolean 
}) {
  const steps: Array<{ key: 1|2|3; title: string; desc: string }> = isEditMode ? [
    { key: 1, title: 'Edit Project Details', desc: 'Update details about project' },
    { key: 2, title: 'Edit Risk Assessment', desc: 'Update required phases' },
    { key: 3, title: 'Edit Team Members', desc: 'Update asset assignments' },
  ] : [
    { key: 1, title: 'Project Details', desc: 'Give details about project' },
    { key: 2, title: 'Risk Assessment', desc: 'Select required phases' },
    { key: 3, title: 'Team Members', desc: 'Attach asset to project' },
  ]
  return (
    <ol className="flex items-center gap-2 px-4 py-2 border-b border-[#D8DDE4] bg-white sticky top-[56px] z-10">
      {steps.map((s, idx) => {
        const isActive = current === s.key
        const isCompleted = s.key < current
        const canClick = s.key <= current || (allowAdvance && s.key > current)
        return (
          <li key={s.key} className="flex flex-1 items-center min-w-0 gap-2">
            <button
              // type="button"
              onClick={() => canClick && onStepClick(s.key)}
              aria-current={isActive ? 'step' : undefined}
              aria-disabled={!canClick}
              disabled={!canClick}
              className={[
                'w-full text-left flex items-center gap-3 rounded-lg px-4 py-3 transition-colors focus-visible:outline-none',
                isActive
                  ? 'bg-[#1f3a9d]/10'
                  : isCompleted
                  ? 'bg-[#F3F4F6]'
                  : 'hover:bg-black/5',
                canClick
                  ? 'cursor-pointer focus-visible:ring-2 focus-visible:ring-[#1f3a9d]'
                  : 'cursor-not-allowed opacity-60',
              ].join(' ')}
            >
              <span
                className={[
                  'inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-semibold',
                  isActive || isCompleted
                    ? 'bg-[#1f3a9d] text-white'
                    : 'bg-gray-200 text-gray-700',
                ].join(' ')}
              >
                {isCompleted ? <Check className="h-4 w-4" aria-hidden /> : String(s.key).padStart(2, '0')}
              </span>
              <span className="flex min-w-0 flex-col">
                <span className={[
                  'truncate text-sm font-medium',
                  isActive ? 'text-[#1f3a9d]' : isCompleted ? 'text-gray-900' : 'text-gray-500',
                ].join(' ')}>{s.title}</span>
                <span className={[
                  'truncate text-xs',
                  isActive ? 'text-gray-600' : 'text-gray-500',
                ].join(' ')}>{s.desc}</span>
              </span>
            </button>
            {idx < steps.length - 1 && <div className="mx-1 h-px flex-1 bg-[#D8DDE4]" aria-hidden />}
          </li>
        )
      })}
    </ol>
  )
}
