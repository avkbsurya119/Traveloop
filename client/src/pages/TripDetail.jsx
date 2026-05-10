import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import {
  Calendar, MapPin, DollarSign, Edit, Clipboard, FileText, Receipt,
  Share2, FileDown, Plane, BarChart2, Sun, Sunset, Moon, Map, ChevronRight
} from 'lucide-react'
import { Card, CardTitle, CardContent } from '../components/common/Card'
import { Button } from '../components/common/Button'
import { Badge } from '../components/common/Badge'
import { Skeleton } from '../components/common/Skeleton'
import { toast } from '../components/common/Toast'
import { useTripStore } from '../store/tripStore'
import { tripsApi } from '../api/trips'
import { format, differenceInDays } from 'date-fns'

const SECTION_ICONS = { morning: Sun, afternoon: Sunset, evening: Moon, transit: Plane }
const SECTION_COLORS = {
  morning: 'text-amber-400', afternoon: 'text-orange-400',
  evening: 'text-indigo-400', transit: 'text-sky-400'
}

const ACTION_BUTTONS = [
  { to: 'build',    label: 'Edit Itinerary', icon: Edit,      variant: 'secondary' },
  { to: 'timeline', label: 'Timeline',       icon: BarChart2, variant: 'ghost' },
  { to: 'checklist',label: 'Checklist',      icon: Clipboard, variant: 'ghost' },
  { to: 'notes',    label: 'Notes',          icon: FileText,  variant: 'ghost' },
  { to: 'expenses', label: 'Expenses',       icon: Receipt,   variant: 'ghost' },
  { to: 'invoice',  label: 'Invoice',        icon: FileDown,  variant: 'ghost' },
]

function StopMap({ stop }) {
  const lat = stop.city?.latitude ? Number(stop.city.latitude) : null
  const lon = stop.city?.longitude ? Number(stop.city.longitude) : null

  if (!lat || !lon) {
    return (
      <div className="h-48 bg-dark rounded-xl flex items-center justify-center">
        <div className="text-center">
          <MapPin size={24} className="text-muted mx-auto mb-2" />
          <p className="text-muted text-sm">No coordinates for {stop.city?.name}</p>
        </div>
      </div>
    )
  }

  const delta = 0.08
  const bbox = `${lon - delta},${lat - delta},${lon + delta},${lat + delta}`
  const src = `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${lat},${lon}`

  return (
    <div className="relative h-52 rounded-xl overflow-hidden">
      <iframe
        title={`Map of ${stop.city?.name}`}
        src={src}
        className="w-full h-full border-0"
        loading="lazy"
        referrerPolicy="no-referrer"
        sandbox="allow-scripts allow-same-origin"
      />
      <a
        href={`https://www.openstreetmap.org/?mlat=${lat}&mlon=${lon}#map=13/${lat}/${lon}`}
        target="_blank"
        rel="noopener noreferrer"
        className="absolute bottom-2 right-2 px-2.5 py-1 bg-dark/80 backdrop-blur-sm text-xs text-white rounded-full hover:bg-dark transition-colors flex items-center gap-1"
      >
        Open map <ChevronRight size={10} />
      </a>
    </div>
  )
}

