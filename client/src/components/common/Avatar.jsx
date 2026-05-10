import * as AvatarPrimitive from '@radix-ui/react-avatar'
import { clsx } from 'clsx'

const sizes = {
  xs: 'w-6 h-6 text-[10px]',
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-14 h-14 text-lg',
  xl: 'w-20 h-20 text-xl',
}

const gradients = [
  'from-emerald-500 to-teal-600',
  'from-blue-500 to-indigo-600',
  'from-violet-500 to-purple-600',
  'from-amber-500 to-orange-600',
  'from-pink-500 to-rose-600',
  'from-cyan-500 to-sky-600',
]

function getGradient(name) {
  if (!name) return gradients[0]
  const code = name.charCodeAt(0) || 0
  return gradients[code % gradients.length]
}

export function Avatar({ src, name, size = 'md', className = '' }) {
  const initials = name
    ?.split(' ')
    .map((n) => n?.[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || '?'

  const gradient = getGradient(name)

  return (
    <AvatarPrimitive.Root
      className={clsx(
        'inline-flex items-center justify-center rounded-full overflow-hidden flex-shrink-0',
        'ring-2 ring-border/40',
        sizes[size],
        className
      )}
    >
      <AvatarPrimitive.Image
        src={src}
        alt={name}
        className="w-full h-full object-cover"
      />
      <AvatarPrimitive.Fallback
        className={clsx(
          'flex items-center justify-center w-full h-full font-bold text-white',
          `bg-gradient-to-br ${gradient}`
        )}
      >
        {initials}
      </AvatarPrimitive.Fallback>
    </AvatarPrimitive.Root>
  )
}
