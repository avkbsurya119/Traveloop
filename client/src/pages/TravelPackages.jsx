import { Link } from 'react-router-dom'
import { MapPin, Compass, Star, ArrowRight } from 'lucide-react'
import { useAuthStore } from '../store/authStore'

export default function TravelPackages() {
  const { isAuthenticated } = useAuthStore()

  const packages = [
    { title: 'The Amalfi Romance', duration: '7 Days', price: '$2,499', img: 'https://images.unsplash.com/photo-1533682805518-48d1f5e8bb3c?q=80&w=800&auto=format&fit=crop', tags: ['Couples', 'Luxury'] },
    { title: 'Kyoto Zen Retreat', duration: '10 Days', price: '$3,199', img: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?q=80&w=800&auto=format&fit=crop', tags: ['Culture', 'Wellness'] },
    { title: 'Bali Surf & Yoga', duration: '14 Days', price: '$1,899', img: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?q=80&w=800&auto=format&fit=crop', tags: ['Adventure', 'Wellness'] },
    { title: 'Swiss Alps Explorer', duration: '8 Days', price: '$3,899', img: 'https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?q=80&w=800&auto=format&fit=crop', tags: ['Adventure', 'Nature'] },
    { title: 'Santorini Sunsets', duration: '5 Days', price: '$1,599', img: 'https://images.unsplash.com/photo-1613395877344-13d4a8e0d49e?q=80&w=800&auto=format&fit=crop', tags: ['Couples', 'Beach'] },
    { title: 'Sahara Desert Safari', duration: '6 Days', price: '$1,299', img: 'https://images.unsplash.com/photo-1502003148287-a82ef80a6abc?q=80&w=800&auto=format&fit=crop', tags: ['Adventure', 'Culture'] },
  ]

  return (
    <div className="min-h-screen text-white bg-[#040C18]">
      {/* ── Navbar ── */}
      <nav className="relative z-20 flex items-center justify-between px-8 md:px-12 pt-7 pb-4 bg-[#050B14]/80 backdrop-blur-md border-b border-white/5">
        <Link to="/" className="flex items-center gap-2.5">
          <MapPin className="text-white" size={26} strokeWidth={2.2} />
          <span style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.55rem', fontWeight: 700, letterSpacing: '-0.02em' }}>
            Traveloop
          </span>
        </Link>

        <div className="hidden lg:flex items-center gap-9 text-[0.92rem]" style={{ fontWeight: 500, color: 'rgba(255,255,255,0.85)' }}>
          {['About Us', 'Destinations', 'Travel Packages', 'Contact'].map(l => {
            const path = l === 'Destinations' ? '/#destinations' : `/${l.toLowerCase().replace(/\s/g, '-')}`
            return (
              <Link key={l} to={path} className="relative py-1 transition-colors duration-300 hover:text-white group">
                {l}
                <span className="absolute bottom-0 left-0 w-0 h-[2px] bg-white/60 group-hover:w-full transition-all duration-300" />
              </Link>
            )
          })}
        </div>

        <Link to={isAuthenticated ? '/dashboard' : '/login'}>
          <button
            className="transition-all duration-300 hover:scale-105 hover:shadow-xl"
            style={{
              background: '#fff', color: '#111', fontWeight: 700,
              fontSize: '0.88rem', borderRadius: '9999px',
              padding: '0.6rem 1.8rem',
              boxShadow: '0 4px 24px rgba(0,0,0,0.15)',
            }}
          >
            {isAuthenticated ? 'Dashboard' : 'Book Now'}
          </button>
        </Link>
      </nav>

      {/* ── Content ── */}
      <div className="max-w-7xl mx-auto px-8 py-24">
        <div className="text-center mb-16">
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontStyle: 'italic' }} className="text-5xl md:text-7xl font-bold mb-6">
            Curated Packages
          </h1>
          <p className="text-xl text-white/70 max-w-2xl mx-auto leading-relaxed">
            Discover our hand-picked itineraries designed by experts and optimized by AI. Simply select a package, customize it, and go.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {packages.map((pkg, idx) => (
            <div key={idx} className="group bg-white/5 rounded-[2rem] border border-white/10 overflow-hidden hover:bg-white/10 transition-all hover:scale-[1.02]">
              <div className="relative h-64 overflow-hidden">
                <img src={pkg.img} alt={pkg.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                <div className="absolute top-4 left-4 flex gap-2">
                  {pkg.tags.map(tag => (
                    <span key={tag} className="px-3 py-1 bg-black/50 backdrop-blur-md rounded-full text-xs font-bold text-white uppercase tracking-wider border border-white/10">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
              <div className="p-8">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="font-display text-2xl font-bold text-white">{pkg.title}</h3>
                  <div className="flex items-center gap-1 bg-cyan-500/20 text-cyan-400 px-2 py-1 rounded-lg">
                    <Star size={14} className="fill-cyan-400" />
                    <span className="text-sm font-bold">4.9</span>
                  </div>
                </div>
                
                <div className="flex items-center gap-6 text-white/60 text-sm mb-8">
                  <div className="flex items-center gap-2">
                    <Compass size={16} />
                    <span>{pkg.duration}</span>
                  </div>
                  <div className="flex items-center gap-2 text-white font-bold text-lg">
                    <span>{pkg.price}</span>
                  </div>
                </div>

                <Link to={isAuthenticated ? '/explore' : '/login'} className="w-full">
                  <button className="w-full py-3 bg-white/10 hover:bg-cyan-500 text-white font-bold rounded-xl transition-colors flex justify-center items-center gap-2">
                    View Itinerary <ArrowRight size={18} />
                  </button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
