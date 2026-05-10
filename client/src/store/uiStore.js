import { create } from 'zustand'

const THEMES = ['midnight', 'ocean', 'forest', 'dusk']

function applyTheme(theme) {
  if (theme === 'midnight') {
    document.documentElement.removeAttribute('data-theme')
  } else {
    document.documentElement.setAttribute('data-theme', theme)
  }
  localStorage.setItem('traveloop-theme', theme)
}

const savedTheme = localStorage.getItem('traveloop-theme') || 'midnight'
applyTheme(savedTheme)

export const useUIStore = create((set) => ({
  sidebarOpen: true,
  mobileNavOpen: false,
  theme: savedTheme,

  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),

  toggleMobileNav: () => set((state) => ({ mobileNavOpen: !state.mobileNavOpen })),
  setMobileNavOpen: (open) => set({ mobileNavOpen: open }),

  setTheme: (theme) => {
    applyTheme(theme)
    set({ theme })
  },

  cycleTheme: () => set((state) => {
    const currentIdx = THEMES.indexOf(state.theme)
    const nextTheme = THEMES[(currentIdx + 1) % THEMES.length]
    applyTheme(nextTheme)
    return { theme: nextTheme }
  }),
}))

export const THEME_META = {
  midnight: { label: 'Midnight', icon: '🌙', preview: '#1C1C2E' },
  ocean:    { label: 'Ocean',    icon: '🌊', preview: '#060D1A' },
  forest:   { label: 'Forest',   icon: '🌿', preview: '#081C0F' },
  dusk:     { label: 'Dusk',     icon: '🌅', preview: '#150B25' },
}
