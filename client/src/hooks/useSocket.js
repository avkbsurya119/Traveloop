import { useEffect, useRef, useState, useCallback } from 'react'
import { io } from 'socket.io-client'
import { useAuthStore } from '../store/authStore'

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000'

export function useSocket() {
  const socketRef = useRef(null)
  const [isConnected, setIsConnected] = useState(false)
  const { accessToken } = useAuthStore()

  useEffect(() => {
    if (!accessToken) return

    socketRef.current = io(SOCKET_URL, {
      auth: { token: accessToken },
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 5,
      reconnectionDelay: 1000
    })

    socketRef.current.on('connect', () => {
      setIsConnected(true)
    })

    socketRef.current.on('disconnect', () => {
      setIsConnected(false)
    })

    socketRef.current.on('connect_error', (error) => {
      console.error('Socket connection error:', error.message)
      setIsConnected(false)
    })

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect()
        socketRef.current = null
      }
    }
  }, [accessToken])

  const emit = useCallback((event, data) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit(event, data)
    }
  }, [])

  const on = useCallback((event, callback) => {
    if (socketRef.current) {
      socketRef.current.on(event, callback)
    }
    return () => {
      if (socketRef.current) {
        socketRef.current.off(event, callback)
      }
    }
  }, [])

  const off = useCallback((event, callback) => {
    if (socketRef.current) {
      socketRef.current.off(event, callback)
    }
  }, [])

  return {
    socket: socketRef.current,
    isConnected,
    emit,
    on,
    off
  }
}

export function useTripSocket(tripId) {
  const { emit, on, off, isConnected } = useSocket()
  const [activeUsers, setActiveUsers] = useState([])
  const [typingUsers, setTypingUsers] = useState([])

  useEffect(() => {
    if (!tripId || !isConnected) return

    emit('join:trip', tripId)

    const handlePresenceUpdate = (users) => {
      setActiveUsers(users)
    }

    const handleUserTyping = (data) => {
      setTypingUsers(prev => {
        if (!prev.find(u => u.id === data.user.id)) {
          return [...prev, data.user]
        }
        return prev
      })
    }

    const handleUserStoppedTyping = (data) => {
      setTypingUsers(prev => prev.filter(u => u.id !== data.userId))
    }

    on('presence:update', handlePresenceUpdate)
    on('user:typing', handleUserTyping)
    on('user:stopped_typing', handleUserStoppedTyping)

    return () => {
      emit('leave:trip', tripId)
      off('presence:update', handlePresenceUpdate)
      off('user:typing', handleUserTyping)
      off('user:stopped_typing', handleUserStoppedTyping)
    }
  }, [tripId, isConnected, emit, on, off])

  const emitTripUpdate = useCallback((field, value, action = 'update') => {
    emit('trip:update', { tripId, field, value, action })
  }, [tripId, emit])

  const emitItineraryUpdate = useCallback((data) => {
    emit('itinerary:update', { tripId, ...data })
  }, [tripId, emit])

  const emitExpenseUpdate = useCallback((data) => {
    emit('expense:update', { tripId, ...data })
  }, [tripId, emit])

  const startTyping = useCallback(() => {
    emit('typing:start', { tripId })
  }, [tripId, emit])

  const stopTyping = useCallback(() => {
    emit('typing:stop', { tripId })
  }, [tripId, emit])

  return {
    isConnected,
    activeUsers,
    typingUsers,
    emitTripUpdate,
    emitItineraryUpdate,
    emitExpenseUpdate,
    startTyping,
    stopTyping,
    on,
    off
  }
}
