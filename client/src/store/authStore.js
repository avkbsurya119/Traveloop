import { create } from 'zustand'
import { authApi } from '../api/auth'

/**
 * Helper: read token from either storage layer.
 */
function getToken(key) {
  return localStorage.getItem(key) || sessionStorage.getItem(key)
}

function clearTokens() {
  localStorage.removeItem('accessToken')
  localStorage.removeItem('refreshToken')
  sessionStorage.removeItem('accessToken')
  sessionStorage.removeItem('refreshToken')
}

function storeTokens(tokens, remember) {
  const storage = remember ? localStorage : sessionStorage
  storage.setItem('accessToken', tokens.accessToken)
  storage.setItem('refreshToken', tokens.refreshToken)

  // Also keep the preference itself in localStorage so we know on refresh
  if (remember) {
    localStorage.setItem('rememberMe', 'true')
  } else {
    localStorage.removeItem('rememberMe')
  }
}

export const useAuthStore = create((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,

  initialize: async () => {
    const token = getToken('accessToken')
    if (!token) {
      set({ isLoading: false })
      return
    }

    try {
      const { data } = await authApi.getMe()
      set({ user: data, isAuthenticated: true, isLoading: false })
    } catch (error) {
      clearTokens()
      set({ user: null, isAuthenticated: false, isLoading: false })
    }
  },

  login: async (email, password, captchaAnswer, rememberMe = false) => {
    const { data } = await authApi.login({ email, password, captchaAnswer })
    storeTokens(data, rememberMe)
    set({ user: data.user, isAuthenticated: true })
    return data.user
  },

  register: async (userData) => {
    const { data } = await authApi.register(userData)
    storeTokens(data, true) // default to persist on registration
    set({ user: data.user, isAuthenticated: true })
    return data.user
  },

  logout: () => {
    clearTokens()
    set({ user: null, isAuthenticated: false })
  },

  updateUser: (updates) => {
    set((state) => ({
      user: { ...state.user, ...updates }
    }))
  },

  // For OAuth callback - set tokens directly
  setTokens: (accessToken, refreshToken) => {
    localStorage.setItem('accessToken', accessToken)
    localStorage.setItem('refreshToken', refreshToken)
    localStorage.setItem('rememberMe', 'true')
  },

  setUser: (user) => {
    set({ user, isAuthenticated: true, isLoading: false })
  },

  // Get current access token
  get accessToken() {
    return getToken('accessToken')
  },
}))
