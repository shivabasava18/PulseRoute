export default function StatCard({ label, value, sub, icon: Icon, color = 'red' }) {
  const colorMap = {
    red:    'text-red-400 bg-red-600/10',
    green:  'text-green-400 bg-green-600/10',
    blue:   'text-blue-400 bg-blue-600/10',
    amber:  'text-amber-400 bg-amber-600/10',
    purple: 'text-purple-400 bg-purple-600/10',
  }
  const cls = colorMap[color] ?? colorMap.red

  return (
    <div className="card flex items-start gap-4">
      {Icon && (
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${cls}`}>
          <Icon size={20} className={cls.split(' ')[0]} />
        </div>
      )}
      <div className="min-w-0">
        <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">{label}</p>
        <p className="text-2xl font-bold text-white mt-0.5">{value ?? '—'}</p>
        {sub && <p className="text-xs text-gray-500 mt-0.5">{sub}</p>}
      </div>
    </div>
  )
}
