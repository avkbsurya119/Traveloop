const DB_NAME = 'traveloop-offline'
const DB_VERSION = 1

let dbInstance = null

export async function openDB() {
  if (dbInstance) return dbInstance

  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)

    request.onerror = () => reject(request.error)

    request.onsuccess = () => {
      dbInstance = request.result
      resolve(dbInstance)
    }

    request.onupgradeneeded = (event) => {
      const db = event.target.result

      // Trips store - for offline trip data
      if (!db.objectStoreNames.contains('trips')) {
        const tripsStore = db.createObjectStore('trips', { keyPath: 'id' })
        tripsStore.createIndex('userId', 'userId', { unique: false })
        tripsStore.createIndex('syncStatus', 'syncStatus', { unique: false })
      }

      // Mutations store - for queued offline changes
      if (!db.objectStoreNames.contains('mutations')) {
        const mutationsStore = db.createObjectStore('mutations', { keyPath: 'id', autoIncrement: true })
        mutationsStore.createIndex('timestamp', 'timestamp', { unique: false })
        mutationsStore.createIndex('type', 'type', { unique: false })
      }
    }
  })
}

// Trip operations
export async function cacheTrip(trip) {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction('trips', 'readwrite')
    const store = tx.objectStore('trips')

    const tripWithMeta = {
      ...trip,
      _cachedAt: Date.now(),
      syncStatus: 'synced'
    }

    const request = store.put(tripWithMeta)
    request.onsuccess = () => resolve(tripWithMeta)
    request.onerror = () => reject(request.error)
  })
}

export async function getCachedTrip(tripId) {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction('trips', 'readonly')
    const store = tx.objectStore('trips')
    const request = store.get(tripId)

    request.onsuccess = () => resolve(request.result || null)
    request.onerror = () => reject(request.error)
  })
}

export async function getCachedTrips(userId) {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction('trips', 'readonly')
    const store = tx.objectStore('trips')
    const index = store.index('userId')
    const request = index.getAll(userId)

    request.onsuccess = () => resolve(request.result || [])
    request.onerror = () => reject(request.error)
  })
}

export async function updateCachedTrip(tripId, updates) {
  const existing = await getCachedTrip(tripId)
  if (!existing) return null

  const updated = {
    ...existing,
    ...updates,
    _updatedAt: Date.now(),
    syncStatus: 'pending'
  }

  return cacheTrip(updated)
}

export async function deleteCachedTrip(tripId) {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction('trips', 'readwrite')
    const store = tx.objectStore('trips')
    const request = store.delete(tripId)

    request.onsuccess = () => resolve()
    request.onerror = () => reject(request.error)
  })
}

// Mutation queue operations
export async function queueMutation(mutation) {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction('mutations', 'readwrite')
    const store = tx.objectStore('mutations')

    const mutationWithMeta = {
      ...mutation,
      timestamp: Date.now(),
      status: 'pending'
    }

    const request = store.add(mutationWithMeta)
    request.onsuccess = () => resolve({ ...mutationWithMeta, id: request.result })
    request.onerror = () => reject(request.error)
  })
}

export async function getPendingMutations() {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction('mutations', 'readonly')
    const store = tx.objectStore('mutations')
    const request = store.getAll()

    request.onsuccess = () => {
      const mutations = request.result.filter(m => m.status === 'pending')
      resolve(mutations.sort((a, b) => a.timestamp - b.timestamp))
    }
    request.onerror = () => reject(request.error)
  })
}

export async function removeMutation(mutationId) {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction('mutations', 'readwrite')
    const store = tx.objectStore('mutations')
    const request = store.delete(mutationId)

    request.onsuccess = () => resolve()
    request.onerror = () => reject(request.error)
  })
}

export async function clearAllMutations() {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction('mutations', 'readwrite')
    const store = tx.objectStore('mutations')
    const request = store.clear()

    request.onsuccess = () => resolve()
    request.onerror = () => reject(request.error)
  })
}

// Sync utilities
export async function getPendingCount() {
  const mutations = await getPendingMutations()
  return mutations.length
}

export async function markTripsSynced(tripIds) {
  const db = await openDB()
  const tx = db.transaction('trips', 'readwrite')
  const store = tx.objectStore('trips')

  for (const tripId of tripIds) {
    const trip = await new Promise(resolve => {
      const req = store.get(tripId)
      req.onsuccess = () => resolve(req.result)
    })

    if (trip) {
      trip.syncStatus = 'synced'
      store.put(trip)
    }
  }
}

export async function clearCache() {
  const db = await openDB()

  const tripsPromise = new Promise((resolve, reject) => {
    const tx = db.transaction('trips', 'readwrite')
    const request = tx.objectStore('trips').clear()
    request.onsuccess = resolve
    request.onerror = () => reject(request.error)
  })

  const mutationsPromise = clearAllMutations()

  await Promise.all([tripsPromise, mutationsPromise])
}
