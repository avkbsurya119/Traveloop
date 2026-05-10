import { useState, useEffect, useRef } from 'react'
import { Card, CardTitle, CardContent } from '../components/common/Card'
import { Input } from '../components/common/Input'
import { Button } from '../components/common/Button'
import { Avatar } from '../components/common/Avatar'
import { Badge } from '../components/common/Badge'
import { toast } from '../components/common/Toast'
import { useAuthStore } from '../store/authStore'
import { usersApi } from '../api/users'
import { Camera, MapPin, Trash2, Eye, EyeOff, LogOut, Globe, Lock, Edit2, Check } from 'lucide-react'

const STAT_CONFIG = [
  { key: 'tripCount', label: 'Trips', icon: '✈️', color: 'from-blue-500/20 to-blue-600/10 border-blue-500/30' },
  { key: 'countriesVisited', label: 'Countries', icon: '🌍', color: 'from-emerald-500/20 to-emerald-600/10 border-emerald-500/30' },
  { key: 'postCount', label: 'Posts', icon: '📸', color: 'from-purple-500/20 to-purple-600/10 border-purple-500/30' },
  { key: 'savedCount', label: 'Saved', icon: '❤️', color: 'from-rose-500/20 to-rose-600/10 border-rose-500/30' },
]

const BADGE_BG = ['from-amber-400 to-orange-500', 'from-blue-400 to-cyan-500', 'from-emerald-400 to-green-500', 'from-purple-400 to-pink-500', 'from-rose-400 to-red-500']

