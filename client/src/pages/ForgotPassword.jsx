import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Input } from '../components/common/Input'
import { Button } from '../components/common/Button'
import { toast } from '../components/common/Toast'
import { authApi } from '../api/auth'
import { ArrowLeft, Mail, KeyRound, ShieldCheck, CheckCircle } from 'lucide-react'

const STEPS = { EMAIL: 0, CODE: 1, RESET: 2, DONE: 3 }

const STEP_META = [
  { icon: Mail, title: 'Forgot password?', subtitle: "Enter your email and we'll send a reset code." },
  { icon: KeyRound, title: 'Check your email', subtitle: null },
  { icon: ShieldCheck, title: 'Set new password', subtitle: 'Choose a strong password with at least 8 characters.' },
]

export default function ForgotPassword() {
  const navigate = useNavigate()
  const [step, setStep] = useState(STEPS.EMAIL)
  const [isLoading, setIsLoading] = useState(false)
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [errors, setErrors] = useState({})

  const handleEmailSubmit = async (e) => {
    e.preventDefault()
    const errs = {}
    if (!email) errs.email = 'Email required'
    else if (!/\S+@\S+\.\S+/.test(email)) errs.email = 'Invalid email'
    setErrors(errs)
    if (Object.keys(errs).length) return
    setIsLoading(true)
    try {
      await authApi.forgotPassword(email)
      toast.info('If that email is registered, a reset code has been sent.')
      setStep(STEPS.CODE)
    } catch (error) {
      toast.error(error.response?.data?.error || 'Something went wrong')
    } finally { setIsLoading(false) }
  }

  const handleCodeSubmit = async (e) => {
    e.preventDefault()
    const errs = {}
    if (!code) errs.code = 'Code required'
    else if (code.length !== 6) errs.code = 'Code must be 6 digits'
    setErrors(errs)
    if (Object.keys(errs).length) return
    setIsLoading(true)
    try {
      await authApi.verifyResetCode(email, code)
      setStep(STEPS.RESET)
    } catch (error) {
      toast.error(error.response?.data?.error || 'Invalid code')
    } finally { setIsLoading(false) }
  }

  const handleResetSubmit = async (e) => {
    e.preventDefault()
    const errs = {}
    if (!newPassword) errs.newPassword = 'Password required'
    else if (newPassword.length < 8) errs.newPassword = 'Min 8 characters'
    if (newPassword !== confirmPassword) errs.confirmPassword = "Passwords don't match"
    setErrors(errs)
    if (Object.keys(errs).length) return
    setIsLoading(true)
    try {
      await authApi.resetPassword(email, code, newPassword)
      toast.success('Password reset successful!')
      setStep(STEPS.DONE)
    } catch (error) {
      toast.error(error.response?.data?.error || 'Reset failed')
    } finally { setIsLoading(false) }
  }

  const meta = STEP_META[Math.min(step, 2)]
  const StepIcon = meta?.icon

  return (
    <div className="w-full">
      <div className="mb-6 text-center">
        <h2 className="font-display text-3xl font-bold text-white mb-2">Reset Password</h2>
        <p className="text-muted">We'll help you back in</p>
      </div>

      <div className="bg-surface/80 backdrop-blur-sm border border-border/60 rounded-2xl p-6 shadow-2xl">
        {/* Progress bar */}
        {step < STEPS.DONE && (
          <div className="flex items-center gap-2 mb-6">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${
                  i < step ? 'bg-primary' : i === step ? 'bg-primary/60' : 'bg-border'
                }`}
              />
            ))}
          </div>
        )}

        {/* Step icon */}
        {step < STEPS.DONE && (
          <div className="text-center mb-5">
            <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-primary/15 border border-primary/20 flex items-center justify-center">
              <StepIcon className="w-6 h-6 text-primary-light" />
            </div>
            <h3 className="font-semibold text-white">{meta.title}</h3>
            {meta.subtitle && <p className="text-muted text-sm mt-1">{meta.subtitle}</p>}
            {step === STEPS.CODE && (
              <p className="text-muted text-sm mt-1">
                We sent a 6-digit code to <span className="text-white font-medium">{email}</span>
              </p>
            )}
          </div>
        )}

        {/* Step 1: Email */}
        {step === STEPS.EMAIL && (
          <form onSubmit={handleEmailSubmit} className="space-y-4">
            <Input label="Email address" type="email" placeholder="you@example.com"
              value={email} onChange={(e) => setEmail(e.target.value)} error={errors.email} />
            <Button type="submit" isLoading={isLoading} className="w-full">
              Send Reset Code
            </Button>
          </form>
        )}

        {/* Step 2: Code */}
        {step === STEPS.CODE && (
          <form onSubmit={handleCodeSubmit} className="space-y-4">
            <Input
              label="Verification Code"
              type="text"
              inputMode="numeric"
              placeholder="000000"
              maxLength={6}
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
              error={errors.code}
              className="text-center text-2xl tracking-[0.5em] font-mono"
            />
            <Button type="submit" isLoading={isLoading} className="w-full">
              Verify Code
            </Button>
            <button type="button" onClick={() => setStep(STEPS.EMAIL)}
              className="w-full text-sm text-muted hover:text-white transition-colors text-center">
              Didn't receive it? Go back
            </button>
          </form>
        )}

        {/* Step 3: New password */}
        {step === STEPS.RESET && (
          <form onSubmit={handleResetSubmit} className="space-y-4">
            <Input label="New Password" type="password" placeholder="••••••••"
              value={newPassword} onChange={(e) => setNewPassword(e.target.value)} error={errors.newPassword} />
            <Input label="Confirm Password" type="password" placeholder="••••••••"
              value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} error={errors.confirmPassword} />
            <Button type="submit" isLoading={isLoading} className="w-full">
              Reset Password
            </Button>
          </form>
        )}

        {/* Step 4: Done */}
        {step === STEPS.DONE && (
          <div className="text-center py-4">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-500/15 border border-green-500/30 flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-green-400" />
            </div>
            <h3 className="font-display text-xl font-bold text-white mb-2">All done!</h3>
            <p className="text-muted text-sm mb-6">
              Your password has been reset. Sign in with your new password.
            </p>
            <Button onClick={() => navigate('/login')} className="w-full">
              Go to Login
            </Button>
          </div>
        )}

        {step !== STEPS.DONE && (
          <div className="mt-5 text-center">
            <Link to="/login" className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-white transition-colors">
              <ArrowLeft className="w-4 h-4" /> Back to Login
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
