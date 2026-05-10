import { useState, useEffect } from 'react'
import { Wifi, WifiOff, RefreshCw } from 'lucide-react'

export default function OfflineIndicator() {
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const [showBanner, setShowBanner] = useState(false)
  const [pendingSync, setPendingSync] = useState(0)

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true)
      // Show briefly when coming back online
      setShowBanner(true)
      setTimeout(() => setShowBanner(false), 3000)
    }

    const handleOffline = () => {
      setIsOnline(false)
      setShowBanner(true)
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    // Check for pending sync items
    const checkPending = async () => {
      if ('indexedDB' in window) {
        try {
          const db = await openOfflineDB()
          const count = await db.count('mutations')
          setPendingSync(count)
        } catch (e) {
          // IndexedDB not available or not set up
        }
      }
    }

    checkPending()
    const interval = setInterval(checkPending, 5000)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
      clearInterval(interval)
    }
  }, [])

  if (!showBanner && isOnline && pendingSync === 0) return null

  return (
    <div
      className={`
        fixed bottom-20 left-1/2 -translate-x-1/2 z-50
        flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg
        transition-all duration-300
        ${isOnline
          ? pendingSync > 0
            ? 'bg-amber-500/90 text-black'
            : 'bg-success/90 text-black'
          : 'bg-danger/90 text-white'
        }
      `}
    >
      {isOnline ? (
        pendingSync > 0 ? (
          <>
            <RefreshCw size={18} className="animate-spin" />
            <span className="text-sm font-medium">Syncing {pendingSync} changes...</span>
          </>
        ) : (
          <>
            <Wifi size={18} />
            <span className="text-sm font-medium">Back online</span>
          </>
        )
      ) : (
        <>
          <WifiOff size={18} />
          <span className="text-sm font-medium">You're offline</span>
          {pendingSync > 0 && (
            <span className="text-xs opacity-80">({pendingSync} pending)</span>
          )}
        </>
      )}
    </div>
  )
}

// Simple IndexedDB helper
async function openOfflineDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('traveloop-offline', 1)

    request.onerror = () => reject(request.error)
    request.onsuccess = () => {
      const db = request.result
      resolve({
        count: (storeName) => new Promise((res, rej) => {
          try {
            const tx = db.transaction(storeName, 'readonly')
            const store = tx.objectStore(storeName)
            const countReq = store.count()
            countReq.onsuccess = () => res(countReq.result)
            countReq.onerror = () => res(0)
          } catch {
            res(0)
          }
        })
      })
    }

    request.onupgradeneeded = (event) => {
      const db = event.target.result
      if (!db.objectStoreNames.contains('trips')) {
        db.createObjectStore('trips', { keyPath: 'id' })
      }
      if (!db.objectStoreNames.contains('mutations')) {
        db.createObjectStore('mutations', { keyPath: 'id', autoIncrement: true })
      }
    }
  })
}
