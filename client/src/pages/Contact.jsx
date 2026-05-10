import { Link } from 'react-router-dom'
import { MapPin, Mail, Phone } from 'lucide-react'
import { useAuthStore } from '../store/authStore'

export default function Contact() {
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
        <h1 style={{ fontFamily: "'Playfair Display', serif", fontStyle: 'italic' }} className="text-5xl md:text-7xl font-bold mb-6 text-center">
          Get in Touch
        </h1>
        <p className="text-xl text-white/70 text-center max-w-2xl mx-auto mb-16 leading-relaxed">
          Have questions about a trip or want to partner with us? We'd love to hear from you. Drop us a message below.
        </p>

        <div className="grid md:grid-cols-2 gap-16">
          <div className="bg-white/5 p-8 rounded-[2rem] border border-white/10">
            <form className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">Name</label>
                <input type="text" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500 transition-colors" placeholder="John Doe" />
              </div>
              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">Email</label>
                <input type="email" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500 transition-colors" placeholder="john@example.com" />
              </div>
              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">Message</label>
                <textarea rows={4} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500 transition-colors" placeholder="How can we help?"></textarea>
              </div>
              <button type="button" className="w-full py-4 bg-cyan-500 hover:bg-cyan-400 text-white font-bold rounded-xl transition-colors">
                Send Message
              </button>
            </form>
          </div>

          <div className="flex flex-col justify-center space-y-12">
            <div className="flex items-start gap-6">
              <div className="w-14 h-14 rounded-full bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                <Mail className="text-cyan-400" size={24} />
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2">Email Us</h3>
                <p className="text-white/60">support@traveloop.com</p>
                <p className="text-white/60">partnerships@traveloop.com</p>
              </div>
            </div>

            <div className="flex items-start gap-6">
              <div className="w-14 h-14 rounded-full bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                <Phone className="text-cyan-400" size={24} />
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2">Call Us</h3>
                <p className="text-white/60">+1 (555) 123-4567</p>
                <p className="text-white/60">Mon-Fri from 8am to 5pm</p>
              </div>
            </div>
            
            <div className="flex items-start gap-6">
              <div className="w-14 h-14 rounded-full bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                <MapPin className="text-cyan-400" size={24} />
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2">Headquarters</h3>
                <p className="text-white/60">123 Innovation Drive<br/>San Francisco, CA 94105</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
