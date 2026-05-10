import { NavLink } from 'react-router-dom'
import { clsx } from 'clsx'
import { LayoutDashboard, Map, Compass, Users, User } from 'lucide-react'

const navItems = [
  { to: '/dashboard', label: 'Home', icon: LayoutDashboard },
  { to: '/explore', label: 'Explore', icon: Compass },
  { to: '/trips', label: 'Trips', icon: Map },
  { to: '/community', label: 'Community', icon: Users },
  { to: '/profile', label: 'Profile', icon: User },
]

export function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 glass border-t border-border/60 lg:hidden z-40 pb-safe">
      <div className="flex items-center justify-around py-2 px-2">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              clsx(
                'flex flex-col items-center gap-0.5 px-3 py-2 rounded-xl transition-all relative',
                isActive ? 'text-primary-light' : 'text-muted hover:text-white'
              )
            }
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <span className="absolute -top-1 left-1/2 -translate-x-1/2 w-6 h-1 bg-primary-light rounded-full" />
                )}
                <div className={clsx('p-1.5 rounded-lg transition-all', isActive ? 'bg-primary/15' : '')}>
                  <item.icon size={20} />
                </div>
                <span className="text-[10px] font-medium">{item.label}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
