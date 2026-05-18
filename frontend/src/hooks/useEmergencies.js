import { useState, useEffect, useCallback } from 'react'
import { emergencyAPI } from '../api/endpoints'
import toast from 'react-hot-toast'

export function useEmergencies(statusFilter = null) {
  const [emergencies, setEmergencies] = useState([])
  const [loading, setLoading] = useState(true)

  const fetch = useCallback(async () => {
    try {
      const res = await emergencyAPI.list(statusFilter)
      setEmergencies(res.data)
    } catch (err) {
      toast.error('Failed to load emergencies')
    } finally {
      setLoading(false)
    }
  }, [statusFilter])

  useEffect(() => {
    fetch()
    // Auto-refresh every 10 seconds
    const interval = setInterval(fetch, 10000)
    return () => clearInterval(interval)
  }, [fetch])

  const createEmergency = async (data) => {
    const res = await emergencyAPI.create(data)
    setEmergencies((prev) => [res.data, ...prev])
    return res.data
  }

  const updateStatus = async (id, status) => {
    const res = await emergencyAPI.updateStatus(id, status)
    setEmergencies((prev) => prev.map((e) => (e.id === id ? res.data : e)))
    return res.data
  }

  return { emergencies, loading, refetch: fetch, createEmergency, updateStatus }
}