export default function TripDetail() {
  const { id } = useParams()
  const { currentTrip: trip, fetchTrip, isLoading } = useTripStore()
  const [mapStopIdx, setMapStopIdx] = useState(0)
  const [showMap, setShowMap] = useState(false)

  useEffect(() => { fetchTrip(id) }, [id, fetchTrip])

  if (isLoading || !trip) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-48 w-full rounded-2xl" />
        <Skeleton className="h-8 w-1/2" />
        <div className="grid md:grid-cols-3 gap-4">
          {[1,2,3].map(i => <Skeleton key={i} className="h-28" />)}
        </div>
      </div>
    )
  }

  const duration = differenceInDays(new Date(trip.endDate), new Date(trip.startDate)) + 1
  const totalExpenses = trip.expenses?.reduce((sum, e) => sum + Number(e.amount), 0) || 0
  const allItems = trip.stops?.flatMap(s => s.itineraryItems || []) || []
  const budgetPercent = trip.totalBudget > 0
    ? Math.min((totalExpenses / Number(trip.totalBudget)) * 100, 100) : 0
  const activeStop = trip.stops?.[mapStopIdx]

  return (
    <div className="space-y-6">
      {/* Hero Header */}
      <div className="relative h-52 rounded-2xl overflow-hidden group">
        {trip.coverPhotoUrl
          ? <img src={trip.coverPhotoUrl} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
          : <div className="w-full h-full bg-gradient-to-r from-primary/60 via-primary/30 to-secondary/40" />
        }
        <div className="absolute inset-0 bg-gradient-to-t from-dark/90 via-dark/30 to-transparent" />
        <div className="absolute bottom-5 left-5 right-5">
          <div className="flex items-center gap-2 mb-2">
            <Badge variant={trip.status}>{trip.status}</Badge>
            {trip.isPublic && <Badge variant="secondary">🌐 Public</Badge>}
          </div>
          <h1 className="font-display text-2xl md:text-3xl font-bold text-white drop-shadow-lg">{trip.title}</h1>
          <p className="text-white/70 mt-1 text-sm flex items-center gap-3">
            <span className="flex items-center gap-1">
              <Calendar size={13} />
              {format(new Date(trip.startDate), 'MMM d')} – {format(new Date(trip.endDate), 'MMM d, yyyy')}
            </span>
            <span>{duration} days</span>
          </p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-2">
        {ACTION_BUTTONS.map(btn => (
          <Link key={btn.to} to={`/trips/${id}/${btn.to}`}>
            <Button variant={btn.variant} size="sm" className="gap-1.5">
              <btn.icon size={15} /> {btn.label}
            </Button>
          </Link>
        ))}
        <Button variant="ghost" size="sm" className="gap-1.5" onClick={() => setShowMap(v => !v)}>
          <Map size={15} /> {showMap ? 'Hide Map' : 'View Map'}
        </Button>
        <Button variant="ghost" size="sm" className="gap-1.5" onClick={async () => {
          try {
            await tripsApi.shareTrip(id)
            await navigator.clipboard.writeText(`${window.location.origin}/trips/${id}`)
            toast.success('Share link copied!')
          } catch { toast.error('Failed to share') }
        }}>
          <Share2 size={15} /> Share
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-primary/15 to-transparent">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-primary/20 rounded-xl"><MapPin className="text-primary-light" size={20} /></div>
            <div>
              <p className="text-muted text-xs">Destinations</p>
              <p className="text-xl font-bold text-white">{trip.stops?.length || 0}</p>
            </div>
          </div>
        </Card>
        <Card className="bg-gradient-to-br from-secondary/15 to-transparent">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-secondary/20 rounded-xl"><DollarSign className="text-secondary" size={20} /></div>
            <div>
              <p className="text-muted text-xs">Budget</p>
              <p className="text-xl font-bold text-white">${Number(trip.totalBudget || 0).toLocaleString()}</p>
            </div>
          </div>
        </Card>
        <Card className="bg-gradient-to-br from-blue-500/15 to-transparent">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-500/20 rounded-xl"><Receipt className="text-blue-400" size={20} /></div>
            <div>
              <p className="text-muted text-xs">Spent</p>
              <p className="text-xl font-bold text-white">${totalExpenses.toLocaleString()}</p>
            </div>
          </div>
        </Card>
        <Card className="bg-gradient-to-br from-violet-500/15 to-transparent">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-violet-500/20 rounded-xl"><BarChart2 className="text-violet-400" size={20} /></div>
            <div>
              <p className="text-muted text-xs">Activities</p>
              <p className="text-xl font-bold text-white">{allItems.length}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Budget Progress */}
      {trip.totalBudget > 0 && (
        <Card>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-muted">Budget Usage</span>
            <span className="text-sm font-semibold text-white">{budgetPercent.toFixed(0)}%</span>
          </div>
          <div className="h-2.5 bg-dark rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${budgetPercent >= 100 ? 'bg-danger' : budgetPercent >= 80 ? 'bg-secondary' : 'bg-gradient-to-r from-primary to-primary-light'}`}
              style={{ width: `${budgetPercent}%` }}
            />
          </div>
          <div className="flex justify-between mt-1.5 text-xs text-muted">
            <span>${totalExpenses.toLocaleString()} spent</span>
            <span className={totalExpenses > Number(trip.totalBudget) ? 'text-danger' : 'text-primary-light'}>
              {totalExpenses > Number(trip.totalBudget)
                ? `Over by $${(totalExpenses - Number(trip.totalBudget)).toLocaleString()}`
                : `$${(Number(trip.totalBudget) - totalExpenses).toLocaleString()} left`}
            </span>
          </div>
        </Card>
      )}

      {/* Map View */}
      {showMap && trip.stops?.length > 0 && (
        <Card className="animate-fade-up">
          <div className="flex items-center gap-2 mb-4">
            <Map size={16} className="text-primary-light" />
            <CardTitle>Destination Map</CardTitle>
          </div>
          {trip.stops.length > 1 && (
            <div className="flex gap-2 mb-3 overflow-x-auto no-scrollbar pb-1">
              {trip.stops.map((stop, idx) => (
                <button
                  key={stop.id}
                  onClick={() => setMapStopIdx(idx)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm whitespace-nowrap transition-all flex-shrink-0 ${
                    idx === mapStopIdx
                      ? 'bg-primary text-white'
                      : 'bg-dark text-muted hover:text-white border border-border'
                  }`}
                >
                  {stop.city?.imageUrl && (
                    <img src={stop.city.imageUrl} alt="" className="w-4 h-4 rounded-full object-cover" />
                  )}
                  {stop.city?.name || `Stop ${idx + 1}`}
                </button>
              ))}
            </div>
          )}
          {activeStop && <StopMap stop={activeStop} />}
          {activeStop && (
            <div className="mt-3 flex items-center gap-2 text-xs text-muted">
              <MapPin size={12} className="text-primary-light" />
              <span>{activeStop.city?.name}, {activeStop.city?.country}</span>
              {activeStop.city?.latitude && (
                <span className="font-mono">
                  {Number(activeStop.city.latitude).toFixed(4)}°, {Number(activeStop.city.longitude).toFixed(4)}°
                </span>
              )}
            </div>
          )}
        </Card>
      )}

      {/* Itinerary */}
      <Card>
        <div className="flex items-center justify-between mb-5">
          <CardTitle>Itinerary</CardTitle>
          <Link to={`/trips/${id}/timeline`}>
            <Button variant="ghost" size="sm" className="gap-1 text-xs">
              <BarChart2 size={13} /> Full Timeline
            </Button>
          </Link>
        </div>
        <CardContent>
          {trip.stops?.length === 0 ? (
            <div className="text-center py-10">
              <div className="text-4xl mb-3">✈️</div>
              <p className="text-muted mb-4">No stops added yet</p>
              <Link to={`/trips/${id}/build`}><Button>Build Itinerary</Button></Link>
            </div>
          ) : (
            <div className="space-y-0">
              {trip.stops?.map((stop, index) => (
                <div key={stop.id} className="flex gap-4">
                  <div className="flex flex-col items-center pt-1">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-primary-light flex items-center justify-center text-white font-bold text-sm shadow-md shadow-primary/20 flex-shrink-0">
                      {index + 1}
                    </div>
                    {index < trip.stops.length - 1 && (
                      <div className="flex flex-col items-center flex-1 py-2">
                        <div className="w-0.5 flex-1 bg-gradient-to-b from-primary/50 to-transparent" />
                        <Plane size={14} className="text-muted my-1" />
                        <div className="w-0.5 h-4 bg-gradient-to-b from-transparent to-primary/50" />
                      </div>
                    )}
                  </div>

                  <div className="flex-1 pb-6">
                    <div className="flex items-center gap-3 mb-3">
                      {stop.city?.imageUrl && (
                        <img src={stop.city.imageUrl} alt={stop.city?.name} className="w-12 h-12 rounded-xl object-cover" loading="lazy" />
                      )}
                      <div>
                        <h3 className="font-bold text-white">{stop.city?.name || 'Stop'}</h3>
                        <p className="text-xs text-muted">
                          {format(new Date(stop.arrivalDate), 'MMM d')} – {format(new Date(stop.departureDate), 'MMM d')}
                          <span className="ml-2">{differenceInDays(new Date(stop.departureDate), new Date(stop.arrivalDate)) + 1} days</span>
                        </p>
                      </div>
                      <button
                        onClick={() => { setMapStopIdx(index); setShowMap(true) }}
                        className="ml-auto p-1.5 text-muted hover:text-primary-light hover:bg-primary/10 rounded-lg transition-all"
                        title={`View ${stop.city?.name} on map`}
                      >
                        <Map size={14} />
                      </button>
                    </div>

                    {stop.itineraryItems?.length > 0 && (
                      <div className="space-y-1.5 pl-1">
                        {stop.itineraryItems.slice(0, 5).map(item => {
                          const Icon = SECTION_ICONS[item.sectionType] || Sun
                          const colorClass = SECTION_COLORS[item.sectionType] || 'text-muted'
                          return (
                            <div key={item.id} className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-dark/40 transition-colors">
                              <Icon size={14} className={`flex-shrink-0 ${colorClass}`} />
                              <span className="text-sm text-white/90 flex-1 truncate">
                                {item.customTitle || item.activity?.name}
                              </span>
                              {Number(item.cost) > 0 && (
                                <span className="text-xs text-secondary font-medium">${Number(item.cost).toLocaleString()}</span>
                              )}
                            </div>
                          )
                        })}
                        {stop.itineraryItems.length > 5 && (
                          <Link to={`/trips/${id}/timeline`} className="text-xs text-primary hover:text-primary-light pl-6 mt-1 block">
                            +{stop.itineraryItems.length - 5} more activities
                          </Link>
                        )}
                      </div>
                    )}
                    {!stop.itineraryItems?.length && (
                      <p className="text-xs text-muted pl-1">No activities added yet</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Description */}
      {trip.description && (
        <Card>
          <CardTitle className="mb-3">About this trip</CardTitle>
          <p className="text-white/80 leading-relaxed">{trip.description}</p>
        </Card>
      )}
    </div>
  )
}
