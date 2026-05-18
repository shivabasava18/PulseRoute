import { useState, useEffect } from 'react'
import { analyticsAPI } from '../api/endpoints'

export function useAnalytics() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const res = await analyticsAPI.summary()
        setData(res.data)
      } finally {
        setLoading(false)
      }
    }
    load()
    const interval = setInterval(load, 15000)
    return () => clearInterval(interval)
  }, [])

  return { data, loading }
}
