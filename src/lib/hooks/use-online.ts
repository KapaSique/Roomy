'use client'

import { useState, useEffect } from 'react'

export function useOnline() {
  const [isOnline, setIsOnline] = useState(true)

  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    setIsOnline(navigator.onLine)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  return isOnline
}

export function OfflineBanner() {
  const isOnline = useOnline()

  if (isOnline) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-amber-500 text-white px-4 py-2 text-center text-sm font-medium z-50">
      Нет соединения с интернетом. Некоторые функции могут быть недоступны.
    </div>
  )
}
