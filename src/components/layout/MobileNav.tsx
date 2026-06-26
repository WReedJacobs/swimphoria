import { NavLink } from 'react-router-dom'
import { Settings } from 'lucide-react'
import { cn } from '@/lib/cn'
import { navForRole } from './nav'
import type { Role } from '@/types'

const PRIMARY_COUNT = 4

export function MobileNav({ role }: { role: Role | null }) {
  const allItems = navForRole(role)
  const items = allItems.slice(0, PRIMARY_COUNT)
  const beginner = role === 'beginner'
  const settingsPath = role === 'coach' ? '/coach/settings' : role === 'swimmer' ? '/swimmer/settings' : null

  const activeClass = beginner ? 'text-coral' : 'text-primary'

  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 flex h-16 border-t border-border bg-surface md:hidden">
      {items.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.to.split('/').length <= 2}
          className={({ isActive }) =>
            cn(
              'flex flex-1 flex-col items-center justify-center gap-0.5 transition-colors',
              isActive ? activeClass : 'text-text-muted hover:text-text-primary',
            )
          }
        >
          {({ isActive }) => (
            <>
              <item.icon className={cn('h-5 w-5', isActive ? activeClass : 'text-text-muted')} />
              <span className="max-w-[9ch] truncate text-center font-mono text-[9px] uppercase tracking-wide leading-tight">
                {item.mobileLabel ?? item.label}
              </span>
            </>
          )}
        </NavLink>
      ))}

      {settingsPath && (
        <NavLink
          to={settingsPath}
          className={({ isActive }) =>
            cn(
              'flex flex-1 flex-col items-center justify-center gap-0.5 transition-colors',
              isActive ? activeClass : 'text-text-muted hover:text-text-primary',
            )
          }
        >
          {({ isActive }) => (
            <>
              <Settings className={cn('h-5 w-5', isActive ? activeClass : 'text-text-muted')} />
              <span className="font-mono text-[9px] uppercase tracking-wide leading-tight">Settings</span>
            </>
          )}
        </NavLink>
      )}
    </nav>
  )
}
