import { useState, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { CardContent } from '../components/common/Card'
import { Input } from '../components/common/Input'
import { Button } from '../components/common/Button'
import { toast } from '../components/common/Toast'
import { useAuthStore } from '../store/authStore'
import { authApi } from '../api/auth'
import { Lock, ShieldAlert, Clock, Eye, EyeOff } from 'lucide-react'

export default function Login() {
  const navigate = useNavigate()
  const { login } = useAuthStore()
  const [isLoading, setIsLoading] = useState(false)
  const [form, setForm] = useState({ email: '', password: '' })
  const [errors, setErrors] = useState({})
  const [rememberMe, setRememberMe] = useState(false)
  const [showPass, setShowPass] = useState(false)

  const [locked, setLocked] = useState(false)
  const [lockRemaining, setLockRemaining] = useState(0)
  const [requiresCaptcha, setRequiresCaptcha] = useState(false)
  const [captchaQuestion, setCaptchaQuestion] = useState('')
  const [captchaAnswer, setCaptchaAnswer] = useState('')
  const [attemptsLeft, setAttemptsLeft] = useState(5)

  const validate = () => {
    const e = {}
    if (!form.email) e.email = 'Email required'
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Invalid email'
    if (!form.password) e.password = 'Password required'
    else if (form.password.length < 8) e.password = 'Min 8 characters'
    if (requiresCaptcha && !captchaAnswer) e.captcha = 'Please solve the CAPTCHA'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const applyStatus = useCallback((data) => {
    if (data.locked) {
      setLocked(true); setLockRemaining(data.remaining || 0); setRequiresCaptcha(false)
    } else {
      setLocked(false); setLockRemaining(0)
      if (data.requiresCaptcha) { setRequiresCaptcha(true); setCaptchaQuestion(data.captchaQuestion || ''); setCaptchaAnswer('') }
      else setRequiresCaptcha(false)
    }
    if (data.attemptsLeft !== undefined) setAttemptsLeft(data.attemptsLeft)
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return
    setIsLoading(true)
    try {
      await login(form.email, form.password, requiresCaptcha ? captchaAnswer : undefined, rememberMe)
      toast.success('Welcome back! 🌍')
      navigate('/dashboard')
    } catch (error) {
      const data = error.response?.data
      if (data) { applyStatus(data); toast.error(data.error || 'Login failed') }
      else toast.error('Login failed')
    } finally { setIsLoading(false) }
  }

  const fmt = (secs) => `${Math.floor(secs/60)}:${(secs%60).toString().padStart(2,'0')}`

  return (
    <div className="w-full">
      <div className="mb-8 text-center">
        <h2 className="font-display text-3xl font-bold text-white mb-2">Welcome back</h2>
        <p className="text-muted">Sign in to continue your journey</p>
      </div>

      <div className="bg-surface/80 backdrop-blur-sm border border-border/60 rounded-2xl p-6 shadow-2xl">
        {locked && (
          <div className="mb-5 p-4 rounded-xl bg-danger/10 border border-danger/30 flex items-start gap-3">
            <Clock className="w-5 h-5 text-danger mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-danger font-semibold text-sm">Account temporarily locked</p>
              <p className="text-muted text-xs mt-1">Too many failed attempts. Try again in <span className="text-white font-mono font-medium">{fmt(lockRemaining)}</span></p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input id="email" label="Email address" type="email" placeholder="you@example.com"
            value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
            error={errors.email} disabled={locked} />

          <div className="relative">
            <Input id="password" label="Password" type={showPass ? 'text' : 'password'} placeholder="••••••••"
              value={form.password} onChange={e => setForm({ ...form, password: e.target.value })}
              error={errors.password} disabled={locked} />
            <button type="button" onClick={() => setShowPass(!showPass)}
              className="absolute right-3 top-[2.15rem] text-muted hover:text-white transition-colors">
              {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>

          {requiresCaptcha && !locked && (
            <div className="p-4 rounded-xl bg-surface border border-border space-y-3">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-yellow-400" />
                <span className="text-sm text-yellow-400 font-semibold">Security check</span>
              </div>
              <p className="text-white text-xl font-mono tracking-widest text-center py-2 bg-dark rounded-lg">
                {captchaQuestion}
              </p>
              <Input type="text" placeholder="Your answer" value={captchaAnswer}
                onChange={e => setCaptchaAnswer(e.target.value)} error={errors.captcha} />
            </div>
          )}

          {!locked && attemptsLeft < 5 && attemptsLeft > 0 && (
            <div className="flex items-center gap-2 text-xs text-yellow-400 bg-yellow-400/10 px-3 py-2 rounded-lg">
              <Lock className="w-3.5 h-3.5" />
              <span>{attemptsLeft} attempt{attemptsLeft !== 1 ? 's' : ''} remaining before lockout</span>
            </div>
          )}

          <div className="flex items-center justify-between text-sm pt-1">
            <label className="flex items-center gap-2 text-muted cursor-pointer select-none hover:text-white transition-colors">
              <input type="checkbox" checked={rememberMe} onChange={e => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded border-border accent-primary" />
              Remember me
            </label>
            <Link to="/forgot-password" className="text-primary-light hover:underline font-medium">
              Forgot password?
            </Link>
          </div>

          <Button type="submit" isLoading={isLoading} disabled={locked} className="w-full mt-2">
            Sign in
          </Button>
        </form>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border" />
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="px-3 bg-surface text-muted">or continue with</span>
          </div>
        </div>

        <a
          href={`${import.meta.env.VITE_API_BASE_URL || '/api'}/auth/google`}
          className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-white hover:bg-gray-100 text-gray-900 font-medium rounded-xl transition-colors"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          Sign in with Google
        </a>

        <p className="text-center text-muted text-sm mt-5">
          Don't have an account?{' '}
          <Link to="/register" className="text-primary-light hover:underline font-semibold">
            Create account
          </Link>
        </p>
      </div>
    </div>
  )
}
