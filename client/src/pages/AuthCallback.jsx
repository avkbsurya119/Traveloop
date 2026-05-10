import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { authApi } from '../api/auth'
import { toast } from '../components/common/Toast'
import { Loader2 } from 'lucide-react'

export default function AuthCallback() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { setUser, setTokens } = useAuthStore()
  const [error, setError] = useState(null)

  useEffect(() => {
    const handleCallback = async () => {
      const accessToken = searchParams.get('accessToken')
      const refreshToken = searchParams.get('refreshToken')
      const errorParam = searchParams.get('error')

      if (errorParam) {
        setError('Authentication failed. Please try again.')
        toast.error('Google authentication failed')
        setTimeout(() => navigate('/login'), 2000)
        return
      }

      if (!accessToken || !refreshToken) {
        setError('Invalid authentication response')
        setTimeout(() => navigate('/login'), 2000)
        return
      }

      try {
        // Store tokens
        localStorage.setItem('accessToken', accessToken)
        localStorage.setItem('refreshToken', refreshToken)
        setTokens(accessToken, refreshToken)

        // Fetch user data
        const { data: user } = await authApi.getMe()
        setUser(user)

        toast.success(`Welcome, ${user.firstName}!`)
        navigate('/dashboard')
      } catch (err) {
        setError('Failed to complete authentication')
        localStorage.removeItem('accessToken')
        localStorage.removeItem('refreshToken')
        setTimeout(() => navigate('/login'), 2000)
      }
    }

    handleCallback()
  }, [searchParams, navigate, setUser, setTokens])

  return (
    <div className="min-h-screen flex items-center justify-center bg-dark">
      <div className="text-center">
        {error ? (
          <>
            <div className="text-danger text-lg mb-2">{error}</div>
            <p className="text-muted text-sm">Redirecting to login...</p>
          </>
        ) : (
          <>
            <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto mb-4" />
            <p className="text-white text-lg">Completing authentication...</p>
            <p className="text-muted text-sm mt-2">Please wait</p>
          </>
        )}
      </div>
    </div>
  )
}
