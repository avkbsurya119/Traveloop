import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, MapPin, Trash2, Copy, Share2, MoreVertical, ChevronRight, Calendar, DollarSign } from 'lucide-react'
import { Button } from '../components/common/Button'
import { Badge } from '../components/common/Badge'
import { TripCardSkeleton } from '../components/common/Skeleton'
import { toast } from '../components/common/Toast'
import { useTripStore } from '../store/tripStore'
import { tripsApi } from '../api/trips'
import { format } from 'date-fns'

const STATUS_STYLES = {
  draft:     { bar: 'bg-border', badge: 'default',   accent: 'border-l-border' },
  planned:   { bar: 'bg-blue-500', badge: 'planned',  accent: 'border-l-blue-500' },
  ongoing:   { bar: 'bg-primary', badge: 'primary',  accent: 'border-l-primary' },
  completed: { bar: 'bg-secondary', badge: 'secondary', accent: 'border-l-secondary' },
}

export default function TripList() {
  const { trips, fetchTrips, isLoading, deleteTrip } = useTripStore()
  const [sortBy, setSortBy] = useState('date')
  const [statusFilter, setStatusFilter] = useState('all')
  const [openMenu, setOpenMenu] = useState(null)

  useEffect(() => { fetchTrips() }, [fetchTrips])

  const statuses = ['all', 'draft', 'planned', 'ongoing', 'completed']

  const filtered = trips
    .filter(t => statusFilter === 'all' || t.status === statusFilter)
    .sort((a, b) => {
      if (sortBy === 'budget') return Number(b.totalBudget) - Number(a.totalBudget)
      if (sortBy === 'name') return a.title.localeCompare(b.title)
      return new Date(b.startDate) - new Date(a.startDate)
    })

  const grouped = {
    ongoing: filtered.filter(t => t.status === 'ongoing'),
    upcoming: filtered.filter(t => t.status !== 'completed' && t.status !== 'ongoing' && new Date(t.startDate) > new Date()),
    completed: filtered.filter(t => t.status === 'completed'),
    other: filtered.filter(t => !['ongoing', 'completed'].includes(t.status) && new Date(t.startDate) <= new Date()),
  }

  const handleDelete = async (tripId) => {
    if (!confirm('Delete this trip?')) return
    try { await deleteTrip(tripId); toast.success('Trip deleted') }
    catch { toast.error('Failed to delete') }
    setOpenMenu(null)
  }

  const handleDuplicate = async (tripId) => {
    try { await tripsApi.clone(tripId); await fetchTrips(); toast.success('Trip duplicated!') }
    catch { toast.error('Failed to duplicate') }
    setOpenMenu(null)
  }

  const handleShare = async (tripId) => {
    try {
      await tripsApi.shareTrip(tripId)
      await navigator.clipboard.writeText(`${window.location.origin}/trips/${tripId}`)
      toast.success('Share link copied!')
    } catch { toast.error('Failed to share') }
    setOpenMenu(null)
  }

  const renderGroup = (label, items) => {
    if (items.length === 0) return null
    const emoji = label === 'ongoing' ? '🟢' : label === 'upcoming' ? '📅' : label === 'completed' ? '✅' : '📝'
    return (
      <div key={label} className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <span>{emoji}</span>
          <h2 className="text-base font-semibold text-white capitalize">{label}</h2>
          <span className="text-xs text-muted bg-surface px-2 py-0.5 rounded-full">{items.length}</span>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map(trip => <TripCard key={trip.id} trip={trip} openMenu={openMenu} setOpenMenu={setOpenMenu} onDelete={handleDelete} onDuplicate={handleDuplicate} onShare={handleShare} />)}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-white">My Trips</h1>
          <p className="text-muted text-sm">{trips.length} trip{trips.length !== 1 ? 's' : ''} total</p>
        </div>
        <Link to="/trips/new">
          <Button className="gap-2">
            <Plus size={18} /> New Trip
          </Button>
        </Link>
      </div>

      {/* Filters + Sort */}
      <div className="flex items-center gap-4 flex-wrap">
        <div className="flex gap-1 p-1 bg-surface rounded-xl border border-border">
          {statuses.map(s => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-lg text-xs capitalize transition-all font-medium ${
                statusFilter === s ? 'bg-dark text-white shadow-sm' : 'text-muted hover:text-white'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
        <div className="flex gap-1 ml-auto">
          <span className="text-xs text-muted self-center mr-1">Sort:</span>
          {['date', 'name', 'budget'].map(s => (
            <button
              key={s}
              onClick={() => setSortBy(s)}
              className={`px-3 py-1.5 rounded-full text-xs capitalize transition-all ${
                sortBy === s ? 'bg-secondary text-dark font-semibold' : 'bg-surface text-muted hover:text-white border border-border'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => <TripCardSkeleton key={i} />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-6xl mb-4">🧳</div>
          <p className="text-white font-semibold text-lg">No trips found</p>
          <p className="text-muted mt-1 mb-6">
            {statusFilter !== 'all' ? `No ${statusFilter} trips` : 'Start planning your next adventure!'}
          </p>
          <Link to="/trips/new"><Button>Create your first trip</Button></Link>
        </div>
      ) : (
        <>
          {renderGroup('ongoing', grouped.ongoing)}
          {renderGroup('upcoming', grouped.upcoming)}
          {renderGroup('completed', grouped.completed)}
          {renderGroup('drafts & other', grouped.other)}
        </>
      )}
    </div>
  )
}

function TripCard({ trip, openMenu, setOpenMenu, onDelete, onDuplicate, onShare }) {
  const style = STATUS_STYLES[trip.status] || STATUS_STYLES.draft
  const days = Math.ceil((new Date(trip.endDate) - new Date(trip.startDate)) / (1000 * 60 * 60 * 24))

  return (
    <div className="relative group">
      <Link to={`/trips/${trip.id}`}>
        <div className={`bg-surface border border-border rounded-2xl overflow-hidden hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 hover:-translate-y-0.5 border-l-4 ${style.accent}`}>
          {/* Cover image */}
          <div className="h-36 relative overflow-hidden bg-gradient-to-br from-primary/20 to-secondary/20">
            {trip.coverPhotoUrl && (
              <img
                src={trip.coverPhotoUrl}
                alt={trip.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-surface/60 to-transparent" />
            <div className="absolute top-3 right-3">
              <Badge variant={trip.status}>{trip.status}</Badge>
            </div>
            {days > 0 && (
              <div className="absolute bottom-3 left-3 text-xs text-white/80 bg-black/40 backdrop-blur-sm px-2 py-1 rounded-full">
                {days} day{days !== 1 ? 's' : ''}
              </div>
            )}
          </div>

          {/* Body */}
          <div className="p-4">
            <h3 className="font-semibold text-white mb-1 truncate">{trip.title}</h3>

            {/* Dates */}
            <div className="flex items-center gap-1.5 text-xs text-muted mb-3">
              <Calendar size={11} />
              {format(new Date(trip.startDate), 'MMM d')} – {format(new Date(trip.endDate), 'MMM d, yyyy')}
            </div>

            {/* Cities */}
            {trip.stops?.length > 0 && (
              <div className="flex items-center gap-1 flex-wrap mb-3">
                {trip.stops.slice(0, 3).map((stop, i) => (
                  <span key={stop.id} className="flex items-center gap-0.5 text-xs text-muted">
                    {i > 0 && <ChevronRight size={10} className="text-border" />}
                    <MapPin size={10} />
                    {stop.city?.name}
                  </span>
                ))}
                {trip.stops.length > 3 && (
                  <span className="text-xs text-muted">+{trip.stops.length - 3}</span>
                )}
              </div>
            )}

            {/* Budget bar */}
            {trip.totalBudget > 0 && (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1 text-xs text-secondary">
                  <DollarSign size={11} />
                  <span className="font-semibold">{Number(trip.totalBudget).toLocaleString()}</span>
                </div>
                <div className="h-1 w-20 bg-dark rounded-full overflow-hidden">
                  <div className={`h-full ${style.bar} rounded-full`} style={{ width: '35%' }} />
                </div>
              </div>
            )}
          </div>
        </div>
      </Link>

      {/* Action Menu */}
      <div className="absolute top-3 left-3 z-10">
        <button
          onClick={(e) => { e.preventDefault(); setOpenMenu(openMenu === trip.id ? null : trip.id) }}
          className="p-1.5 bg-black/40 backdrop-blur-sm hover:bg-black/60 rounded-full text-white opacity-0 group-hover:opacity-100 transition-all"
        >
          <MoreVertical size={14} />
        </button>
        {openMenu === trip.id && (
          <div className="absolute top-9 left-0 w-40 glass border border-border rounded-xl shadow-2xl overflow-hidden z-20 animate-fade-up">
            <button onClick={() => onDuplicate(trip.id)} className="w-full px-4 py-2.5 text-left text-sm text-white hover:bg-dark/50 flex items-center gap-2">
              <Copy size={13} className="text-muted" /> Duplicate
            </button>
            <button onClick={() => onShare(trip.id)} className="w-full px-4 py-2.5 text-left text-sm text-white hover:bg-dark/50 flex items-center gap-2">
              <Share2 size={13} className="text-muted" /> Share
            </button>
            <div className="border-t border-border/50" />
            <button onClick={() => onDelete(trip.id)} className="w-full px-4 py-2.5 text-left text-sm text-danger hover:bg-dark/50 flex items-center gap-2">
              <Trash2 size={13} /> Delete
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
