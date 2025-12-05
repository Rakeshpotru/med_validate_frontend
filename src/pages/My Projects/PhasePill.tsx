type PhaseCode = 'URS' | 'FRS' | 'IQ' | 'DQ' | 'PQ' | 'OQ' | string

type BaseTheme = {
  bg: string
  fg: string
  border?: string
  name?: string
}

type ThemeVariant = {
  default: Record<string, BaseTheme>
  dialog: Record<string, BaseTheme>
}

const COLORS: ThemeVariant = {
  // Default variant (rounded pills)
  default: {
    URS: { bg: 'bg-blue-100', fg: 'text-blue-700' },
    FRS: { bg: 'bg-fuchsia-100', fg: 'text-fuchsia-700' },
    IQ: { bg: 'bg-teal-100', fg: 'text-teal-700' },
    DQ: { bg: 'bg-red-100', fg: 'text-red-700' },
  },
  // Dialog variant (rectangular with left border)
  dialog: {
    URS: { 
      name: 'User Requirement Specification',
      border: 'border-l-blue-500',
      bg: 'bg-blue-50',
      fg: 'text-blue-700'
    },
    FRS: { 
      name: 'Functional Requirement Specification',
      border: 'border-l-fuchsia-500',
      bg: 'bg-fuchsia-50',
      fg: 'text-fuchsia-700'
    },
    IQ: { 
      name: 'Installation Qualification',
      border: 'border-l-teal-500',
      bg: 'bg-teal-50',
      fg: 'text-teal-700'
    },
    DQ: { 
      name: 'Design Qualification',
      border: 'border-l-red-500',
      bg: 'bg-red-50',
      fg: 'text-red-700'
    },
    PQ: {
      name: 'Performance Qualification',
      border: 'border-l-purple-500',
      bg: 'bg-purple-50',
      fg: 'text-purple-700'
    },
    OQ: {
      name: 'Operational Qualification',
      border: 'border-l-amber-500',
      bg: 'bg-amber-50',
      fg: 'text-amber-700'
    }
  }
} as const

type Variant = keyof typeof COLORS

export function PhasePill({ 
  code, 
  variant = 'default' 
}: { 
  code: PhaseCode
  variant?: Variant 
}) {
  const defaultTheme = {
    name: code,
    border: 'border-l-slate-400',
    bg: 'bg-slate-50',
    fg: 'text-slate-700'
  }
  const theme = variant === 'dialog' 
    ? (COLORS.dialog[code as keyof typeof COLORS.dialog] || defaultTheme)
    : (COLORS.default[code as keyof typeof COLORS.default] || defaultTheme)

  if (variant === 'dialog') {
    const borderColor = theme.border ? theme.border.replace('border-l-4', 'border-l-2') : 'border-l-slate-400'
    return (
      <div className={`relative inline-flex items-center rounded-full ${theme.bg} ${theme.fg} px-3 py-1 border border-gray-200`}>
        <div className={`absolute left-0 top-0 bottom-0 w-0.5 rounded-l-full ${borderColor.replace('border-l-2', 'bg-current')}`}></div>
        <span className="text-xs font-medium pl-1">{theme.name || code}</span>
      </div>
    )
  }

  // Default variant (rounded pill)
  return (
    <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${theme.bg} ${theme.fg}`}>
      {code}
    </span>
  )
}
