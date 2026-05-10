import { useState } from 'react'
import { Modal, ModalContent } from '../common/Modal'
import { Input } from '../common/Input'
import { Button } from '../common/Button'
import { Avatar } from '../common/Avatar'
import { toast } from '../common/Toast'
import { collaborationApi } from '../../api/collaboration'
import { UserPlus, Crown, Edit3, Eye, Trash2 } from 'lucide-react'

const ROLES = [
  { value: 'viewer', label: 'Viewer', icon: Eye, description: 'Can view trip details' },
  { value: 'editor', label: 'Editor', icon: Edit3, description: 'Can edit trip content' },
  { value: 'admin', label: 'Admin', icon: Crown, description: 'Full access including inviting others' }
]

export default function InviteModal({ tripId, open, onOpenChange, onInviteSuccess }) {
  const [email, setEmail] = useState('')
  const [role, setRole] = useState('viewer')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleInvite = async (e) => {
    e.preventDefault()

    if (!email) {
      setError('Email is required')
      return
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Invalid email address')
      return
    }

    setLoading(true)
    setError('')

    try {
      const { data } = await collaborationApi.inviteCollaborator(tripId, email, role)
      toast.success(`Invited ${data.firstName} as ${role}`)
      setEmail('')
      setRole('viewer')
      onInviteSuccess?.(data)
      onOpenChange(false)
    } catch (err) {
      const message = err.response?.data?.error || 'Failed to invite user'
      setError(message)
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <ModalContent title="Invite Collaborator" description="Share this trip with others">
        <form onSubmit={handleInvite} className="space-y-4">
          <Input
            label="Email Address"
            type="email"
            placeholder="colleague@example.com"
            value={email}
            onChange={(e) => { setEmail(e.target.value); setError('') }}
            error={error}
          />

          <div>
            <label className="block text-xs font-semibold text-muted uppercase tracking-wide mb-2">
              Permission Level
            </label>
            <div className="space-y-2">
              {ROLES.map(r => {
                const Icon = r.icon
                return (
                  <label
                    key={r.value}
                    className={`
                      flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all
                      ${role === r.value
                        ? 'border-primary bg-primary/10'
                        : 'border-border hover:border-primary/50'
                      }
                    `}
                  >
                    <input
                      type="radio"
                      name="role"
                      value={r.value}
                      checked={role === r.value}
                      onChange={(e) => setRole(e.target.value)}
                      className="hidden"
                    />
                    <Icon size={18} className={role === r.value ? 'text-primary' : 'text-muted'} />
                    <div>
                      <p className="text-white text-sm font-medium">{r.label}</p>
                      <p className="text-muted text-xs">{r.description}</p>
                    </div>
                  </label>
                )
              })}
            </div>
          </div>

          <Button type="submit" isLoading={loading} className="w-full">
            <UserPlus size={16} className="mr-2" />
            Send Invitation
          </Button>
        </form>
      </ModalContent>
    </Modal>
  )
}

export function CollaboratorList({ tripId, owner, collaborators, onRemove, currentUserId }) {
  const [removing, setRemoving] = useState(null)
  const [updating, setUpdating] = useState(null)

  const handleRemove = async (userId) => {
    if (!confirm('Remove this collaborator?')) return

    setRemoving(userId)
    try {
      await collaborationApi.removeCollaborator(tripId, userId)
      onRemove?.(userId)
      toast.success('Collaborator removed')
    } catch (err) {
      toast.error('Failed to remove collaborator')
    } finally {
      setRemoving(null)
    }
  }

  const handleRoleChange = async (userId, newRole) => {
    setUpdating(userId)
    try {
      await collaborationApi.updateRole(tripId, userId, newRole)
      toast.success('Role updated')
    } catch (err) {
      toast.error('Failed to update role')
    } finally {
      setUpdating(null)
    }
  }

  const isOwner = currentUserId === owner?.id

  return (
    <div className="space-y-3">
      {/* Owner */}
      {owner && (
        <div className="flex items-center gap-3 p-3 bg-dark rounded-xl">
          <Avatar src={owner.avatarUrl} name={`${owner.firstName} ${owner.lastName}`} size="sm" />
          <div className="flex-1">
            <p className="text-white text-sm font-medium">
              {owner.firstName} {owner.lastName}
              {owner.id === currentUserId && <span className="text-muted ml-1">(you)</span>}
            </p>
            <p className="text-muted text-xs">{owner.email}</p>
          </div>
          <div className="flex items-center gap-1 px-2 py-1 bg-amber-500/10 rounded-lg text-amber-400 text-xs">
            <Crown size={12} />
            Owner
          </div>
        </div>
      )}

      {/* Collaborators */}
      {collaborators.map(collab => (
        <div key={collab.id} className="flex items-center gap-3 p-3 bg-dark rounded-xl group">
          <Avatar src={collab.avatarUrl} name={`${collab.firstName} ${collab.lastName}`} size="sm" />
          <div className="flex-1">
            <p className="text-white text-sm font-medium">
              {collab.firstName} {collab.lastName}
              {collab.id === currentUserId && <span className="text-muted ml-1">(you)</span>}
            </p>
            <p className="text-muted text-xs">{collab.email}</p>
          </div>

          {isOwner ? (
            <>
              <select
                value={collab.role}
                onChange={(e) => handleRoleChange(collab.id, e.target.value)}
                disabled={updating === collab.id}
                className="px-2 py-1 bg-surface border border-border rounded-lg text-white text-xs focus:outline-none focus:ring-2 focus:ring-primary/60"
              >
                <option value="viewer">Viewer</option>
                <option value="editor">Editor</option>
                <option value="admin">Admin</option>
              </select>

              <button
                onClick={() => handleRemove(collab.id)}
                disabled={removing === collab.id}
                className="p-2 hover:bg-danger/20 rounded-lg text-muted hover:text-danger transition-colors opacity-0 group-hover:opacity-100"
              >
                <Trash2 size={16} />
              </button>
            </>
          ) : (
            <div className="text-xs text-muted capitalize px-2 py-1 bg-surface rounded-lg">
              {collab.role}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
