import { useState, useEffect, useCallback } from 'react'
import { ambulanceAPI } from '../api/endpoints'
import toast from 'react-hot-toast'

export function useAmbulances() {
  const [ambulances, setAmbulances] = useState([])
  const [loading, setLoading] = useState(true)

  const fetch = useCallback(async () => {
    try {
      const res = await ambulanceAPI.list()
      setAmbulances(res.data)
    } catch {
      toast.error('Failed to load ambulances')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetch()
    const interval = setInterval(fetch, 8000)
    return () => clearInterval(interval)
  }, [fetch])

  return { ambulances, loading, refetch: fetch }
}
