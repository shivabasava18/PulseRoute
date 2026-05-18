import api from './client'

// ── Auth ──────────────────────────────────────────────────
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login:    (data) => api.post('/auth/login', data),
  me:       ()     => api.get('/auth/me'),
}

// ── Emergency ─────────────────────────────────────────────
export const emergencyAPI = {
  create:       (data)        => api.post('/emergency/', data),
  list:         (status)      => api.get('/emergency/', { params: status ? { status } : {} }),
  get:          (id)          => api.get(`/emergency/${id}`),
  updateStatus: (id, status)  => api.patch(`/emergency/${id}/status`, { status }),
}

// ── Ambulances ────────────────────────────────────────────
export const ambulanceAPI = {
  list:           ()           => api.get('/ambulances/'),
  get:            (id)         => api.get(`/ambulances/${id}`),
  create:         (data)       => api.post('/ambulances/', data),
  updateLocation: (id, coords) => api.patch(`/ambulances/${id}/location`, coords),
  updateStatus:   (id, status) => api.patch(`/ambulances/${id}/status`, { status }),
}

// ── Hospitals ─────────────────────────────────────────────
export const hospitalAPI = {
  list:      ()               => api.get('/hospitals/'),
  nearest:   (lat, lng)       => api.get('/hospitals/nearest', { params: { lat, lng } }),
  create:    (data)           => api.post('/hospitals/', data),
  updateBeds:(id, data)       => api.patch(`/hospitals/${id}/beds`, data),
}

// ── Analytics ─────────────────────────────────────────────
export const analyticsAPI = {
  summary: () => api.get('/analytics/summary'),
}

// ── Tracking ──────────────────────────────────────────────
export const trackingAPI = {
  get: (emergencyId) => api.get(`/tracking/${emergencyId}`),
}
