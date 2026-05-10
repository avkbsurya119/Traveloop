import { Avatar } from '../common/Avatar'

export default function PresenceIndicator({ users = [], maxDisplay = 3 }) {
  if (users.length === 0) return null

  const displayed = users.slice(0, maxDisplay)
  const remaining = users.length - maxDisplay

  return (
    <div className="flex items-center">
      <div className="flex -space-x-2">
        {displayed.map((user, index) => (
          <div
            key={user.id}
            className="relative"
            style={{ zIndex: maxDisplay - index }}
          >
            <Avatar
              src={user.avatarUrl}
              name={`${user.firstName} ${user.lastName}`}
              size="sm"
              className="ring-2 ring-surface"
            />
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-success rounded-full ring-2 ring-surface" />
          </div>
        ))}
      </div>

      {remaining > 0 && (
        <div className="ml-2 px-2 py-1 bg-dark rounded-full text-xs text-muted">
          +{remaining}
        </div>
      )}

      <div className="ml-3 text-xs text-muted">
        {users.length === 1
          ? `${users[0].firstName} is editing`
          : `${users.length} people editing`
        }
      </div>
    </div>
  )
}

export function TypingIndicator({ users = [] }) {
  if (users.length === 0) return null

  const names = users.map(u => u.firstName).join(', ')

  return (
    <div className="flex items-center gap-2 text-xs text-muted animate-pulse">
      <div className="flex gap-1">
        <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
        <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
        <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
      </div>
      <span>{names} {users.length === 1 ? 'is' : 'are'} typing...</span>
    </div>
  )
}
