export const format = {
  timeAgo(isoString) {
    if (!isoString) return '—'
    const diff = (Date.now() - new Date(isoString).getTime()) / 1000
    if (diff < 60)   return `${Math.floor(diff)}s ago`
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
    return `${Math.floor(diff / 86400)}d ago`
  },

  datetime(isoString) {
    if (!isoString) return '—'
    return new Date(isoString).toLocaleString('en-IN', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    })
  },

  coords(lat, lng) {
    if (lat == null || lng == null) return 'No GPS'
    return `${lat.toFixed(4)}, ${lng.toFixed(4)}`
  },
}
