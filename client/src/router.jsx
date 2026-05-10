import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './store/authStore'

// Layouts
import MainLayout from './components/layout/MainLayout'
import AuthLayout from './components/layout/AuthLayout'

// Pages
import Login from './pages/Login'
import Register from './pages/Register'
import ForgotPassword from './pages/ForgotPassword'
import Dashboard from './pages/Dashboard'
import CreateTrip from './pages/CreateTrip'
import BuildItinerary from './pages/BuildItinerary'
import TripList from './pages/TripList'
import TripDetail from './pages/TripDetail'
import TripTimeline from './pages/TripTimeline'
import Profile from './pages/Profile'
import Explore from './pages/Explore'
import Community from './pages/Community'
import Checklist from './pages/Checklist'
import Notes from './pages/Notes'
import Expenses from './pages/Expenses'
import Invoice from './pages/Invoice'
import Admin from './pages/Admin'
import Landing from './pages/Landing'
import AboutUs from './pages/AboutUs'
import Contact from './pages/Contact'
import TravelPackages from './pages/TravelPackages'
import PublicProfile from './pages/PublicProfile'
import AuthCallback from './pages/AuthCallback'

function PrivateRoute({ children }) {
  const { isAuthenticated } = useAuthStore()
  return isAuthenticated ? children : <Navigate to="/login" />
}

function AdminRoute({ children }) {
  const { user, isAuthenticated } = useAuthStore()
  if (!isAuthenticated) return <Navigate to="/login" />
  if (user?.role !== 'admin') return <Navigate to="/dashboard" />
  return children
}

function PublicRoute({ children }) {
  const { isAuthenticated } = useAuthStore()
  return isAuthenticated ? <Navigate to="/dashboard" /> : children
}

export default function AppRouter() {
  return (
    <Routes>
      {/* Public routes */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
        <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
        <Route path="/forgot-password" element={<PublicRoute><ForgotPassword /></PublicRoute>} />
      </Route>

      {/* OAuth callback */}
      <Route path="/auth/callback" element={<AuthCallback />} />

      {/* Public profile route */}
      <Route path="/u/:username" element={<PublicProfile />} />

      {/* Protected routes */}
      <Route element={<PrivateRoute><MainLayout /></PrivateRoute>}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/trips" element={<TripList />} />
        <Route path="/trips/new" element={<CreateTrip />} />
        <Route path="/trips/:id" element={<TripDetail />} />
        <Route path="/trips/:id/build" element={<BuildItinerary />} />
        <Route path="/trips/:id/itinerary" element={<TripTimeline />} />
        <Route path="/trips/:id/timeline" element={<TripTimeline />} />
        <Route path="/trips/:id/checklist" element={<Checklist />} />
        <Route path="/trips/:id/notes" element={<Notes />} />
        <Route path="/trips/:id/expenses" element={<Expenses />} />
        <Route path="/trips/:id/invoice" element={<Invoice />} />
        <Route path="/explore" element={<Explore />} />
        <Route path="/community" element={<Community />} />
        <Route path="/profile" element={<Profile />} />
      </Route>

      {/* Admin routes */}
      <Route element={<AdminRoute><MainLayout /></AdminRoute>}>
        <Route path="/admin" element={<Admin />} />
      </Route>

      {/* Landing page and Public Pages */}
      <Route path="/" element={<Landing />} />
      <Route path="/about-us" element={<AboutUs />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/travel-packages" element={<TravelPackages />} />
      <Route path="*" element={<Navigate to="/dashboard" />} />
    </Routes>
  )
}
