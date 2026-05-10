import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { MapPin, Calendar, DollarSign, Clock, ChevronRight, Plane, Sun, Sunset, Moon, Hotel } from 'lucide-react'
import { Card, CardTitle } from '../components/common/Card'
import { Button } from '../components/common/Button'
import { Badge } from '../components/common/Badge'
import { useTripStore } from '../store/tripStore'
import { tripsApi } from '../api/trips'
import { format, differenceInDays, eachDayOfInterval } from 'date-fns'

const SECTION_ICONS = {
  morning: Sun,
  afternoon: Sunset,
  evening: Moon,
  transit: Plane,
  hotel: Hotel,
}
const SECTION_COLORS = {
  morning: '#F59E0B',
  afternoon: '#F97316',
  evening: '#6366F1',
  transit: '#0EA5E9',
  hotel: '#8B5CF6',
}

export default function TripTimeline() {
  const { id } = useParams()
  const { currentTrip: trip, fetchTrip } = useTripStore()
  const [items, setItems] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedStop, setSelectedStop] = useState(null)

  useEffect(() => {
    const load = async () => {
      await fetchTrip(id)
      const { data } = await tripsApi.getItinerary(id)
      setItems(data)
      setIsLoading(false)
    }
    load()
  }, [id, fetchTrip])

  useEffect(() => {
    if (trip?.stops?.length > 0 && !selectedStop) {
      setSelectedStop(trip.stops[0])
    }
  }, [trip])

  if (isLoading || !trip) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-8 bg-surface rounded w-1/3" />
        <div className="h-20 bg-surface rounded" />
        <div className="h-64 bg-surface rounded" />
      </div>
    )
  }

  const duration = differenceInDays(new Date(trip.endDate), new Date(trip.startDate)) + 1
  const stops = trip.stops || []
  const totalBudget = items.reduce((sum, i) => sum + Number(i.cost || 0), 0)

  // Generate all days for the selected stop
  const stopItems = selectedStop
    ? items.filter(i => i.stopId === selectedStop.id)
    : items

  const days = selectedStop
    ? eachDayOfInterval({
        start: new Date(selectedStop.arrivalDate),
        end: new Date(selectedStop.departureDate),
      })
    : []

  const itemsByDay = days.reduce((acc, day) => {
    const dayStr = format(day, 'yyyy-MM-dd')
    acc[dayStr] = stopItems.filter(i => {
      if (!i.date) return false
      return format(new Date(i.date), 'yyyy-MM-dd') === dayStr
    })
    return acc
  }, {})

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="relative h-44 rounded-2xl overflow-hidden">
        {trip.coverPhotoUrl
          ? <img src={trip.coverPhotoUrl} alt="" className="w-full h-full object-cover" />
          : <div className="w-full h-full bg-gradient-to-r from-primary/60 to-secondary/40" />
        }
        <div className="absolute inset-0 bg-gradient-to-r from-dark/70 to-dark/30" />
        <div className="absolute inset-0 p-6 flex flex-col justify-end">
          <Badge variant={trip.status} className="mb-2 self-start">{trip.status}</Badge>
          <h1 className="font-display text-2xl md:text-3xl font-bold text-white">{trip.title}</h1>
          <div className="flex items-center gap-4 mt-2 text-white/70 text-sm">
            <span className="flex items-center gap-1"><Calendar size={14} />{format(new Date(trip.startDate), 'MMM d')} – {format(new Date(trip.endDate), 'MMM d, yyyy')}</span>
            <span className="flex items-center gap-1"><Clock size={14} />{duration} days</span>
            <span className="flex items-center gap-1"><DollarSign size={14} />${totalBudget.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-2">
        <Link to={`/trips/${id}`}><Button variant="secondary" size="sm">Overview</Button></Link>
        <Link to={`/trips/${id}/build`}><Button variant="ghost" size="sm">Edit Itinerary</Button></Link>
        <Link to={`/trips/${id}/expenses`}><Button variant="ghost" size="sm">Expenses</Button></Link>
      </div>

      {/* Horizontal Stop Timeline */}
      <Card>
        <CardTitle className="mb-4 flex items-center gap-2">
          <MapPin size={16} className="text-primary-light" /> Journey Map
        </CardTitle>
        <div className="flex items-center gap-0 overflow-x-auto pb-3 -mx-1 px-1">
          {stops.map((stop, idx) => (
            <div key={stop.id} className="flex items-center flex-shrink-0">
              {/* Stop node */}
              <button
                onClick={() => setSelectedStop(stop)}
                className={`flex flex-col items-center group transition-all ${selectedStop?.id === stop.id ? 'scale-110' : 'opacity-70 hover:opacity-100'}`}
              >
                <div className={`relative w-16 h-16 rounded-2xl overflow-hidden border-2 transition-all shadow-lg ${selectedStop?.id === stop.id ? 'border-primary-light shadow-primary/40' : 'border-border hover:border-primary/50'}`}>
                  {stop.city?.imageUrl
                    ? <img src={stop.city.imageUrl} alt={stop.city?.name} className="w-full h-full object-cover" />
                    : <div className="w-full h-full bg-gradient-to-br from-primary/30 to-secondary/20 flex items-center justify-center text-2xl">🌍</div>
                  }
                  {selectedStop?.id === stop.id && (
                    <div className="absolute inset-0 bg-primary/20" />
                  )}
                </div>
                <p className="text-xs font-semibold text-white mt-1.5 max-w-[64px] truncate text-center">
                  {stop.city?.name || `Stop ${idx + 1}`}
                </p>
                <p className="text-[10px] text-muted">
                  {differenceInDays(new Date(stop.departureDate), new Date(stop.arrivalDate)) + 1}d
                </p>
              </button>

              {/* Connector */}
              {idx < stops.length - 1 && (
                <div className="flex items-center mx-1 flex-shrink-0">
                  <div className="w-6 h-0.5 bg-gradient-to-r from-primary/60 to-secondary/40" />
                  <Plane size={16} className="text-muted mx-0.5" />
                  <div className="w-6 h-0.5 bg-gradient-to-r from-secondary/40 to-primary/60" />
                </div>
              )}
            </div>
          ))}
        </div>
      </Card>

      {/* Selected Stop Detail */}
      {selectedStop && (
        <div className="space-y-4 animate-fade-up">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-display text-xl font-bold text-white flex items-center gap-2">
                <MapPin size={18} className="text-primary-light" />
                {selectedStop.city?.name}
              </h2>
              <p className="text-muted text-sm">
                {format(new Date(selectedStop.arrivalDate), 'MMM d')} – {format(new Date(selectedStop.departureDate), 'MMM d, yyyy')}
                <span className="mx-2">·</span>
                {differenceInDays(new Date(selectedStop.departureDate), new Date(selectedStop.arrivalDate)) + 1} days
              </p>
            </div>
            <Link to={`/trips/${id}/build`}>
              <Button variant="secondary" size="sm" className="gap-1">
                <ChevronRight size={14} /> Edit
              </Button>
            </Link>
          </div>

          {/* Day-by-day cards */}
          {days.length === 0 ? (
            <Card className="text-center py-10">
              <p className="text-muted">No days in this stop. Check the dates.</p>
            </Card>
          ) : days.map((day, dayIdx) => {
            const dayStr = format(day, 'yyyy-MM-dd')
            const dayItems = itemsByDay[dayStr] || []
            const dayTotal = dayItems.reduce((sum, i) => sum + Number(i.cost || 0), 0)
            const isOverBudget = trip.totalBudget > 0 && dayTotal > Number(trip.totalBudget) / duration

            return (
              <Card key={dayStr} className={isOverBudget ? 'border-danger/40' : ''}>
                {/* Day header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary-light flex items-center justify-center">
                      <span className="text-white font-bold text-sm">{dayIdx + 1}</span>
                    </div>
                    <div>
                      <p className="text-white font-semibold">Day {dayIdx + 1}</p>
                      <p className="text-muted text-xs">{format(day, 'EEEE, MMM d')}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted">Day total</p>
                    <p className={`font-bold ${isOverBudget ? 'text-danger' : 'text-secondary'}`}>
                      ${dayTotal.toLocaleString()}
                    </p>
                  </div>
                </div>

                {/* Activity rows with arrow connectors */}
                {dayItems.length === 0 ? (
                  <div className="text-center py-6 text-muted text-sm">No activities planned for this day</div>
                ) : (
                  <div className="space-y-0">
                    {dayItems.map((item, itemIdx) => {
                      const Icon = SECTION_ICONS[item.sectionType] || Sun
                      const color = SECTION_COLORS[item.sectionType] || '#2ECC71'
                      return (
                        <div key={item.id}>
                          {/* Activity Row */}
                          <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-dark/50 transition-colors group">
                            <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                              style={{ backgroundColor: `${color}20` }}>
                              <Icon size={16} style={{ color }} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-white text-sm font-medium truncate">
                                {item.customTitle || item.activity?.name || 'Activity'}
                              </p>
                              {item.notes && (
                                <p className="text-xs text-muted truncate">{item.notes}</p>
                              )}
                            </div>
                            <div className="flex-shrink-0 text-right">
                              {Number(item.cost) > 0 && (
                                <p className="text-sm font-semibold text-secondary">${Number(item.cost).toLocaleString()}</p>
                              )}
                              {item.startTime && (
                                <p className="text-xs text-muted">{item.startTime}</p>
                              )}
                            </div>
                          </div>
                          {/* Arrow connector between activities */}
                          {itemIdx < dayItems.length - 1 && (
                            <div className="flex items-center pl-7 py-0.5">
                              <div className="w-0.5 h-4 bg-border" />
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                )}

                {/* Day total row */}
                {dayItems.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-border/50 flex items-center justify-between">
                    <span className="text-xs text-muted">{dayItems.length} activities</span>
                    <div className="flex items-center gap-2">
                      {isOverBudget && (
                        <Badge variant="danger" className="text-xs">Over budget</Badge>
                      )}
                      <span className="text-sm font-semibold text-white">
                        ${dayTotal.toLocaleString()} total
                      </span>
                    </div>
                  </div>
                )}
              </Card>
            )
          })}
        </div>
      )}

      {/* Budget Summary */}
      {stops.length > 0 && (
        <Card>
          <CardTitle className="mb-4 flex items-center gap-2">
            <DollarSign size={16} className="text-secondary" /> Budget Overview
          </CardTitle>
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-muted">Total Budget</span>
              <span className="text-white font-semibold">${Number(trip.totalBudget || 0).toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted">Planned Spend</span>
              <span className="text-secondary font-semibold">${totalBudget.toLocaleString()}</span>
            </div>
            {trip.totalBudget > 0 && (
              <>
                <div className="h-2.5 bg-dark rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${totalBudget > Number(trip.totalBudget) ? 'bg-danger' : 'bg-gradient-to-r from-primary to-primary-light'}`}
                    style={{ width: `${Math.min((totalBudget / Number(trip.totalBudget)) * 100, 100)}%` }}
                  />
                </div>
                <div className="flex justify-between text-xs text-muted">
                  <span>{Math.round((totalBudget / Number(trip.totalBudget)) * 100)}% of budget</span>
                  <span className={totalBudget > Number(trip.totalBudget) ? 'text-danger' : 'text-primary-light'}>
                    {totalBudget > Number(trip.totalBudget) ? `Over by $${(totalBudget - Number(trip.totalBudget)).toLocaleString()}` : `$${(Number(trip.totalBudget) - totalBudget).toLocaleString()} remaining`}
                  </span>
                </div>
              </>
            )}
          </div>
          <div className="mt-4 pt-4 border-t border-border/50">
            <Link to={`/trips/${id}/expenses`}>
              <Button variant="secondary" className="w-full gap-2">
                <DollarSign size={15} /> View Full Expenses
              </Button>
            </Link>
          </div>
        </Card>
      )}
    </div>
  )
}
