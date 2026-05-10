import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Card, CardContent, CardTitle } from '../components/common/Card'
import { Avatar } from '../components/common/Avatar'
import { Badge } from '../components/common/Badge'
import { Skeleton } from '../components/common/Skeleton'
import { usersApi } from '../api/users'
import { MapPin, Calendar, Globe, Lock, ArrowLeft } from 'lucide-react'
import { format } from 'date-fns'

const STAT_CONFIG = [
  { key: 'tripCount', label: 'Trips', icon: '✈️', color: 'from-blue-500/20 to-blue-600/10 border-blue-500/30' },
  { key: 'countriesVisited', label: 'Countries', icon: '🌍', color: 'from-emerald-500/20 to-emerald-600/10 border-emerald-500/30' },
  { key: 'postCount', label: 'Posts', icon: '📸', color: 'from-purple-500/20 to-purple-600/10 border-purple-500/30' },
]

export default function PublicProfile() {
  const { username } = useParams()
  const [user, setUser] = useState(null)
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true)
        setError(null)
        const { data } = await usersApi.getByUsername(username)
        setUser(data)

        // Fetch stats
        const statsRes = await usersApi.getStats(data.id)
        setStats(statsRes.data)
      } catch (err) {
        if (err.response?.status === 404) {
          setError('User not found')
        } else if (err.response?.status === 403) {
          setError('This profile is private')
        } else {
          setError('Failed to load profile')
        }
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [username])

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto p-4 space-y-5">
        <Skeleton className="h-40 rounded-2xl" />
        <div className="grid grid-cols-3 gap-3">
          <Skeleton className="h-24 rounded-2xl" />
          <Skeleton className="h-24 rounded-2xl" />
          <Skeleton className="h-24 rounded-2xl" />
        </div>
        <Skeleton className="h-64 rounded-2xl" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto p-4">
        <Card>
          <CardContent className="py-16 text-center">
            {error === 'This profile is private' ? (
              <>
                <Lock size={48} className="mx-auto text-muted mb-4" />
                <h2 className="text-xl font-semibold text-white mb-2">Private Profile</h2>
                <p className="text-muted">This user has set their profile to private.</p>
              </>
            ) : (
              <>
                <Globe size={48} className="mx-auto text-muted mb-4" />
                <h2 className="text-xl font-semibold text-white mb-2">Profile Not Found</h2>
                <p className="text-muted">The user you're looking for doesn't exist.</p>
              </>
            )}
            <Link
              to="/explore"
              className="inline-flex items-center gap-2 mt-6 text-primary-light hover:underline"
            >
              <ArrowLeft size={16} />
              Explore destinations
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-5">
      {/* Profile Header Card */}
      <div className="relative overflow-hidden rounded-2xl border border-border">
        <div className="h-28 bg-gradient-to-br from-primary/30 via-primary/10 to-secondary/20" />
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-4 right-8 w-24 h-24 rounded-full bg-primary/10 blur-2xl" />
          <div className="absolute top-2 left-1/3 w-16 h-16 rounded-full bg-secondary/10 blur-xl" />
        </div>

        <div className="bg-surface px-6 pb-6">
          <div className="relative inline-block -mt-12 mb-3">
            <Avatar
              src={user.avatarUrl}
              name={`${user.firstName} ${user.lastName}`}
              size="xl"
              className="ring-4 ring-surface"
            />
          </div>

          <div className="flex items-start justify-between">
            <div>
              <h1 className="font-display text-2xl font-bold text-white">
                {user.firstName} {user.lastName}
              </h1>
              {user.username && (
                <p className="text-primary-light text-sm">@{user.username}</p>
              )}
              {(user.city || user.country) && (
                <p className="text-muted text-xs mt-1 flex items-center gap-1">
                  <MapPin size={11} />
                  {[user.city, user.country].filter(Boolean).join(', ')}
                </p>
              )}
              {user.bio && (
                <p className="text-white/70 text-sm mt-2 max-w-sm">{user.bio}</p>
              )}
              <p className="text-muted text-xs mt-2 flex items-center gap-1">
                <Calendar size={11} />
                Member since {format(new Date(user.createdAt), 'MMMM yyyy')}
              </p>
            </div>
            <Badge variant="primary">
              <Globe size={12} className="mr-1" />
              Traveler
            </Badge>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      {stats && (
        <div className="grid grid-cols-3 gap-3">
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
        <Card>
          <CardTitle className="mb-4">Achievements</CardTitle>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              {stats.badges.map((b, i) => (
                <div
                  key={b.name}
                  className="relative overflow-hidden rounded-xl p-4 bg-gradient-to-br from-amber-400/20 to-orange-500/10 border border-amber-500/30"
                >
                  <span className="text-2xl">{b.icon}</span>
                  <p className="text-white font-bold text-sm mt-1">{b.name}</p>
                  <p className="text-white/60 text-xs mt-0.5">{b.description}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Public Trips */}
      {user.trips?.length > 0 && (
        <Card>
          <CardTitle className="mb-4">Public Trips</CardTitle>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              {user.trips.map(trip => (
                <div
                  key={trip.id}
                  className="relative group overflow-hidden rounded-xl"
                >
                  <img
                    src={trip.coverPhotoUrl || '/default-trip.jpg'}
                    alt={trip.title}
                    className="w-full h-28 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                  <div className="absolute bottom-2 left-2 right-2">
                    <p className="text-white text-sm font-semibold truncate">{trip.title}</p>
                    <p className="text-white/60 text-xs">
                      {format(new Date(trip.startDate), 'MMM d')} - {format(new Date(trip.endDate), 'MMM d, yyyy')}
                    </p>
                  </div>
                  <Badge
                    variant={trip.status === 'completed' ? 'success' : 'primary'}
                    className="absolute top-2 right-2 text-xs"
                  >
                    {trip.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Countries Visited */}
      {stats?.countries?.length > 0 && (
        <Card>
          <CardTitle className="mb-4">Countries Visited</CardTitle>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {stats.countries.map(country => (
                <Badge key={country} variant="secondary">
                  {country}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
