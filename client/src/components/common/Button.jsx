import { forwardRef } from 'react'
import { clsx } from 'clsx'
import { Loader2 } from 'lucide-react'

const variants = {
  primary: [
    'bg-gradient-to-r from-primary to-primary-light text-white',
    'hover:shadow-lg hover:shadow-primary/30 hover:brightness-110',
    'active:scale-95',
  ],
  secondary: [
    'border-2 border-primary text-primary hover:bg-primary/10',
    'hover:shadow-md hover:shadow-primary/20',
    'active:scale-95',
  ],
  danger: [
    'bg-danger hover:bg-danger/90 text-white',
    'hover:shadow-lg hover:shadow-danger/30',
    'active:scale-95',
  ],
  ghost: [
    'bg-transparent hover:bg-surface text-muted hover:text-white',
    'border border-transparent hover:border-border',
    'active:scale-95',
  ],
  amber: [
    'bg-gradient-to-r from-secondary to-amber-400 text-dark font-semibold',
    'hover:shadow-lg hover:shadow-secondary/30 hover:brightness-105',
    'active:scale-95',
  ],
}

const sizes = {
  xs: 'px-2.5 py-1 text-xs',
  sm: 'px-3.5 py-1.5 text-sm',
  md: 'px-5 py-2.5 text-sm',
  lg: 'px-7 py-3 text-base',
}

export const Button = forwardRef(({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled = false,
  className = '',
  ...props
}, ref) => (
  <button
    ref={ref}
    disabled={disabled || isLoading}
    className={clsx(
      'inline-flex items-center justify-center gap-2 rounded-full font-medium',
      'transition-all duration-200',
      'disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none',
      'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60',
      variants[variant] || variants.primary,
      sizes[size],
      className
    )}
    {...props}
  >
    {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
    {children}
  </button>
))

Button.displayName = 'Button'
