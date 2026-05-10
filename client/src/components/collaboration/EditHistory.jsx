import { useState, useEffect } from 'react'
import { Avatar } from '../common/Avatar'
import { Skeleton } from '../common/Skeleton'
import { collaborationApi } from '../../api/collaboration'
import { formatDistanceToNow } from 'date-fns'
import { Edit2, Plus, Trash2, Move, RefreshCw } from 'lucide-react'

const ACTION_ICONS = {
  create: Plus,
  update: Edit2,
  delete: Trash2,
  move: Move,
  default: RefreshCw
}

const ACTION_COLORS = {
  create: 'text-success bg-success/10',
  update: 'text-blue-400 bg-blue-500/10',
  delete: 'text-danger bg-danger/10',
  move: 'text-purple-400 bg-purple-500/10',
  default: 'text-muted bg-muted/10'
}

export default function EditHistory({ tripId, limit = 20 }) {
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setLoading(true)
        const { data } = await collaborationApi.getEditHistory(tripId, limit)
        setHistory(data)
      } catch (err) {
        console.error('Failed to fetch edit history:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchHistory()
  }, [tripId, limit])

  if (loading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-12" />
        <Skeleton className="h-12" />
        <Skeleton className="h-12" />
      </div>
    )
  }

  if (history.length === 0) {
    return (
      <div className="text-center py-8">
        <RefreshCw size={32} className="mx-auto text-muted mb-2" />
        <p className="text-muted text-sm">No edit history yet</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {history.map((entry) => {
        const Icon = ACTION_ICONS[entry.action] || ACTION_ICONS.default
        const colorClass = ACTION_COLORS[entry.action] || ACTION_COLORS.default

        return (
          <div key={entry.id} className="flex items-start gap-3">
            <div className={`p-2 rounded-lg ${colorClass}`}>
              <Icon size={14} />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <Avatar
                  src={entry.user.avatarUrl}
                  name={`${entry.user.firstName} ${entry.user.lastName}`}
                  size="xs"
                />
                <span className="text-white text-sm font-medium">
                  {entry.user.firstName}
                </span>
                <span className="text-muted text-sm">
                  {formatActionText(entry)}
                </span>
              </div>

              <p className="text-muted text-xs mt-0.5">
                {formatDistanceToNow(new Date(entry.createdAt), { addSuffix: true })}
              </p>
            </div>
          </div>
        )
      })}
    </div>
  )
}

function formatActionText(entry) {
  const { action, field } = entry

  switch (action) {
    case 'create':
      return `added ${field || 'an item'}`
    case 'update':
      return `updated ${field || 'the trip'}`
    case 'delete':
      return `removed ${field || 'an item'}`
    case 'move':
      return `reordered ${field || 'items'}`
    default:
      return `modified ${field || 'the trip'}`
  }
}
