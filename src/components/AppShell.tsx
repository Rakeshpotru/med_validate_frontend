import type { ReactNode } from 'react'
import { cn } from './ui/utils'
import Header from './Header'

export interface AppShellProps {
  iconRail?: ReactNode
  sidebar?: ReactNode
  children: ReactNode
  className?: string
}

export default function AppShell({ iconRail, sidebar, children, className }: AppShellProps) {
  return (
    <div className={cn('min-h-screen bg-[hsl(var(--bg))] text-[hsl(var(--fg))]', className)}>
      {/* Top Header */}
      <Header />
      
      {/* Layout: Icon rail (sticky) + content area */}
      <div className="flex min-h-[calc(100vh-60px)]">
        {/* Icon rail */}
        {iconRail ? (
          <div className="sticky left-0 top-[60px] z-20 h-[calc(100vh-60px)] shrink-0">
            {iconRail}
          </div>
        ) : null}

        {/* Content area */}
        <div className="flex min-h-[calc(100vh-60px)] flex-1 ml-[47px]">
          {/* Sidebar (hide on small screens) */}
          {sidebar ? (
            <aside className="sticky left-0 top-[60px] h-[calc(100vh-60px)] overflow-y-auto hidden md:block shrink-0 p-4">
              {sidebar}
            </aside>
          ) : null}

          {/* Main routed content - scrollable */}
          <main className="min-w-0 flex-1 overflow-y-auto p-4">
            {children}
          </main>
        </div>
      </div>
    </div>
  )
}

export { AppShell }

