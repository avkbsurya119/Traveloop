import { useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import { Navbar } from './Navbar'
import { Sidebar } from './Sidebar'
import { BottomNav } from './BottomNav'
import OfflineIndicator from '../common/OfflineIndicator'
import { useAuthStore } from '../../store/authStore'

export default function MainLayout() {
  const { initialize, isLoading } = useAuthStore()

  useEffect(() => { initialize() }, [initialize])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-dark flex flex-col items-center justify-center gap-4">
        <div className="text-5xl animate-bounce">✈️</div>
        <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
        <p className="text-muted text-sm animate-pulse">Loading Traveloop...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-mesh">
      <Navbar />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 min-w-0 p-4 lg:p-6 pb-24 lg:pb-8 max-w-7xl">
          <Outlet />
        </main>
      </div>
      <BottomNav />
      <OfflineIndicator />
    </div>
  )
}
