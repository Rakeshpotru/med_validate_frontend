import { NavLink } from 'react-router-dom'
import { useTheme } from './useTheme'
import { LayoutGrid, FolderClosed, CalendarDays, BarChart3, Settings, Sun, Moon, Shield, UserCheck, FileText,LayoutTemplate } from 'lucide-react'

function IconRail() {
  const { theme, toggle } = useTheme()

  const navItems = [
    { key: 'dashboard', label: 'Dashboard', to: '/dashboard', icon: LayoutGrid },
    { key: 'works', label: 'My Works', to: '/project/all', icon: FolderClosed },
    { key: 'projects', label: 'My Projects', to: '/projects', icon: CalendarDays },
    { key: 'reports', label: 'Reports', to: '/reports', icon: BarChart3 },
    { key: 'settings', label: 'Settings', to: '/settings', icon: Settings },
    { key: 'security', label: 'Security', to: '/security', icon: Shield },
    { key: 'admin', label: 'Admin', to: '/admindashboard', icon: UserCheck }, 
    { key: 'changerequest', label: 'CR Approval', to: '/changerequests', icon: FileText }, 
    { key: 'templates', label: 'Templates', to: '/templates', icon: LayoutTemplate },
  ]

  return (
    <nav
      aria-label="Primary"
      style={{ transition: 'width 0.3s ease-in-out' }}
      className="group overflow-hidden absolute flex h-full px-2 w-[58px] hover:w-[150px] flex-col rounded-none border border-[hsl(var(--border))] bg-[hsl(var(--bg))] p-1 shadow-[4px_0_12px_rgba(0,0,0,0.08)]"
    >
      <ul className="mt-4 w-auto flex flex-1 flex-col gap-2">
        {navItems.map(({ key, label, to, icon: Icon }) => (
          <li key={key} className="flex items-center whitespace-nowrap">
            <NavLink
              to={to}
              end={key === 'works'}
              className={({ isActive }) =>
                [
                  'group/item flex h-[38px] w-full items-center justify-left gap-[4px] rounded-[8px] pl-2.5 pr-3 py-2 text-[10px] leading-[11px] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--ring))] focus-visible:ring-offset-2',
                  isActive
                    ? 'bg-[#1f3a9d] text-white shadow-sm'
                    : 'text-[hsl(var(--fg))] hover:bg-[#ddd] hover:text-brand',
                ].join(' ')
              }
              aria-label={label}
            >
              <Icon className="h-5 w-5 flex-shrink-0" />

              <span className="ml-2 hidden text-[14px] font-medium leading-[11px] text-center group-hover:inline">{label}</span>
            </NavLink>
          </li>
        ))}
      </ul>

      <div className="w-[38px] grid gap-3 mt-4">
        {/* 🌞 Theme Toggle */}
        <div className="relative flex justify-center group">
          <button
            type="button"
            onClick={toggle}
            className="mx-auto group flex h-[38px] w-full h-10 w-10 items-center justify-center rounded-full text-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/60"
            aria-label="Toggle theme"
            aria-pressed={theme === 'dark'}
          >
            {theme === 'dark' ? (
              <Sun className="h-4 w-4 text-brand" />
            ) : (
              <Moon className="h-4 w-4 text-brand" />
            )}
          </button>
        </div>
      </div>


    </nav>
  )
}

export default IconRail
