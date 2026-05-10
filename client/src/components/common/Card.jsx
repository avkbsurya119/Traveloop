import { clsx } from 'clsx'
import { forwardRef } from 'react'

export const Card = forwardRef(({ children, className = '', hover = false, glass = false, ...props }, ref) => (
  <div
    ref={ref}
    className={clsx(
      'rounded-2xl p-4 transition-all duration-300',
      glass
        ? 'glass border border-border/50 shadow-xl'
        : 'bg-surface border border-border shadow-lg',
      hover && [
        'cursor-pointer',
        'hover:-translate-y-1 hover:shadow-2xl',
        'hover:border-primary/30 hover:shadow-primary/10',
      ],
      className
    )}
    {...props}
  >
    {children}
  </div>
))

Card.displayName = 'Card'

export function CardHeader({ children, className = '' }) {
  return <div className={clsx('mb-4', className)}>{children}</div>
}

export function CardTitle({ children, className = '' }) {
  return <h3 className={clsx('text-base font-semibold text-white tracking-tight', className)}>{children}</h3>
}

export function CardContent({ children, className = '' }) {
  return <div className={clsx('', className)}>{children}</div>
}

export function CardFooter({ children, className = '' }) {
  return <div className={clsx('mt-4 pt-4 border-t border-border/60', className)}>{children}</div>
}
