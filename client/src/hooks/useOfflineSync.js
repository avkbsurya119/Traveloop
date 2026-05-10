import { useState, useEffect, useCallback } from 'react'
import {
  cacheTrip,
  getCachedTrip,
  getCachedTrips,
  updateCachedTrip,
  queueMutation,
  getPendingMutations,
  removeMutation,
  getPendingCount
} from '../utils/offlineDb'
import { tripsApi } from '../api/trips'
import { toast } from '../components/common/Toast'

export function useOfflineSync() {
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const [isSyncing, setIsSyncing] = useState(false)
  const [pendingCount, setPendingCount] = useState(0)

  useEffect(() => {
    const updateOnlineStatus = () => setIsOnline(navigator.onLine)
    window.addEventListener('online', updateOnlineStatus)
    window.addEventListener('offline', updateOnlineStatus)

    // Check pending count
    getPendingCount().then(setPendingCount).catch(() => {})

    return () => {
      window.removeEventListener('online', updateOnlineStatus)
      window.removeEventListener('offline', updateOnlineStatus)
    }
  }, [])

  // Sync when coming online
  useEffect(() => {
    if (isOnline && pendingCount > 0 && !isSyncing) {
      syncPendingChanges()
    }
  }, [isOnline])

  const syncPendingChanges = useCallback(async () => {
    if (isSyncing || !navigator.onLine) return

    setIsSyncing(true)
    try {
      const mutations = await getPendingMutations()

      for (const mutation of mutations) {
        try {
          await processMutation(mutation)
          await removeMutation(mutation.id)
        } catch (error) {
          console.error('Failed to sync mutation:', mutation, error)
          // Keep failed mutations for retry
        }
      }

      const remaining = await getPendingCount()
      setPendingCount(remaining)

      if (remaining === 0) {
        toast.success('All changes synced')
      }
    } catch (error) {
      console.error('Sync failed:', error)
      toast.error('Sync failed, will retry')
    } finally {
      setIsSyncing(false)
    }
  }, [isSyncing])

  return {
    isOnline,
    isSyncing,
    pendingCount,
    syncPendingChanges
  }
}

async function processMutation(mutation) {
  switch (mutation.type) {
    case 'CREATE_TRIP':
      return tripsApi.create(mutation.data)

    case 'UPDATE_TRIP':
      return tripsApi.update(mutation.tripId, mutation.data)

    case 'DELETE_TRIP':
      return tripsApi.delete(mutation.tripId)

    case 'ADD_STOP':
      return tripsApi.addStop(mutation.tripId, mutation.data)

    case 'UPDATE_STOP':
      return tripsApi.updateStop(mutation.stopId, mutation.data)

    case 'DELETE_STOP':
      return tripsApi.deleteStop(mutation.stopId)

    case 'ADD_ITINERARY_ITEM':
      return tripsApi.addItineraryItem(mutation.stopId, mutation.data)

    case 'UPDATE_ITINERARY_ITEM':
      return tripsApi.updateItineraryItem(mutation.itemId, mutation.data)

    case 'DELETE_ITINERARY_ITEM':
      return tripsApi.deleteItineraryItem(mutation.itemId)

    case 'ADD_EXPENSE':
      return tripsApi.addExpense(mutation.tripId, mutation.data)

    case 'UPDATE_EXPENSE':
      return tripsApi.updateExpense(mutation.expenseId, mutation.data)

    case 'DELETE_EXPENSE':
      return tripsApi.deleteExpense(mutation.expenseId)

    default:
      console.warn('Unknown mutation type:', mutation.type)
  }
}

export function useOfflineTrip(tripId) {
  const [trip, setTrip] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isOfflineData, setIsOfflineData] = useState(false)
  const { isOnline, pendingCount, syncPendingChanges } = useOfflineSync()

  useEffect(() => {
    const fetchTrip = async () => {
      setLoading(true)

      if (isOnline) {
        try {
          const { data } = await tripsApi.getById(tripId)
          setTrip(data)
          setIsOfflineData(false)
          // Cache for offline use
          await cacheTrip(data)
        } catch (error) {
          // Try offline cache
          const cached = await getCachedTrip(tripId)
          if (cached) {
            setTrip(cached)
            setIsOfflineData(true)
          }
        }
      } else {
        // Offline - use cache
        const cached = await getCachedTrip(tripId)
        if (cached) {
          setTrip(cached)
          setIsOfflineData(true)
        }
      }

      setLoading(false)
    }

    if (tripId) fetchTrip()
  }, [tripId, isOnline])

  const updateTrip = useCallback(async (updates) => {
    if (isOnline) {
      try {
        const { data } = await tripsApi.update(tripId, updates)
        setTrip(data)
        await cacheTrip(data)
        return data
      } catch (error) {
        // Fall through to offline mode
        if (!error.response) {
          return handleOfflineUpdate(updates)
        }
        throw error
      }
    } else {
      return handleOfflineUpdate(updates)
    }
  }, [tripId, isOnline])

  const handleOfflineUpdate = async (updates) => {
    // Update local cache
    const updated = await updateCachedTrip(tripId, updates)
    setTrip(updated)
    setIsOfflineData(true)

    // Queue for sync
    await queueMutation({
      type: 'UPDATE_TRIP',
      tripId,
      data: updates
    })

    toast.info('Saved offline. Will sync when online.')
    return updated
  }

  return {
    trip,
    loading,
    isOnline,
    isOfflineData,
    pendingCount,
    updateTrip,
    syncPendingChanges
  }
}
