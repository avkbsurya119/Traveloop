import { NavLink, Link } from 'react-router-dom'
import { clsx } from 'clsx'
import {
  LayoutDashboard, Map, Compass, Users, User,
  LogOut, Shield, Plus, ChevronRight
} from 'lucide-react'
import { useAuthStore } from '../../store/authStore'
import { Avatar } from '../common/Avatar'

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, color: 'from-emerald-500 to-teal-600' },
  { to: '/trips', label: 'My Trips', icon: Map, color: 'from-blue-500 to-indigo-600' },
  { to: '/explore', label: 'Explore', icon: Compass, color: 'from-orange-500 to-amber-600' },
  { to: '/community', label: 'Community', icon: Users, color: 'from-pink-500 to-rose-600' },
  { to: '/profile', label: 'Profile', icon: User, color: 'from-violet-500 to-purple-600' },
]

export function Sidebar() {
  const { user, logout } = useAuthStore()

  return (
    <aside className="w-64 bg-surface/80 border-r border-border/60 h-[calc(100vh-4rem)] sticky top-16 hidden lg:flex flex-col backdrop-blur-sm">
      {/* Quick create */}
      <div className="p-4 border-b border-border/40">
        <Link to="/trips/new"
          className="flex items-center justify-between w-full px-4 py-3 bg-gradient-to-r from-primary to-primary-light rounded-xl text-white font-medium text-sm shadow-lg shadow-primary/20 hover:shadow-primary/40 hover:scale-[1.02] transition-all">
          <div className="flex items-center gap-2">
            <Plus size={18} />
            <span>Plan a Trip</span>
          </div>
          <ChevronRight size={16} />
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        <p className="text-xs font-semibold text-muted/60 uppercase tracking-widest px-3 py-2">Navigation</p>
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              clsx(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all group relative overflow-hidden',
                isActive
                  ? 'bg-primary/15 text-white'
                  : 'text-muted hover:bg-dark/60 hover:text-white'
              )
            }
          >
            {({ isActive }) => (
              <>
                <div className={clsx(
                  'w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-all',
                  isActive
                    ? `bg-gradient-to-br ${item.color} shadow-md`
                    : 'bg-dark/60 group-hover:bg-dark'
                )}>
                  <item.icon size={16} className={isActive ? 'text-white' : 'text-muted group-hover:text-white'} />
                </div>
                <span className="font-medium text-sm">{item.label}</span>
                {isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-primary-light rounded-r-full" />
                )}
              </>
            )}
          </NavLink>
        ))}

        {user?.role === 'admin' && (
          <>
            <p className="text-xs font-semibold text-muted/60 uppercase tracking-widest px-3 pt-4 pb-2">Admin</p>
            <NavLink
              to="/admin"
              className={({ isActive }) =>
                clsx(
                  'flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all group relative overflow-hidden',
                  isActive ? 'bg-secondary/15 text-white' : 'text-muted hover:bg-dark/60 hover:text-white'
                )
              }
            >
              {({ isActive }) => (
                <>
                  <div className={clsx('w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0', isActive ? 'bg-gradient-to-br from-secondary to-amber-600 shadow-md' : 'bg-dark/60')}>
                    <Shield size={16} className={isActive ? 'text-white' : 'text-muted group-hover:text-white'} />
                  </div>
                  <span className="font-medium text-sm">Admin Panel</span>
                  {isActive && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-secondary rounded-r-full" />}
                </>
              )}
            </NavLink>
          </>
        )}
      </nav>

      {/* User */}
      <div className="p-3 border-t border-border/40">
        <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-dark/60 transition-colors group cursor-pointer">
          <Avatar src={user?.avatarUrl} name={`${user?.firstName || ''} ${user?.lastName || ''}`} size="sm" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-white truncate">{user?.firstName} {user?.lastName}</p>
            <p className="text-xs text-muted truncate">{user?.email}</p>
          </div>
          <button
            onClick={logout}
            className="p-1.5 text-muted hover:text-danger opacity-0 group-hover:opacity-100 transition-all rounded-lg hover:bg-danger/10"
            title="Logout"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </aside>
  )
}
