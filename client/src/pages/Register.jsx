import { useState, useRef, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Input } from '../components/common/Input'
import { Button } from '../components/common/Button'
import { toast } from '../components/common/Toast'
import { useAuthStore } from '../store/authStore'
import { authApi } from '../api/auth'
import { Camera, Check, X } from 'lucide-react'

function getPasswordStrength(pw) {
  let score = 0
  if (pw.length >= 8) score++
  if (pw.length >= 12) score++
  if (/[A-Z]/.test(pw)) score++
  if (/[a-z]/.test(pw)) score++
  if (/[0-9]/.test(pw)) score++
  if (/[^A-Za-z0-9]/.test(pw)) score++
  if (score <= 2) return { color: 'bg-red-500', width: '25%', label: 'Weak', textColor: 'text-red-400' }
  if (score <= 3) return { color: 'bg-orange-500', width: '50%', label: 'Fair', textColor: 'text-orange-400' }
  if (score <= 4) return { color: 'bg-yellow-500', width: '75%', label: 'Strong', textColor: 'text-yellow-400' }
  return { color: 'bg-green-500', width: '100%', label: 'Excellent', textColor: 'text-green-400' }
}

export default function Register() {
  const navigate = useNavigate()
  const { register } = useAuthStore()
  const [isLoading, setIsLoading] = useState(false)
  const [emailStatus, setEmailStatus] = useState(null)
  const [avatarPreview, setAvatarPreview] = useState(null)
  const [avatarData, setAvatarData] = useState(null)
  const fileInputRef = useRef(null)
  const emailTimeoutRef = useRef(null)
  const [form, setForm] = useState({
    firstName: '', lastName: '', email: '', password: '', confirmPassword: '', phone: '', city: '', country: '',
  })
  const [errors, setErrors] = useState({})

  const checkEmail = useCallback((email) => {
    if (!email || !/\S+@\S+\.\S+/.test(email)) { setEmailStatus(null); return }
    setEmailStatus('checking')
    if (emailTimeoutRef.current) clearTimeout(emailTimeoutRef.current)
    emailTimeoutRef.current = setTimeout(async () => {
      try {
        const { data } = await authApi.checkEmail(email)
        setEmailStatus(data.available ? 'available' : 'taken')
      } catch { setEmailStatus(null) }
    }, 500)
  }, [])

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) { toast.error('Image must be under 5MB'); return }
    const reader = new FileReader()
    reader.onload = (ev) => { setAvatarPreview(ev.target.result); setAvatarData(ev.target.result) }
    reader.readAsDataURL(file)
  }

  const strength = form.password ? getPasswordStrength(form.password) : null

  const validate = () => {
    const newErrors = {}
    if (!form.firstName) newErrors.firstName = 'Required'
    if (!form.lastName) newErrors.lastName = 'Required'
    if (!form.email) newErrors.email = 'Email required'
    else if (!/\S+@\S+\.\S+/.test(form.email)) newErrors.email = 'Invalid email'
    if (emailStatus === 'taken') newErrors.email = 'Email already registered'
    if (!form.password) newErrors.password = 'Password required'
    else if (form.password.length < 8) newErrors.password = 'Min 8 characters'
    else if (!/(?=.*[A-Z])/.test(form.password)) newErrors.password = 'Need uppercase letter'
    else if (!/(?=.*[0-9])/.test(form.password)) newErrors.password = 'Need a number'
    if (form.password !== form.confirmPassword) newErrors.confirmPassword = "Passwords don't match"
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return
    setIsLoading(true)
    try {
      await register({ ...form, avatarUrl: avatarData })
      toast.success('Welcome to Traveloop! 🎉')
      navigate('/dashboard')
    } catch (error) {
      toast.error(error.response?.data?.error || 'Registration failed')
    } finally { setIsLoading(false) }
  }

  const updateForm = (field) => (e) => {
    const value = e.target.value
    setForm(f => ({ ...f, [field]: value }))
    if (field === 'email') checkEmail(value)
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: undefined }))
  }

  return (
    <div className="w-full">
      <div className="mb-6 text-center">
        <h2 className="font-display text-3xl font-bold text-white mb-2">Create account</h2>
        <p className="text-muted">Start planning your dream trips today</p>
      </div>

      <div className="bg-surface/80 backdrop-blur-sm border border-border/60 rounded-2xl p-6 shadow-2xl">
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Avatar */}
          <div className="flex justify-center">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="relative w-18 h-18 w-[4.5rem] h-[4.5rem] rounded-full bg-dark border-2 border-dashed border-border hover:border-primary transition-all overflow-hidden group"
            >
              {avatarPreview ? (
                <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-muted group-hover:text-primary transition-colors">
                  <Camera size={18} />
                  <span className="text-[9px] mt-1">Photo</span>
                </div>
              )}
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input label="First Name" value={form.firstName} onChange={updateForm('firstName')} error={errors.firstName} />
            <Input label="Last Name" value={form.lastName} onChange={updateForm('lastName')} error={errors.lastName} />
          </div>

          <div>
            <Input label="Email" type="email" value={form.email} onChange={updateForm('email')} error={errors.email} />
            {emailStatus && !errors.email && (
              <div className={`flex items-center gap-1 mt-1 text-xs ${emailStatus === 'available' ? 'text-green-400' : emailStatus === 'taken' ? 'text-red-400' : 'text-muted'}`}>
                {emailStatus === 'checking' && <span className="animate-pulse">Checking…</span>}
                {emailStatus === 'available' && <><Check size={12} /> Available</>}
                {emailStatus === 'taken' && <><X size={12} /> Already registered</>}
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input label="City (optional)" value={form.city} onChange={updateForm('city')} />
            <Input label="Country (optional)" value={form.country} onChange={updateForm('country')} />
          </div>

          <div>
            <Input label="Password" type="password" value={form.password} onChange={updateForm('password')} error={errors.password} />
            {strength && (
              <div className="mt-2">
                <div className="h-1.5 bg-dark rounded-full overflow-hidden">
                  <div className={`h-full ${strength.color} transition-all duration-300 rounded-full`} style={{ width: strength.width }} />
                </div>
                <div className="flex justify-between mt-1">
                  <span className={`text-xs font-medium ${strength.textColor}`}>{strength.label}</span>
                  <span className="text-xs text-muted">
                    {form.password.length < 8 ? `${8 - form.password.length} more chars` : '✓ 8+ chars'}
                  </span>
                </div>
              </div>
            )}
          </div>

          <Input label="Confirm Password" type="password" value={form.confirmPassword} onChange={updateForm('confirmPassword')} error={errors.confirmPassword} />

          <div className="relative">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-border" /></div>
            <div className="relative flex justify-center text-xs"><span className="bg-surface px-2 text-muted">or</span></div>
          </div>

          <button
            type="button"
            className="w-full flex items-center justify-center gap-2.5 px-4 py-2.5 bg-dark border border-border rounded-xl text-muted hover:text-white hover:border-primary/50 transition-all text-sm"
          >
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Continue with Google
          </button>

          <Button type="submit" isLoading={isLoading} className="w-full">
            Create Account
          </Button>
        </form>

        <p className="text-center text-muted text-sm mt-5">
          Already have an account?{' '}
          <Link to="/login" className="text-primary-light hover:underline font-semibold">Sign in</Link>
        </p>
      </div>
    </div>
  )
}
