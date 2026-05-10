import { useEffect, useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { Plus, ChevronRight, ChevronLeft, MapPin, Globe, Zap, TrendingUp, Cloud } from 'lucide-react'
import { Card, CardTitle } from '../components/common/Card'
import { Button } from '../components/common/Button'
import { Badge } from '../components/common/Badge'
import { TripCardSkeleton } from '../components/common/Skeleton'
import { useAuthStore } from '../store/authStore'
import { tripsApi } from '../api/trips'
import { citiesApi } from '../api/cities'
import { weatherApi } from '../api/weather'
import { format } from 'date-fns'

const HERO_SLIDES = [
  {
    image: 'https://images.unsplash.com/photo-1506929562872-bb421503ef21?w=1400&q=85',
    title: 'Discover Paradise',
    subtitle: 'Your next beach escape awaits',
    gradient: 'from-cyan-900/80 via-blue-900/60 to-transparent',
  },
  {
    image: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=1400&q=85',
    title: 'Ancient Wonders',
    subtitle: 'Walk through centuries of history',
    gradient: 'from-amber-900/80 via-orange-900/60 to-transparent',
  },
  {
    image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=1400&q=85',
    title: 'City Adventures',
    subtitle: "Experience the world's iconic cities",
    gradient: 'from-violet-900/80 via-indigo-900/60 to-transparent',
  },
  {
    image: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1400&q=85',
    title: 'Mountain Escapes',
    subtitle: 'Find peace above the clouds',
    gradient: 'from-emerald-900/80 via-teal-900/60 to-transparent',
  },
]

const REGIONS = [
  { name: 'Asia', emoji: '🌏' },
  { name: 'Europe', emoji: '🏰' },
  { name: 'North America', emoji: '🗽' },
  { name: 'South America', emoji: '🌴' },
  { name: 'Africa', emoji: '🦁' },
  { name: 'Oceania', emoji: '🏝️' },
  { name: 'Middle East', emoji: '🕌' },
]

export default function Dashboard() {
  const { user } = useAuthStore()
  const [trips, setTrips] = useState([])
  const [cities, setCities] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [heroIndex, setHeroIndex] = useState(0)
  const [weather, setWeather] = useState(null)
  const [selectedRegion, setSelectedRegion] = useState(null)
  const [sortBy, setSortBy] = useState('date')

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [tripsRes, citiesRes] = await Promise.all([
          tripsApi.getAll({ limit: 6 }),
          citiesApi.getPopular(14),
        ])
        setTrips(tripsRes.data)
        setCities(citiesRes.data)
      } catch { } finally { setIsLoading(false) }
    }
    fetchData()
  }, [])

  useEffect(() => {
    const cityName = user?.city || 'London'
    weatherApi.getWeather(cityName).then(res => setWeather(res.data)).catch(() => {})
  }, [user])

  useEffect(() => {
    const timer = setInterval(() => setHeroIndex(i => (i + 1) % HERO_SLIDES.length), 5000)
    return () => clearInterval(timer)
  }, [])

  const filteredCities = selectedRegion
    ? cities.filter(c => c.region === selectedRegion)
    : cities

  const sortedTrips = [...trips].sort((a, b) => {
    if (sortBy === 'budget') return Number(b.totalBudget) - Number(a.totalBudget)
    if (sortBy === 'name') return a.title.localeCompare(b.title)
    return new Date(b.startDate) - new Date(a.startDate)
  })

  const slide = HERO_SLIDES[heroIndex]
  const upcomingCount = trips.filter(t => new Date(t.startDate) > new Date()).length
  const countries = [...new Set(trips.flatMap(t => t.stops?.map(s => s.city?.country) || []))].length

  return (
    <div className="space-y-8">
      {/* Hero Carousel */}
      <div className="relative h-72 md:h-80 rounded-2xl overflow-hidden group cursor-pointer shadow-2xl">
        {HERO_SLIDES.map((s, i) => (
          <div key={i} className={`absolute inset-0 transition-all duration-1000 ${i === heroIndex ? 'opacity-100 scale-100' : 'opacity-0 scale-105'}`}>
            <img src={s.image} alt="" className="w-full h-full object-cover" loading="lazy" />
          </div>
        ))}
        <div className={`absolute inset-0 bg-gradient-to-r ${slide.gradient}`} />
        <div className="absolute inset-0 bg-gradient-to-t from-dark/80 via-dark/10 to-transparent" />

        {/* Content */}
        <div className="relative z-10 h-full flex flex-col justify-end pb-8 px-8 md:px-10">
          <div key={heroIndex} className="animate-fade-up">
            <p className="text-white/60 text-xs font-semibold tracking-widest uppercase mb-2 flex items-center gap-2">
              <Globe size={12} /> Traveloop · Explore the World
            </p>
            <h1 className="font-display text-3xl md:text-5xl font-bold text-white leading-tight mb-1">
              {slide.title}
            </h1>
            <p className="text-white/70 text-base mb-5">{slide.subtitle}</p>
            <Link to="/trips/new">
              <Button className="gap-2 shadow-xl shadow-primary/30">
                <Plus size={17} /> Plan a Trip
              </Button>
            </Link>
          </div>
        </div>

        {/* Controls */}
        <button onClick={() => setHeroIndex(i => (i - 1 + HERO_SLIDES.length) % HERO_SLIDES.length)}
          className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-2.5 bg-black/30 hover:bg-black/50 rounded-full text-white opacity-0 group-hover:opacity-100 transition-all backdrop-blur-sm">
          <ChevronLeft size={20} />
        </button>
        <button onClick={() => setHeroIndex(i => (i + 1) % HERO_SLIDES.length)}
          className="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-2.5 bg-black/30 hover:bg-black/50 rounded-full text-white opacity-0 group-hover:opacity-100 transition-all backdrop-blur-sm">
          <ChevronRight size={20} />
        </button>
        <div className="absolute bottom-4 right-6 z-20 flex gap-1.5">
          {HERO_SLIDES.map((_, i) => (
            <button key={i} onClick={() => setHeroIndex(i)}
              className={`h-1.5 rounded-full transition-all duration-500 ${i === heroIndex ? 'w-6 bg-white' : 'w-1.5 bg-white/40 hover:bg-white/60'}`} />
          ))}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          {
            icon: '🗺️', value: trips.length, label: 'Total Trips',
            color: 'from-emerald-500/15 to-teal-500/5', accent: 'text-emerald-400'
          },
          {
            icon: '✈️', value: upcomingCount, label: 'Upcoming',
            color: 'from-blue-500/15 to-indigo-500/5', accent: 'text-blue-400'
          },
          {
            icon: '🌍', value: countries, label: 'Countries',
            color: 'from-amber-500/15 to-orange-500/5', accent: 'text-amber-400'
          },
          weather ? {
            icon: weather.temp > 25 ? '☀️' : weather.temp > 15 ? '⛅' : '🌧️',
            value: `${weather.temp}°C`,
            label: weather.city || user?.city || 'Weather',
            color: 'from-cyan-500/15 to-sky-500/5', accent: 'text-cyan-400'
          } : {
            icon: '🌤️', value: '--°C', label: 'Your City',
            color: 'from-cyan-500/15 to-sky-500/5', accent: 'text-cyan-400'
          }
        ].map((s, i) => (
          <Card key={i} className={`bg-gradient-to-br ${s.color} text-center py-3 border-border/50`}>
            <div className="text-3xl mb-1">{s.icon}</div>
            <p className={`text-2xl font-bold ${s.accent}`}>{s.value}</p>
            <p className="text-xs text-muted mt-0.5 truncate px-2">{s.label}</p>
          </Card>
        ))}
      </div>

      {/* Explore by Region */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Globe size={18} className="text-primary-light" /> Explore by Region
          </CardTitle>
          <Link to="/explore" className="text-primary-light text-sm hover:underline flex items-center gap-1">
            All <ChevronRight size={14} />
          </Link>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1 no-scrollbar">
          <button onClick={() => setSelectedRegion(null)}
            className={`px-4 py-2 rounded-full text-sm whitespace-nowrap font-medium transition-all ${!selectedRegion ? 'bg-primary text-white shadow-lg shadow-primary/30' : 'bg-surface text-muted hover:text-white border border-border'}`}>
            🌐 All
          </button>
          {REGIONS.map(r => (
            <button key={r.name} onClick={() => setSelectedRegion(selectedRegion === r.name ? null : r.name)}
              className={`px-4 py-2 rounded-full text-sm whitespace-nowrap font-medium transition-all ${selectedRegion === r.name ? 'bg-primary text-white shadow-lg shadow-primary/30' : 'bg-surface text-muted hover:text-white border border-border'}`}>
              {r.emoji} {r.name}
            </button>
          ))}
        </div>

        <div className="flex gap-4 overflow-x-auto pb-4 mt-3 -mx-1 px-1 no-scrollbar">
          {filteredCities.map(city => (
            <Link key={city.id} to={`/explore?city=${city.id}`} className="flex-shrink-0 w-48 group">
              <div className="relative h-40 rounded-2xl overflow-hidden shadow-lg group-hover:shadow-xl transition-all">
                <img
                  src={city.imageUrl || `https://images.unsplash.com/400x300/?${city.name}`}
                  alt={city.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-dark/90 via-dark/20 to-transparent" />
                {city.costIndex && (
                  <div className="absolute top-2.5 right-2.5 glass px-2 py-0.5 rounded-full">
                    <span className="text-xs text-white font-medium">{'$'.repeat(Math.round(Number(city.costIndex)))}</span>
                  </div>
                )}
                <div className="absolute bottom-0 left-0 right-0 p-3">
                  <p className="text-white font-bold text-sm leading-tight">{city.name}</p>
                  <p className="text-white/60 text-xs">{city.country}</p>
                </div>
                {/* Hover overlay */}
                <div className="absolute inset-0 bg-primary/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <span className="text-white text-xs font-semibold bg-primary px-3 py-1 rounded-full shadow">Explore →</span>
                </div>
              </div>
            </Link>
          ))}
          {filteredCities.length === 0 && (
            <p className="text-muted text-sm py-8">No cities in this region yet</p>
          )}
        </div>
      </section>

      {/* Your Trips */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <CardTitle className="text-lg flex items-center gap-2">
            <TrendingUp size={18} className="text-secondary" /> Your Trips
          </CardTitle>
          <div className="flex items-center gap-3">
            <div className="flex gap-1 p-1 bg-surface rounded-full">
              {['date', 'name', 'budget'].map(s => (
                <button key={s} onClick={() => setSortBy(s)}
                  className={`px-3 py-1 rounded-full text-xs capitalize font-medium transition-all ${sortBy === s ? 'bg-primary text-white shadow' : 'text-muted hover:text-white'}`}>
                  {s}
                </button>
              ))}
            </div>
            <Link to="/trips" className="text-primary-light text-sm flex items-center gap-0.5 hover:underline">
              View all <ChevronRight size={14} />
            </Link>
          </div>
        </div>

        {isLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map(i => <TripCardSkeleton key={i} />)}
          </div>
        ) : sortedTrips.length === 0 ? (
          <Card className="text-center py-14 bg-gradient-to-br from-primary/5 to-transparent">
            <div className="text-5xl mb-4">🧳</div>
            <p className="text-white font-semibold text-lg mb-2">No trips yet</p>
            <p className="text-muted mb-5 text-sm">Start your first adventure and build memories that last</p>
            <Link to="/trips/new">
              <Button className="gap-2">
                <Zap size={16} /> Create your first trip
              </Button>
            </Link>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sortedTrips.map(trip => (
              <Link key={trip.id} to={`/trips/${trip.id}`} className="group">
                <Card hover className="overflow-hidden h-full p-0">
                  {/* Cover */}
                  <div className="h-36 relative overflow-hidden">
                    {trip.coverPhotoUrl
                      ? <img src={trip.coverPhotoUrl} alt={trip.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      : <div className="w-full h-full bg-gradient-to-br from-primary/40 via-primary/20 to-secondary/20" />
                    }
                    <div className="absolute inset-0 bg-gradient-to-t from-dark/60 to-transparent" />
                    <div className="absolute top-2.5 right-2.5">
                      <Badge variant={trip.status}>{trip.status}</Badge>
                    </div>
                    {trip.stops?.length > 0 && (
                      <div className="absolute bottom-2 left-3 right-3 flex items-center gap-1.5 overflow-hidden">
                        {trip.stops.slice(0, 3).map((stop, i) => (
                          <span key={stop.id} className="flex items-center gap-0.5 text-white/80 text-xs">
                            {i > 0 && <ChevronRight size={10} className="text-white/40 flex-shrink-0" />}
                            <MapPin size={10} className="flex-shrink-0" />
                            {stop.city?.name}
                          </span>
                        ))}
                        {trip.stops.length > 3 && <span className="text-white/50 text-xs">+{trip.stops.length - 3}</span>}
                      </div>
                    )}
                  </div>

                  <div className="p-4">
                    <h3 className="font-bold text-white mb-1 truncate">{trip.title}</h3>
                    <p className="text-xs text-muted mb-3">
                      {format(new Date(trip.startDate), 'MMM d')} – {format(new Date(trip.endDate), 'MMM d, yyyy')}
                    </p>

                    {trip.totalBudget > 0 && (
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs text-muted">Budget</span>
                        <span className="text-xs font-bold text-secondary">${Number(trip.totalBudget).toLocaleString()}</span>
                      </div>
                    )}
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* FAB */}
      <Link
        to="/trips/new"
        className="fixed bottom-24 right-5 lg:bottom-8 lg:right-8 w-14 h-14 bg-gradient-to-br from-primary to-primary-light rounded-full shadow-xl shadow-primary/40 flex items-center justify-center text-white transition-all hover:scale-110 z-30 glow-primary"
      >
        <Plus size={24} />
      </Link>
    </div>
  )
}
