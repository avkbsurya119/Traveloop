import { clsx } from 'clsx'

const variants = {
  default: 'bg-white/5 text-muted border border-border/60',
  primary: 'bg-primary/20 text-primary-light border border-primary/20',
  secondary: 'bg-secondary/20 text-secondary border border-secondary/20',
  success: 'bg-green-500/20 text-green-400 border border-green-500/20',
  warning: 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/20',
  danger: 'bg-danger/20 text-danger border border-danger/20',
  ongoing: 'bg-green-500/20 text-green-400 border border-green-500/30 animate-pulse',
  upcoming: 'bg-blue-500/20 text-blue-400 border border-blue-500/20',
  completed: 'bg-gray-500/15 text-gray-400 border border-gray-500/20',
  draft: 'bg-yellow-500/15 text-yellow-400 border border-yellow-500/20',
  planned: 'bg-violet-500/20 text-violet-400 border border-violet-500/20',
}

export function Badge({ children, variant = 'default', className = '' }) {
  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium',
        variants[variant] || variants.default,
        className
      )}
    >
      {children}
    </span>
  )
}
