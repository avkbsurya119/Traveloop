import { useEffect, useState, useRef } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { Search, MapPin, Star, Heart, X, TrendingUp, Compass, Globe } from 'lucide-react'
import { Card } from '../components/common/Card'
import { Button } from '../components/common/Button'
import { Badge } from '../components/common/Badge'
import { CardSkeleton } from '../components/common/Skeleton'
import { toast } from '../components/common/Toast'
import { searchApi } from '../api/search'
import { citiesApi } from '../api/cities'
import { activitiesApi } from '../api/activities'
import { tripsApi } from '../api/trips'
import { placesApi } from '../api/places'
import { useAuthStore } from '../store/authStore'
import { usersApi } from '../api/users'

const TYPE_FILTERS = [
  { value: 'all', label: 'All', emoji: '🔍' },
  { value: 'city', label: 'Cities', emoji: '🏙️' },
  { value: 'activity', label: 'Activities', emoji: '🎯' },
  { value: 'trip', label: 'Trips', emoji: '✈️' },
]

export default function Explore() {
  const { user } = useAuthStore()
  const [searchParams] = useSearchParams()
  const [query, setQuery] = useState(searchParams.get('q') || '')
  const [results, setResults] = useState({ cities: [], activities: [], trips: [] })
  const [trending, setTrending] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [cities, setCities] = useState([])
  const [activeType, setActiveType] = useState('all')
  const [savedIds, setSavedIds] = useState(new Set())
  const [externalCities, setExternalCities] = useState([])
  const timerRef = useRef(null)

  useEffect(() => {
    citiesApi.getPopular(12).then(r => setCities(r.data)).catch(() => {})
    searchApi.trending().then(r => setTrending(r.data)).catch(() => {})
    if (user?.id) {
      usersApi.getSavedDestinations(user.id).then(r => {
        setSavedIds(new Set(r.data.map(c => c.id)))
      }).catch(() => {})
    }
  }, [user?.id])

  useEffect(() => {
    if (activeType === 'all' && query.length < 2) {
      setResults({ cities: [], activities: [], trips: [] })
      return
    }
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(async () => {
      setIsLoading(true)
      try {
        if (query.length >= 2) {
          const params = { q: query, limit: 20 }
          if (activeType !== 'all') params.type = activeType
          const { data } = await searchApi.search(params)
          setResults(data)
          // If DB returned few/no cities, also search worldwide via Nominatim
          if ((activeType === 'all' || activeType === 'city') && data.cities.length < 3) {
            placesApi.citySearch(query).then(r => setExternalCities(r.data || [])).catch(() => {})
          } else {
            setExternalCities([])
          }
        } else {
          setExternalCities([])
          if (activeType === 'city') {
            const { data } = await citiesApi.getAll({ limit: 20 })
            setResults({ cities: data, activities: [], trips: [] })
          } else if (activeType === 'activity') {
            const { data } = await activitiesApi.getAll({ limit: 20 })
            setResults({ cities: [], activities: data, trips: [] })
          } else if (activeType === 'trip') {
            const { data } = await tripsApi.getAll({ limit: 20 })
            setResults({ cities: [], activities: [], trips: data })
          }
        }
      } catch { /* noop */ }
      finally { setIsLoading(false) }
    }, 300)
  }, [query, activeType])

  const toggleSave = async (cityId) => {
    if (!user) return
    try {
      if (savedIds.has(cityId)) {
        await usersApi.unsaveDestination(user.id, cityId)
        setSavedIds(prev => { const next = new Set(prev); next.delete(cityId); return next })
        toast.success('Removed from saved')
      } else {
        await usersApi.saveDestination(user.id, cityId)
        setSavedIds(prev => new Set(prev).add(cityId))
        toast.success('Destination saved!')
      }
    } catch { toast.error('Failed to update') }
  }

  const hasResults = results.cities.length > 0 || results.activities.length > 0 || results.trips.length > 0 || externalCities.length > 0
  const isSearching = query || activeType !== 'all'

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-display text-2xl font-bold text-white flex items-center gap-2">
          <Compass className="text-primary-light" size={24} /> Explore
        </h1>
        <p className="text-muted text-sm mt-1">Discover destinations, activities, and trips</p>
      </div>

      {/* Search Bar */}
      <div className="relative group">
        <div className="absolute inset-0 bg-primary/10 rounded-2xl blur-sm opacity-0 group-focus-within:opacity-100 transition-opacity" />
        <div className="relative flex items-center glass rounded-2xl border border-border group-focus-within:border-primary/50 transition-all overflow-hidden">
          <Search className="ml-4 text-muted flex-shrink-0" size={20} />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search cities, activities, or trips..."
            className="flex-1 px-4 py-3.5 bg-transparent text-white placeholder-muted focus:outline-none text-base"
          />
          {query && (
            <button
              onClick={() => { setQuery(''); setResults({ cities: [], activities: [], trips: [] }) }}
              className="mr-4 text-muted hover:text-white transition-colors"
            >
              <X size={18} />
            </button>
          )}
        </div>
      </div>

      {/* Type Filters */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
        {TYPE_FILTERS.map(type => (
          <button
            key={type.value}
            onClick={() => setActiveType(type.value)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm whitespace-nowrap transition-all font-medium ${
              activeType === type.value
                ? 'bg-primary text-white shadow-lg shadow-primary/30'
                : 'bg-surface text-muted hover:text-white hover:bg-surface/80 border border-border'
            }`}
          >
            <span>{type.emoji}</span> {type.label}
          </button>
        ))}
      </div>

      {/* Trending Searches */}
      {!query && trending.length > 0 && (
        <div>
          <p className="text-xs text-muted mb-2 flex items-center gap-1.5 uppercase tracking-wide font-semibold">
            <TrendingUp size={13} /> Trending
          </p>
          <div className="flex flex-wrap gap-2">
            {trending.map(t => (
              <button key={t.query} onClick={() => setQuery(t.query)}
                className="px-3 py-1.5 bg-surface border border-border rounded-full text-sm text-muted hover:text-white hover:border-primary/50 transition-all">
                {t.query}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Results */}
      {isLoading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map(i => <CardSkeleton key={i} />)}
        </div>
      ) : isSearching && hasResults ? (
        <div className="space-y-8">
          {results.cities.length > 0 && (
            <section>
              <h2 className="text-sm font-semibold text-muted uppercase tracking-wide mb-3">Cities</h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {results.cities.map(city => <CityCard key={city.id} city={city} savedIds={savedIds} onToggleSave={toggleSave} />)}
              </div>
            </section>
          )}
          {results.activities.length > 0 && (
            <section>
              <h2 className="text-sm font-semibold text-muted uppercase tracking-wide mb-3">Activities</h2>
              <div className="grid md:grid-cols-2 gap-3">
                {results.activities.map(activity => <ActivityCard key={activity.id} activity={activity} />)}
              </div>
            </section>
          )}
          {externalCities.length > 0 && (
            <section>
              <h2 className="text-sm font-semibold text-muted uppercase tracking-wide mb-3 flex items-center gap-1.5">
                <Globe size={13} className="text-primary-light" /> Worldwide Destinations
              </h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {externalCities.map(city => (
                  <ExternalCityCard key={city.id} city={city} />
                ))}
              </div>
            </section>
          )}
          {results.trips.length > 0 && (
            <section>
              <h2 className="text-sm font-semibold text-muted uppercase tracking-wide mb-3">Trips</h2>
              <div className="grid md:grid-cols-2 gap-3">
                {results.trips.map(trip => (
                  <Link key={trip.id} to={`/trips/${trip.id}`}>
                    <Card hover className="h-full">
                      <h3 className="font-semibold text-white">{trip.title}</h3>
                      <p className="text-sm text-muted mt-1 line-clamp-2">{trip.description}</p>
                      <div className="flex items-center gap-3 mt-2 text-xs text-muted">
                        <span>by {trip.user?.firstName}</span>
                        {trip.stops?.slice(0, 2).map(s => (
                          <span key={s.city?.name} className="flex items-center gap-0.5">
                            <MapPin size={10} /> {s.city?.name}
                          </span>
                        ))}
                      </div>
                    </Card>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </div>
      ) : isSearching && !hasResults ? (
        <div className="text-center py-20">
          <div className="text-6xl mb-4">🔍</div>
          <p className="text-white font-semibold text-lg">No results found</p>
          <p className="text-muted mt-1">Try a different search term or browse popular destinations below</p>
        </div>
      ) : (
        /* Popular Destinations */
        <section>
          <h2 className="text-sm font-semibold text-muted uppercase tracking-wide mb-4">Popular Destinations</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {cities.map(city => <CityCard key={city.id} city={city} savedIds={savedIds} onToggleSave={toggleSave} large />)}
          </div>
        </section>
      )}
    </div>
  )
}

function CityCard({ city, savedIds, onToggleSave, large }) {
  return (
    <div className="relative group rounded-2xl overflow-hidden cursor-pointer card-hover">
      <div className={`relative ${large ? 'h-52' : 'h-40'}`}>
        <img
          src={city.imageUrl}
          alt={city.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

        {/* Info */}
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <p className="text-white font-bold text-lg leading-tight">{city.name}</p>
          <div className="flex items-center gap-2">
            <p className="text-white/70 text-sm">{city.country}</p>
            {city.costIndex && (
              <span className="text-white/50 text-xs">{'$'.repeat(Math.min(Math.round(Number(city.costIndex)), 4))}</span>
            )}
          </div>
        </div>

        {/* Save button */}
        <button
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); onToggleSave(city.id) }}
          className="absolute top-3 right-3 p-2 bg-black/40 backdrop-blur-sm rounded-full hover:bg-black/60 transition-all z-10"
        >
          <Heart size={16} className={savedIds.has(city.id) ? 'text-rose-400 fill-rose-400' : 'text-white'} />
        </button>

        {/* Plan CTA on hover */}
        <Link
          to={`/trips/new?cityId=${city.id}`}
          className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-20"
          onClick={e => e.stopPropagation()}
        >
          <span className="px-5 py-2.5 bg-primary text-white rounded-full font-semibold text-sm shadow-xl transform translate-y-3 group-hover:translate-y-0 transition-transform duration-300">
            Plan a Trip →
          </span>
        </Link>
      </div>

      {city.description && (
        <div className="bg-surface px-4 py-2.5 border-t border-border/50">
          <p className="text-xs text-muted line-clamp-1">{city.description}</p>
        </div>
      )}
    </div>
  )
}

function ExternalCityCard({ city }) {
  const label = [city.state, city.country].filter(Boolean).join(', ')
  return (
    <Link to={`/trips/new?city=${encodeURIComponent(city.name)}&country=${encodeURIComponent(city.country)}`}>
      <div className="relative group rounded-2xl overflow-hidden cursor-pointer card-hover border border-primary/20">
        <div className="relative h-40">
          <img
            src={city.imageUrl}
            alt={city.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
          <div className="absolute top-2 left-2">
            <span className="flex items-center gap-1 px-2 py-0.5 bg-primary/80 backdrop-blur-sm rounded-full text-[10px] text-white font-semibold">
              <Globe size={9} /> Worldwide
            </span>
          </div>
          <div className="absolute bottom-0 left-0 right-0 p-4">
            <p className="text-white font-bold text-lg leading-tight">{city.name}</p>
            <p className="text-white/70 text-sm">{label}</p>
          </div>
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10">
            <span className="px-4 py-2 bg-primary text-white rounded-full font-semibold text-sm shadow-xl transform translate-y-3 group-hover:translate-y-0 transition-transform duration-300">
              Plan a Trip →
            </span>
          </div>
        </div>
      </div>
    </Link>
  )
}

function ActivityCard({ activity }) {
  return (
    <div className="flex gap-3 p-3 bg-surface border border-border rounded-xl hover:border-primary/30 transition-all group">
      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0 text-xl">
        {activity.category === 'food' ? '🍽️' : activity.category === 'adventure' ? '🧗' : activity.category === 'culture' ? '🏛️' : activity.category === 'nature' ? '🌿' : '🎯'}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-white font-semibold text-sm truncate group-hover:text-primary-light transition-colors">{activity.name}</p>
        <p className="text-xs text-muted">{activity.city?.name}, {activity.city?.country}</p>
        <div className="flex items-center gap-2 mt-1.5">
          <Badge variant="default" className="capitalize text-xs">{activity.category}</Badge>
          {activity.rating > 0 && (
            <span className="text-xs text-amber-400 flex items-center gap-0.5">
              <Star size={11} fill="currentColor" /> {Number(activity.rating).toFixed(1)}
            </span>
          )}
          {activity.costMin && (
            <span className="text-xs text-muted">${Number(activity.costMin)}–${Number(activity.costMax)}</span>
          )}
        </div>
      </div>
    </div>
  )
}
