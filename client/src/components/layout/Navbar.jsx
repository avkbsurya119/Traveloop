import { useState, useRef, useEffect, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Search, Bell, Menu, X, Plus, ExternalLink, Palette } from 'lucide-react'
import { Avatar } from '../common/Avatar'
import { useAuthStore } from '../../store/authStore'
import { useUIStore, THEME_META } from '../../store/uiStore'
import { notificationsApi } from '../../api/notifications'
import { formatDistanceToNow } from 'date-fns'

export function Navbar() {
  const { user } = useAuthStore()
  const { toggleMobileNav, theme, setTheme } = useUIStore()
  const navigate = useNavigate()
  const [showThemes, setShowThemes] = useState(false)
  const themeRef = useRef(null)
  const [showNotifications, setShowNotifications] = useState(false)
  const [searchFocused, setSearchFocused] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [notifsLoading, setNotifsLoading] = useState(false)
  const [readIds, setReadIds] = useState(new Set())
  const notificationRef = useRef(null)

  const loadNotifications = useCallback(async () => {
    if (!user) return
    setNotifsLoading(true)
    try {
      const { data } = await notificationsApi.getAll()
      setNotifications(data.notifications || [])
      setUnreadCount(data.unreadCount || 0)
    } catch {
      // Keep showing last state
    } finally {
      setNotifsLoading(false)
    }
  }, [user])

  useEffect(() => {
    loadNotifications()
    // Refresh every 2 minutes
    const interval = setInterval(loadNotifications, 120000)
    return () => clearInterval(interval)
  }, [loadNotifications])

  useEffect(() => {
    function handleClickOutside(e) {
      if (notificationRef.current && !notificationRef.current.contains(e.target)) {
        setShowNotifications(false)
      }
      if (themeRef.current && !themeRef.current.contains(e.target)) {
        setShowThemes(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSearch = (e) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      navigate(`/explore?q=${encodeURIComponent(searchQuery.trim())}`)
      setSearchQuery('')
      setSearchFocused(false)
    }
  }

  const openNotifications = () => {
    setShowNotifications(v => !v)
    if (!showNotifications) {
      // Mark all as read locally
      setReadIds(new Set(notifications.map(n => n.id)))
      setUnreadCount(0)
    }
  }

  const handleNotificationClick = (n) => {
    setReadIds(prev => new Set(prev).add(n.id))
    setShowNotifications(false)
    if (n.tripId) navigate(`/trips/${n.tripId}`)
    else if (n.postId) navigate('/community')
  }

  const markAllRead = () => {
    setReadIds(new Set(notifications.map(n => n.id)))
    setUnreadCount(0)
    setShowNotifications(false)
  }

  const displayedUnread = unreadCount - readIds.size > 0 ? unreadCount - readIds.size : 0

  return (
    <nav className="h-16 glass border-b border-border/60 px-4 lg:px-6 flex items-center justify-between sticky top-0 z-50">
      {/* Left */}
      <div className="flex items-center gap-3">
        <button
          onClick={toggleMobileNav}
          className="lg:hidden p-2 text-muted hover:text-white rounded-lg hover:bg-surface"
        >
          <Menu size={22} />
        </button>
        <Link to="/dashboard" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-primary-light flex items-center justify-center text-base shadow-md group-hover:shadow-primary/40 transition-all">
            ✈️
          </div>
          <span className="font-display text-xl font-bold hidden sm:block">
            <span className="text-gradient">Travel</span>
            <span className="text-white">oop</span>
          </span>
        </Link>
      </div>

      {/* Search */}
      <div className="flex-1 max-w-lg mx-4 hidden md:block">
        <div className={`relative transition-all duration-300 ${searchFocused ? 'scale-105' : ''}`}>
          <Search className={`absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors ${searchFocused ? 'text-primary-light' : 'text-muted'}`} size={16} />
          <input
            type="text"
            placeholder="Search trips, cities, activities..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            onKeyDown={handleSearch}
            className={`w-full pl-10 pr-10 py-2 bg-dark border rounded-full text-sm text-white placeholder-muted focus:outline-none transition-all ${searchFocused ? 'border-primary/60 ring-2 ring-primary/20' : 'border-border'}`}
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-white">
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Right */}
      <div className="flex items-center gap-2">
        <Link to="/trips/new" className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-primary hover:bg-primary-light rounded-full text-white text-sm font-medium transition-all hover:shadow-lg hover:shadow-primary/30">
          <Plus size={15} /> New Trip
        </Link>

        {/* Theme Switcher */}
        <div className="relative" ref={themeRef}>
          <button
            onClick={() => setShowThemes(v => !v)}
            className="p-2 text-muted hover:text-white rounded-lg hover:bg-surface transition-colors"
            title="Change theme"
          >
            <Palette size={18} />
          </button>
          {showThemes && (
            <div className="absolute right-0 mt-2 w-48 glass rounded-2xl shadow-2xl overflow-hidden z-50 border border-border/60 animate-fade-up p-2">
              <p className="text-xs text-muted font-semibold uppercase tracking-wide px-2 mb-2">Theme</p>
              {Object.entries(THEME_META).map(([key, meta]) => (
                <button
                  key={key}
                  onClick={() => { setTheme(key); setShowThemes(false) }}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm transition-all ${
                    theme === key ? 'bg-primary/20 text-white' : 'text-muted hover:text-white hover:bg-dark/60'
                  }`}
                >
                  <div className="w-4 h-4 rounded-full border border-border/50 flex-shrink-0" style={{ backgroundColor: meta.preview }} />
                  <span>{meta.icon} {meta.label}</span>
                  {theme === key && <span className="ml-auto text-primary-light text-xs">✓</span>}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Notifications */}
        <div className="relative" ref={notificationRef}>
          <button
            onClick={openNotifications}
            className="relative p-2 text-muted hover:text-white rounded-lg hover:bg-surface transition-colors"
          >
            <Bell size={20} />
            {displayedUnread > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-secondary text-dark text-[9px] font-bold rounded-full flex items-center justify-center animate-pulse-ring">
                {displayedUnread > 9 ? '9+' : displayedUnread}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 glass rounded-2xl shadow-2xl overflow-hidden z-50 border border-border/60 animate-fade-up">
              <div className="px-4 py-3 border-b border-border/50 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-white text-sm">Notifications</h3>
                  {notifications.length > 0 && (
                    <span className="text-xs bg-surface px-1.5 py-0.5 rounded-full text-muted">{notifications.length}</span>
                  )}
                </div>
                <button onClick={() => setShowNotifications(false)} className="text-muted hover:text-white">
                  <X size={16} />
                </button>
              </div>

              <div className="max-h-80 overflow-y-auto">
                {notifsLoading && notifications.length === 0 ? (
                  <div className="px-4 py-8 text-center">
                    <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full mx-auto" />
                    <p className="text-muted text-xs mt-2">Loading...</p>
                  </div>
                ) : notifications.length === 0 ? (
                  <div className="px-4 py-8 text-center">
                    <div className="text-3xl mb-2">🔔</div>
                    <p className="text-muted text-sm">No notifications yet</p>
                    <p className="text-muted/60 text-xs mt-1">We'll alert you about trips, likes, and more</p>
                  </div>
                ) : (
                  notifications.map(n => {
                    const isRead = readIds.has(n.id) || !n.unread
                    return (
                      <button
                        key={n.id}
                        onClick={() => handleNotificationClick(n)}
                        className={`w-full px-4 py-3 border-b border-border/30 hover:bg-dark/60 cursor-pointer transition-colors text-left ${!isRead ? 'bg-primary/5' : ''}`}
                      >
                        <div className="flex gap-3">
                          <span className="text-lg flex-shrink-0 mt-0.5">{n.icon}</span>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <p className="text-sm text-white font-medium leading-tight truncate">{n.title}</p>
                              {!isRead && <div className="w-2 h-2 bg-primary-light rounded-full flex-shrink-0 mt-1" />}
                            </div>
                            <p className="text-xs text-muted mt-0.5 line-clamp-2">{n.desc}</p>
                            <p className="text-xs text-muted/50 mt-1">
                              {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                            </p>
                          </div>
                        </div>
                      </button>
                    )
                  })
                )}
              </div>

              {notifications.length > 0 && (
                <div className="px-4 py-2.5 border-t border-border/50 flex items-center justify-between">
                  <button onClick={markAllRead} className="text-xs text-muted hover:text-white transition-colors">
                    Mark all read
                  </button>
                  <Link to="/community" onClick={() => setShowNotifications(false)} className="text-xs text-primary-light hover:text-primary flex items-center gap-1 font-medium">
                    Community <ExternalLink size={10} />
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Avatar */}
        <Link to="/profile" className="group">
          <div className="ring-2 ring-transparent group-hover:ring-primary/50 rounded-full transition-all">
            <Avatar
              src={user?.avatarUrl}
              name={`${user?.firstName || ''} ${user?.lastName || ''}`}
              size="sm"
            />
          </div>
        </Link>
      </div>
    </nav>
  )
}
