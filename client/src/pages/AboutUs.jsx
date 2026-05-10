import { Link } from 'react-router-dom'
import { MapPin, Users, Target, Heart } from 'lucide-react'
import { useAuthStore } from '../store/authStore'

export default function AboutUs() {
  const { isAuthenticated } = useAuthStore()

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
      <div className="max-w-5xl mx-auto px-8 py-24">
        <h1 style={{ fontFamily: "'Playfair Display', serif", fontStyle: 'italic' }} className="text-5xl md:text-7xl font-bold mb-8 text-center">
          Our Story
        </h1>
        <p className="text-xl text-white/70 text-center max-w-3xl mx-auto mb-24 leading-relaxed">
          Traveloop was born from a simple idea: travel planning shouldn't be a chore. We combine cutting-edge AI with beautiful, intuitive design to make exploring the world effortless and unforgettable.
        </p>

        <div className="grid md:grid-cols-3 gap-12">
          <div className="bg-white/5 p-8 rounded-3xl border border-white/10 hover:bg-white/10 transition-colors">
            <Target className="text-cyan-400 mb-6" size={40} />
            <h3 className="text-2xl font-bold mb-4 font-display">Our Mission</h3>
            <p className="text-white/60 leading-relaxed">To empower every traveler with intelligent tools that transform daunting logistics into seamless adventures.</p>
          </div>
          
          <div className="bg-white/5 p-8 rounded-3xl border border-white/10 hover:bg-white/10 transition-colors">
            <Users className="text-cyan-400 mb-6" size={40} />
            <h3 className="text-2xl font-bold mb-4 font-display">Our Community</h3>
            <p className="text-white/60 leading-relaxed">We believe travel is better together. Our platform is built for sharing, collaborating, and inspiring each other.</p>
          </div>

          <div className="bg-white/5 p-8 rounded-3xl border border-white/10 hover:bg-white/10 transition-colors">
            <Heart className="text-cyan-400 mb-6" size={40} />
            <h3 className="text-2xl font-bold mb-4 font-display">Our Promise</h3>
            <p className="text-white/60 leading-relaxed">No hidden fees, no confusing interfaces. Just a beautifully crafted space to plan the trip of your dreams.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
