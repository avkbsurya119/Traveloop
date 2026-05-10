import { forwardRef, useState } from 'react'
import { clsx } from 'clsx'
import { Eye, EyeOff, AlertCircle } from 'lucide-react'

export const Input = forwardRef(({
  label,
  error,
  type = 'text',
  className = '',
  ...props
}, ref) => {
  const [showPassword, setShowPassword] = useState(false)
  const isPassword = type === 'password'

  return (
    <div className="space-y-1">
      {label && (
        <label className="block text-xs font-semibold text-muted uppercase tracking-wide">
          {label}
        </label>
      )}
      <div className="relative">
        <input
          ref={ref}
          type={isPassword && showPassword ? 'text' : type}
          className={clsx(
            'w-full px-4 py-2.5 bg-dark border rounded-xl',
            'text-white placeholder-muted text-sm',
            'focus:outline-none focus:ring-2 focus:ring-primary/60 focus:border-primary/40',
            'transition-all duration-200',
            'disabled:opacity-40 disabled:cursor-not-allowed',
            error
              ? 'border-danger/60 focus:ring-danger/40 focus:border-danger/40'
              : 'border-border hover:border-border/80',
            isPassword && 'pr-10',
            className
          )}
          {...props}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-white transition-colors"
            tabIndex={-1}
          >
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        )}
        {error && !isPassword && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-danger">
            <AlertCircle size={16} />
          </div>
        )}
      </div>
      {error && (
        <p className="text-xs text-danger flex items-center gap-1">
          <AlertCircle size={12} /> {error}
        </p>
      )}
    </div>
  )
})

Input.displayName = 'Input'