export default function Profile() {
  const { user, updateUser, logout } = useAuthStore()
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [stats, setStats] = useState(null)
  const [savedDests, setSavedDests] = useState([])
  const [activeTab, setActiveTab] = useState('info')
  const fileRef = useRef(null)
  const [form, setForm] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    phone: user?.phone || '',
    city: user?.city || '',
    country: user?.country || '',
    bio: user?.bio || '',
  })

  useEffect(() => {
    if (user?.id) {
      usersApi.getStats(user.id).then(r => setStats(r.data)).catch(() => {})
      usersApi.getSavedDestinations(user.id).then(r => setSavedDests(r.data)).catch(() => {})
    }
  }, [user?.id])

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const { data } = await usersApi.updateProfile(user.id, form)
      updateUser(data)
      setIsEditing(false)
      toast.success('Profile updated')
    } catch { toast.error('Failed to update profile') }
    finally { setIsSaving(false) }
  }

  const handleAvatar = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) { toast.error('Max 5MB'); return }
    const reader = new FileReader()
    reader.onload = async (ev) => {
      try {
        const { data } = await usersApi.uploadAvatar(user.id, ev.target.result)
        updateUser({ avatarUrl: data.avatarUrl })
        toast.success('Avatar updated')
      } catch { toast.error('Upload failed') }
    }
    reader.readAsDataURL(file)
  }

  const togglePrivacy = async () => {
    try {
      const { data } = await usersApi.updatePrivacy(user.id, !user.isPublicProfile)
      updateUser({ isPublicProfile: data.isPublicProfile })
      toast.success(data.isPublicProfile ? 'Profile is now public' : 'Profile is now private')
    } catch { toast.error('Failed to update') }
  }

  const removeSaved = async (cityId) => {
    try {
      await usersApi.unsaveDestination(user.id, cityId)
      setSavedDests(savedDests.filter(c => c.id !== cityId))
      toast.success('Removed')
    } catch { toast.error('Failed to remove') }
  }

  const TAB_LIST = [
    { id: 'info', label: 'Profile' },
    { id: 'saved', label: 'Saved Places' },
    { id: 'settings', label: 'Settings' },
  ]

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      {/* Profile Header Card */}
      <div className="relative overflow-hidden rounded-2xl border border-border">
        {/* Background gradient */}
        <div className="h-28 bg-gradient-to-br from-primary/30 via-primary/10 to-secondary/20" />
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-4 right-8 w-24 h-24 rounded-full bg-primary/10 blur-2xl" />
          <div className="absolute top-2 left-1/3 w-16 h-16 rounded-full bg-secondary/10 blur-xl" />
        </div>

        <div className="bg-surface px-6 pb-6">
          {/* Avatar */}
          <div className="relative inline-block -mt-12 mb-3">
            <div className="relative">
              <Avatar
                src={user?.avatarUrl}
                name={`${user?.firstName} ${user?.lastName}`}
                size="xl"
                className="ring-4 ring-surface"
              />
              <button
                onClick={() => fileRef.current?.click()}
                className="absolute bottom-0 right-0 w-7 h-7 bg-primary rounded-full flex items-center justify-center text-white hover:bg-primary-light transition-colors shadow-lg"
              >
                <Camera size={13} />
              </button>
            </div>
            <input ref={fileRef} type="file" accept="image/*" onChange={handleAvatar} className="hidden" />
          </div>

          <div className="flex items-start justify-between">
            <div>
              <h1 className="font-display text-2xl font-bold text-white">
                {user?.firstName} {user?.lastName}
              </h1>
              <p className="text-muted text-sm">{user?.email}</p>
              {user?.city && user?.country && (
                <p className="text-muted text-xs mt-1 flex items-center gap-1">
                  <MapPin size={11} /> {user.city}, {user.country}
                </p>
              )}
              {user?.bio && <p className="text-white/70 text-sm mt-2 max-w-sm">{user.bio}</p>}
            </div>
            <div className="flex flex-col items-end gap-2 mt-1">
              <Badge variant={user?.role === 'admin' ? 'secondary' : 'primary'}>{user?.role}</Badge>
              <button
                onClick={togglePrivacy}
                className="flex items-center gap-1 text-xs text-muted hover:text-white transition-colors"
              >
                {user?.isPublicProfile ? <Globe size={12} className="text-primary-light" /> : <Lock size={12} />}
                {user?.isPublicProfile ? 'Public' : 'Private'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      {stats && (
        <div className="grid grid-cols-4 gap-3">
          {STAT_CONFIG.map(({ key, label, icon, color }) => (
            <div key={key} className={`relative overflow-hidden rounded-2xl border bg-gradient-to-br ${color} p-4 text-center`}>
              <span className="text-2xl">{icon}</span>
              <p className="text-2xl font-bold text-white mt-1">{stats[key] ?? 0}</p>
              <p className="text-xs text-muted">{label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Badges / Achievements */}
      {stats?.badges?.length > 0 && (
        <div>
          <h2 className="text-xs font-semibold text-muted uppercase tracking-wide mb-3">Achievements</h2>
          <div className="grid grid-cols-2 gap-3">
            {stats.badges.map((b, i) => (
              <div key={b.name} className={`relative overflow-hidden rounded-2xl p-4 bg-gradient-to-br ${BADGE_BG[i % BADGE_BG.length]}`}>
                <div className="absolute top-2 right-2 opacity-20 text-4xl">{b.icon}</div>
                <span className="text-3xl">{b.icon}</span>
                <p className="text-white font-bold text-sm mt-1">{b.name}</p>
                <p className="text-white/70 text-xs mt-0.5 line-clamp-2">{b.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-surface rounded-xl border border-border">
        {TAB_LIST.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === tab.id
                ? 'bg-dark text-white shadow-sm'
                : 'text-muted hover:text-white'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Profile Info Tab */}
      {activeTab === 'info' && (
        <Card>
          <div className="flex items-center justify-between mb-4">
            <CardTitle>Profile Information</CardTitle>
            {!isEditing ? (
              <Button variant="secondary" size="sm" onClick={() => setIsEditing(true)}>
                <Edit2 size={14} className="mr-1.5" /> Edit
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button size="sm" onClick={handleSave} isLoading={isSaving}>
                  <Check size={14} className="mr-1" /> Save
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setIsEditing(false)}>Cancel</Button>
              </div>
            )}
          </div>
          <CardContent>
            {isEditing ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Input label="First Name" value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} />
                  <Input label="Last Name" value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} />
                </div>
                <Input label="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                <div className="grid grid-cols-2 gap-4">
                  <Input label="City" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
                  <Input label="Country" value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-muted uppercase tracking-wide mb-1">Bio</label>
                  <textarea
                    value={form.bio}
                    onChange={(e) => setForm({ ...form, bio: e.target.value })}
                    rows={3}
                    placeholder="Tell us about yourself..."
                    className="w-full px-4 py-2.5 bg-dark border border-border rounded-xl text-white placeholder-muted focus:outline-none focus:ring-2 focus:ring-primary/60 text-sm resize-none"
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-0">
                {[
                  ['Name', `${user?.firstName} ${user?.lastName}`],
                  ['Email', user?.email],
                  ['Phone', user?.phone || '—'],
                  ['Location', user?.city && user?.country ? `${user.city}, ${user.country}` : '—'],
                  ['Bio', user?.bio || '—'],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between py-3 border-b border-border/50 last:border-0">
                    <span className="text-muted text-sm">{k}</span>
                    <span className="text-white text-sm text-right max-w-xs">{v}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Saved Destinations Tab */}
      {activeTab === 'saved' && (
        <Card>
          <CardTitle className="mb-4">Saved Destinations</CardTitle>
          <CardContent>
            {savedDests.length === 0 ? (
              <div className="text-center py-10">
                <div className="text-5xl mb-3">🗺️</div>
                <p className="text-white font-medium">No saved destinations</p>
                <p className="text-muted text-sm mt-1">Explore cities and save your favorites</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {savedDests.map(city => (
                  <div key={city.id} className="relative group overflow-hidden rounded-xl">
                    <img src={city.imageUrl} alt={city.name} className="w-full h-24 object-cover group-hover:scale-105 transition-transform duration-300" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                    <div className="absolute bottom-2 left-2">
                      <p className="text-white text-sm font-semibold">{city.name}</p>
                      <p className="text-white/60 text-xs">{city.country}</p>
                    </div>
                    <button
                      onClick={() => removeSaved(city.id)}
                      className="absolute top-2 right-2 p-1.5 bg-black/40 rounded-full text-white hover:text-danger hover:bg-black/60 opacity-0 group-hover:opacity-100 transition-all"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Settings Tab */}
      {activeTab === 'settings' && (
        <Card>
          <CardTitle className="mb-4">Account Settings</CardTitle>
          <CardContent className="space-y-3">
            <button
              onClick={togglePrivacy}
              className="w-full flex items-center justify-between p-4 bg-dark rounded-xl hover:bg-dark/60 border border-border hover:border-primary/30 transition-all"
            >
              <div className="flex items-center gap-3">
                {user?.isPublicProfile
                  ? <Eye size={18} className="text-primary-light" />
                  : <EyeOff size={18} className="text-muted" />}
                <div className="text-left">
                  <p className="text-white text-sm font-medium">Profile Visibility</p>
                  <p className="text-xs text-muted mt-0.5">
                    {user?.isPublicProfile ? 'Public — anyone can see your profile' : 'Private — only you can see your profile'}
                  </p>
                </div>
              </div>
              <div className={`w-10 h-5.5 rounded-full transition-colors relative ${user?.isPublicProfile ? 'bg-primary' : 'bg-border'}`}>
                <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${user?.isPublicProfile ? 'translate-x-5' : 'translate-x-0.5'}`} />
              </div>
            </button>

            <button
              onClick={logout}
              className="w-full flex items-center gap-3 p-4 text-left bg-danger/10 border border-danger/20 rounded-xl hover:bg-danger/20 text-danger transition-all"
            >
              <LogOut size={18} />
              <span className="font-medium">Sign Out</span>
            </button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
