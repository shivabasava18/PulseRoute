const styles = {
  pending:      'bg-gray-700/60 text-gray-400',
  dispatching:  'bg-blue-600/20 text-blue-400',
  dispatched:   'bg-blue-600/20 text-blue-400',
  in_transit:   'bg-amber-600/20 text-amber-400',
  arrived:      'bg-purple-600/20 text-purple-400',
  transporting: 'bg-purple-600/20 text-purple-400',
  resolved:     'bg-green-600/20 text-green-400',
  cancelled:    'bg-red-900/30 text-red-500',
  // Ambulance statuses
  available:    'bg-green-600/20 text-green-400',
  dispatched_a: 'bg-blue-600/20 text-blue-400',
  maintenance:  'bg-amber-600/20 text-amber-400',
  offline:      'bg-gray-700/60 text-gray-500',
}

export default function StatusBadge({ status }) {
  const label = status?.replace(/_/g, ' ')
  const cls = styles[status] ?? 'bg-gray-700/60 text-gray-400'
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium capitalize ${cls}`}>
      {label}
    </span>
  )
}
