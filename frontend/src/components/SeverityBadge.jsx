const styles = {
  critical: 'bg-red-600/20 text-red-400 border border-red-600/30',
  medium:   'bg-amber-600/20 text-amber-400 border border-amber-600/30',
  low:      'bg-green-600/20 text-green-400 border border-green-600/30',
}

export default function SeverityBadge({ severity }) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold uppercase tracking-wide ${styles[severity] ?? styles.low}`}>
      {severity}
    </span>
  )
}
