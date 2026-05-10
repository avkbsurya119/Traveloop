import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowDown, MapPin, Globe, Star, Users, Compass } from 'lucide-react'
import { useAuthStore } from '../store/authStore'

/* ── Intersection Observer hook ──────────────────────────── */
function useOnScreen(ref, threshold = 0.15) {
  const [vis, setVis] = useState(false)
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVis(true); obs.disconnect() } },
      { threshold }
    )
    if (ref.current) obs.observe(ref.current)
    return () => obs.disconnect()
  }, [ref, threshold])
  return vis
}

/* ── Parallax scroll hook ────────────────────────────────── */
function useParallax() {
  const [scrollY, setScrollY] = useState(0)
  useEffect(() => {
    const handler = () => setScrollY(window.scrollY)
    window.addEventListener('scroll', handler, { passive: true })
    return () => window.removeEventListener('scroll', handler)
  }, [])
  return scrollY
}

/* ═══════════════════════════════════════════════════════════ */
export default function Landing() {
  const { isAuthenticated } = useAuthStore()
  const scrollY = useParallax()

  const sec2 = useRef(null)
  const sec3 = useRef(null)
  const sec4 = useRef(null)
  const vis2 = useOnScreen(sec2)
  const vis3 = useOnScreen(sec3)
  const vis4 = useOnScreen(sec4)

  const destinations = [
    { name: 'Santorini', country: 'Greece', desc: 'Whitewashed villages perched above the deep blue Aegean Sea.', img: 'https://images.unsplash.com/photo-1613395877344-13d4a8e0d49e?q=80&w=800&auto=format&fit=crop' },
    { name: 'Kyoto', country: 'Japan', desc: 'Ancient temples hidden among misty bamboo groves.', img: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?q=80&w=800&auto=format&fit=crop' },
    { name: 'Amalfi Coast', country: 'Italy', desc: 'Dramatic cliffs draped in pastel villages and citrus groves.', img: 'https://images.unsplash.com/photo-1533682805518-48d1f5e8bb3c?q=80&w=800&auto=format&fit=crop' },
    { name: 'Bali', country: 'Indonesia', desc: 'Emerald rice terraces, sacred temples & vibrant surf culture.', img: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?q=80&w=800&auto=format&fit=crop' },
  ]

  const stats = [
    { icon: Globe, value: '120+', label: 'Destinations' },
    { icon: Users, value: '45K+', label: 'Travelers' },
    { icon: Star, value: '4.9', label: 'Rating' },
    { icon: Compass, value: '800+', label: 'Itineraries' },
  ]

  return (
    <div className="min-h-screen text-white" style={{ background: '#040C18' }}>

      {/* ──────────── SECTION 1 — HERO ──────────── */}
      <div className="p-3 sm:p-4 md:p-5" style={{ minHeight: '100vh' }}>
        <section
          className="relative w-full overflow-hidden flex flex-col"
          style={{
            minHeight: 'calc(100vh - 40px)',
            borderRadius: '1.8rem',
            border: '1px solid rgba(255,255,255,0.08)',
          }}
        >
          {/* BG image + overlays */}
          <div className="absolute inset-0 z-0">
            <img
              src="https://images.unsplash.com/photo-1559128010-7c1ad6e1b6a5?q=80&w=2073&auto=format&fit=crop"
              alt="Tropical Island Aerial"
              className="w-full h-full object-cover"
              style={{
                transform: `scale(1.08) translateY(${scrollY * 0.08}px)`,
                transition: 'transform 0.1s linear',
              }}
            />
            {/* Teal tint */}
            <div className="absolute inset-0" style={{ background: 'rgba(5,60,55,0.35)', mixBlendMode: 'multiply' }} />
            {/* Bottom fade to outer bg */}
            <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, rgba(4,12,24,0.15) 0%, rgba(4,12,24,0.0) 30%, rgba(4,12,24,0.55) 85%, rgba(4,12,24,0.92) 100%)' }} />
          </div>

          {/* ── Navbar ── */}
          <nav className="relative z-20 flex items-center justify-between px-8 md:px-12 pt-7 pb-4">
            <div className="flex items-center gap-2.5">
              <MapPin className="text-white" size={26} strokeWidth={2.2} />
              <span style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.55rem', fontWeight: 700, letterSpacing: '-0.02em' }}>
                Traveloop
              </span>
            </div>

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

          {/* ── Hero Content ── */}
          <div className="relative z-10 flex-1 flex flex-col justify-end px-8 md:px-12 pb-10 md:pb-14">
            <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8 lg:gap-16">

              {/* LEFT — Big Title (italic serif, exactly like template) */}
              <div className="flex-1 max-w-[750px]">
                <h1
                  style={{
                    fontFamily: "'Playfair Display', serif",
                    fontStyle: 'italic',
                    fontWeight: 700,
                    fontSize: 'clamp(2.8rem, 6.5vw, 5.8rem)',
                    lineHeight: 1.05,
                    letterSpacing: '-0.02em',
                    color: '#fff',
                  }}
                >
                  Unforgettable<br />
                  Travel Moments<br />
                  <span style={{ fontStyle: 'normal' }}>by </span>Traveloop
                </h1>
              </div>

              {/* RIGHT — Description + Arrow */}
              <div className="flex flex-col items-end gap-8 lg:gap-12 lg:max-w-[380px] lg:pb-1">
                <p style={{ fontSize: '1.02rem', lineHeight: 1.75, color: 'rgba(255,255,255,0.82)', fontWeight: 400 }}>
                  We take you beyond the ordinary, to places
                  where cultures come alive, landscapes leave
                  you breathless, and every moment becomes
                  a story to tell.
                </p>

                <a
                  href="#destinations"
                  className="flex items-center justify-center transition-all duration-300 hover:scale-110 hover:bg-white/20"
                  style={{
                    width: 50, height: 74, borderRadius: '2rem',
                    background: 'rgba(255,255,255,0.1)',
                    backdropFilter: 'blur(8px)',
                    border: '1px solid rgba(255,255,255,0.18)',
                  }}
                >
                  <ArrowDown className="text-white animate-bounce" size={22} />
                </a>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* ──────────── SECTION 2 — DESTINATIONS ──────────── */}
      <section id="destinations" className="relative py-24 md:py-32 px-4 md:px-8 lg:px-16 overflow-hidden" style={{ background: '#040C18' }}>
        {/* Glow */}
        <div className="absolute top-1/3 left-1/4 w-[600px] h-[600px] rounded-full pointer-events-none" style={{ background: 'rgba(6,182,212,0.06)', filter: 'blur(120px)' }} />
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] rounded-full pointer-events-none" style={{ background: 'rgba(34,197,94,0.05)', filter: 'blur(100px)' }} />

        <div className="relative z-10 max-w-[1400px] mx-auto" ref={sec2}>
          <div className={`text-center mb-16 transition-all duration-[1200ms] ease-out ${vis2 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-16'}`}>
            <p className="uppercase tracking-[0.3em] text-xs mb-4" style={{ color: 'rgba(6,182,212,0.8)' }}>Explore the world</p>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(2rem, 4vw, 3.2rem)', fontWeight: 700 }}>
              Discover the Extraordinary
            </h2>
            <p className="mt-4 max-w-lg mx-auto" style={{ color: 'rgba(255,255,255,0.5)', fontSize: '1.05rem' }}>
              Handpicked destinations for your next great adventure.
            </p>
          </div>

          {/* Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {destinations.map((d, i) => (
              <div
                key={d.name}
                className={`group relative overflow-hidden transition-all duration-[1000ms] ease-out cursor-pointer ${vis2 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20'}`}
                style={{
                  transitionDelay: `${i * 120 + 200}ms`,
                  height: '26rem',
                  borderRadius: '1.4rem',
                  border: '1px solid rgba(255,255,255,0.06)',
                }}
              >
                <img src={d.img} alt={d.name}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-[800ms] ease-out group-hover:scale-[1.12]" />
                <div className="absolute inset-0 transition-all duration-500"
                  style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.15) 50%, rgba(0,0,0,0.0) 100%)' }} />
                {/* Hover overlay */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  style={{ background: 'linear-gradient(to top, rgba(6,182,212,0.3) 0%, transparent 60%)' }} />

                <div className="absolute bottom-0 left-0 right-0 p-7 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-500">
                  <p className="text-xs font-bold uppercase tracking-[0.2em] mb-1.5" style={{ color: 'rgba(6,182,212,0.9)' }}>{d.country}</p>
                  <h3 className="text-2xl font-bold text-white mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>{d.name}</h3>
                  <p className="text-sm leading-relaxed opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100" style={{ color: 'rgba(255,255,255,0.7)' }}>
                    {d.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className={`mt-16 flex justify-center transition-all duration-[1200ms] ease-out delay-700 ${vis2 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <Link to={isAuthenticated ? '/explore' : '/login'}>
              <button
                className="group relative overflow-hidden transition-all duration-300 hover:scale-105"
                style={{
                  padding: '1rem 2.5rem', borderRadius: '9999px', fontWeight: 700,
                  fontSize: '0.95rem', background: 'linear-gradient(135deg, #06b6d4, #0891b2)',
                  boxShadow: '0 0 40px rgba(6,182,212,0.25)',
                }}
              >
                <span className="relative z-10">Start Exploring</span>
                <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* ──────────── SECTION 3 — STATS (About Us) ──────────── */}
      <section id="about-us" className="relative py-20 overflow-hidden" ref={sec3} style={{ background: '#040C18' }}>
        <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, rgba(6,182,212,0.03) 0%, transparent 100%)' }} />
        <div className="relative z-10 max-w-5xl mx-auto px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((s, i) => (
              <div
                key={s.label}
                className={`text-center transition-all duration-[1000ms] ease-out ${vis3 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}
                style={{ transitionDelay: `${i * 100}ms` }}
              >
                <s.icon className="mx-auto mb-3" size={28} style={{ color: 'rgba(6,182,212,0.7)' }} />
                <p className="text-3xl md:text-4xl font-bold mb-1" style={{ fontFamily: "'Playfair Display', serif" }}>{s.value}</p>
                <p className="text-sm" style={{ color: 'rgba(255,255,255,0.45)' }}>{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ──────────── SECTION 4 — CTA (Travel Packages) ──────────── */}
      <section id="travel-packages" className="relative py-28 md:py-36 px-4 overflow-hidden" ref={sec4} style={{ background: '#040C18' }}>
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-[700px] h-[700px] rounded-full" style={{ background: 'rgba(6,182,212,0.06)', filter: 'blur(140px)' }} />
        </div>
        <div className={`relative z-10 text-center max-w-3xl mx-auto transition-all duration-[1200ms] ease-out ${vis4 ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-16 scale-95'}`}>
          <h2
            style={{
              fontFamily: "'Playfair Display', serif",
              fontStyle: 'italic',
              fontSize: 'clamp(2rem, 4.5vw, 3.8rem)',
              fontWeight: 700,
              lineHeight: 1.15,
            }}
          >
            Your next adventure<br />is just one click away.
          </h2>
          <p className="mt-6 text-lg" style={{ color: 'rgba(255,255,255,0.55)' }}>
            Plan it. Live it. Loop it.
          </p>
          <div className="mt-10 flex flex-wrap gap-4 justify-center">
            <Link to={isAuthenticated ? '/dashboard' : '/register'}>
              <button
                className="transition-all duration-300 hover:scale-105"
                style={{
                  padding: '1rem 2.8rem', borderRadius: '9999px', fontWeight: 700,
                  background: '#fff', color: '#111', fontSize: '0.95rem',
                  boxShadow: '0 4px 30px rgba(255,255,255,0.1)',
                }}
              >
                {isAuthenticated ? 'Go to Dashboard' : 'Get Started Free'}
              </button>
            </Link>
            <Link to={isAuthenticated ? '/explore' : '/login'}>
              <button
                className="transition-all duration-300 hover:scale-105"
                style={{
                  padding: '1rem 2.8rem', borderRadius: '9999px', fontWeight: 600,
                  background: 'rgba(255,255,255,0.08)', color: '#fff', fontSize: '0.95rem',
                  border: '1px solid rgba(255,255,255,0.15)',
                  backdropFilter: 'blur(8px)',
                }}
              >
                Browse Destinations
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* ──────────── FOOTER (Contact) ──────────── */}
      <footer id="contact" className="py-10 text-center text-sm" style={{ borderTop: '1px solid rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.3)', background: '#040C18' }}>
        <p>&copy; 2026 Traveloop. All rights reserved.</p>
      </footer>
    </div>
  )
}
