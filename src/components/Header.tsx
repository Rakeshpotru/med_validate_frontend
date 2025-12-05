import { motion } from 'framer-motion'
import logo from '../assets/logo.png'
import { Input } from './ui/input'
import { cn } from './ui/utils'
import HeaderRight from './HeaderRight'

interface HeaderProps {
  className?: string
  hasUnreadNotifications?: boolean
}

export default function Header({ className, hasUnreadNotifications = true }: HeaderProps) {
  return (
    <motion.header
      className={cn(
        'sticky top-0 z-40 h-[60px] w-full bg-[hsl(var(--accent))] shadow-sm',
        className,
      )}
      initial={{ opacity: 0, y: -16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
    >
      <div className="flex h-full w-full items-center justify-between px-6">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <img src={logo} alt="X-MED" className="h-8 w-auto" />
          <span className="text-lg font-bold text-white"></span>
        </div>

        {/* Search */}
        <div className="flex flex-1 justify-center">
          <div className="w-full max-w-[420px] flex-1 sm:max-w-[320px] md:max-w-[360px] lg:max-w-[420px]">
            <Input
              type="search"
              placeholder="Search"
              className="h-10 w-full rounded-full border-none bg-white px-4 text-sm text-gray-700 shadow-sm focus-visible:ring-2 focus-visible:ring-white/80"
            />
          </div>
        </div>

        <HeaderRight hasUnreadNotifications={hasUnreadNotifications} />
      </div>
    </motion.header>
  )
}
