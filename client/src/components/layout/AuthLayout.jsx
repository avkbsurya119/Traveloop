import { useEffect, useState } from 'react'
import { Outlet } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'

const SLIDES = [
  {
    image: 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=1200&q=90',
    title: 'Dream it.',
    subtitle: 'Every great journey starts with a dream.',
    location: 'Amalfi Coast, Italy',
  },
  {
    image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=1200&q=90',
    title: 'Plan it.',
    subtitle: 'Build your perfect itinerary in minutes.',
    location: 'Bali, Indonesia',
  },
  {
    image: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=1200&q=90',
    title: 'Loop it.',
    subtitle: 'Share memories, inspire the world.',
    location: 'Kyoto, Japan',
  },
]

export default function AuthLayout() {
  const { initialize, isLoading } = useAuthStore()
  const [slide, setSlide] = useState(0)

  useEffect(() => {
    initialize()
  }, [initialize])

  useEffect(() => {
    const timer = setInterval(() => setSlide(s => (s + 1) % SLIDES.length), 5000)
    return () => clearInterval(timer)
  }, [])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-dark flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="text-4xl animate-bounce">✈️</div>
          <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
        </div>
      </div>
    )
  }

  const current = SLIDES[slide]

  return (
    <div className="min-h-screen flex">
      {/* Left — Hero Panel */}
      <div className="hidden lg:flex lg:w-1/2 xl:w-3/5 relative overflow-hidden flex-shrink-0">
        {SLIDES.map((s, i) => (
          <div
            key={i}
            className={`absolute inset-0 transition-opacity duration-1000 ${i === slide ? 'opacity-100' : 'opacity-0'}`}
          >
            <img src={s.image} alt="" className="w-full h-full object-cover" />
          </div>
        ))}
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-dark/60 via-transparent to-dark/80" />
        <div className="absolute inset-0 bg-gradient-to-t from-dark/80 via-transparent to-transparent" />

        {/* Brand */}
        <div className="absolute top-8 left-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/90 flex items-center justify-center text-xl">✈️</div>
            <span className="font-display text-2xl font-bold text-white tracking-tight">Traveloop</span>
          </div>
        </div>

        {/* Hero text */}
        <div className="absolute bottom-16 left-10 right-10">
          <div key={slide} className="animate-fade-up">
            <p className="text-primary-light text-sm font-semibold tracking-widest uppercase mb-3">
              {current.location}
            </p>
            <h2 className="font-display text-5xl xl:text-6xl font-bold text-white leading-tight mb-2">
              {current.title}
            </h2>
            <p className="text-white/80 text-xl font-medium">
              {current.subtitle}
            </p>
          </div>

          {/* Slide dots */}
          <div className="flex gap-2 mt-8">
            {SLIDES.map((_, i) => (
              <button
                key={i}
                onClick={() => setSlide(i)}
                className={`h-1.5 rounded-full transition-all duration-500 ${i === slide ? 'w-8 bg-primary-light' : 'w-2 bg-white/30'}`}
              />
            ))}
          </div>
        </div>

        {/* Floating stats */}
        <div className="absolute top-1/2 right-8 -translate-y-1/2 space-y-3">
          {[
            { v: '20+', l: 'Cities' },
            { v: '100+', l: 'Activities' },
            { v: '∞', l: 'Memories' },
          ].map(s => (
            <div key={s.l} className="glass rounded-2xl px-4 py-3 text-center animate-float" style={{ animationDelay: `${Math.random() * 2}s` }}>
              <p className="text-xl font-bold text-white">{s.v}</p>
              <p className="text-xs text-white/60">{s.l}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Right — Form Panel */}
      <div className="flex-1 bg-mesh flex flex-col items-center justify-center p-6 lg:p-10 overflow-y-auto">
        {/* Mobile logo */}
        <div className="lg:hidden flex items-center gap-2 mb-8">
          <span className="text-3xl">✈️</span>
          <span className="font-display text-2xl font-bold text-white">Traveloop</span>
        </div>

        <div className="w-full max-w-md animate-fade-up">
          <Outlet />
        </div>

        <p className="text-muted text-xs mt-8 text-center">
          © 2026 Traveloop · Dream it. Plan it. Loop it.
        </p>
      </div>
    </div>
  )
}
