import { AlertTriangle, Ambulance, Building2, CheckCircle2, Clock, TrendingUp } from 'lucide-react'
import { useAnalytics } from '../hooks/useAnalytics'
import StatCard from '../components/StatCard'
import Spinner from '../components/Spinner'

function Ring({ value, max, color, label }) {
  const pct = max ? Math.round((value / max) * 100) : 0
  const r = 36
  const circ = 2 * Math.PI * r
  const dash = (pct / 100) * circ

  const stroke = {
    red: '#ef4444', amber: '#f59e0b', green: '#22c55e', blue: '#3b82f6'
  }[color] ?? '#ef4444'

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative w-24 h-24">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 88 88">
          <circle cx="44" cy="44" r={r} fill="none" stroke="#1f2937" strokeWidth="8" />
          <circle
            cx="44" cy="44" r={r} fill="none"
            stroke={stroke} strokeWidth="8"
            strokeDasharray={`${dash} ${circ}`}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-xl font-bold text-white">{pct}%</span>
        </div>
      </div>
      <div className="text-center">
        <p className="text-sm font-medium text-gray-300">{label}</p>
        <p className="text-xs text-gray-500">{value} / {max}</p>
      </div>
    </div>
  )
}

function BarRow({ label, value, max, color }) {
  const pct = max ? Math.round((value / max) * 100) : 0
  const barColor = { red: 'bg-red-500', amber: 'bg-amber-500', green: 'bg-green-500', blue: 'bg-blue-500' }[color] ?? 'bg-red-500'
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-gray-400 w-24 flex-shrink-0 capitalize">{label}</span>
      <div className="flex-1 h-2 bg-gray-800 rounded-full overflow-hidden">
        <div className={`h-full ${barColor} rounded-full transition-all duration-500`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs font-semibold text-white w-8 text-right">{value}</span>
    </div>
  )
}

export default function Analytics() {
  const { data, loading } = useAnalytics()

  if (loading) return <div className="p-6"><Spinner /></div>
  if (!data) return <div className="p-6 text-gray-500">No analytics data available.</div>

  const total = data.emergencies.total || 1

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-xl font-bold text-white">Analytics</h1>
        <p className="text-sm text-gray-500 mt-0.5">System-wide performance overview</p>
      </div>

      {/* Top stat cards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard label="Total Emergencies" value={data.emergencies.total} icon={AlertTriangle} color="red" />
        <StatCard label="Resolved" value={data.emergencies.resolved} sub={`${Math.round((data.emergencies.resolved / total) * 100)}% resolution rate`} icon={CheckCircle2} color="green" />
        <StatCard label="Total Ambulances" value={data.ambulances.total} sub={`${data.ambulances.available} available now`} icon={Ambulance} color="blue" />
        <StatCard label="Hospital Capacity" value={`${100 - data.hospitals.occupancy_rate}%`} sub="Beds currently free" icon={Building2} color="purple" />
      </div>

      {/* Two-column section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

        {/* Emergency breakdown */}
        <div className="card space-y-4">
          <h2 className="text-sm font-semibold text-gray-300">Emergency Status Breakdown</h2>
          <div className="space-y-3">
            <BarRow label="Pending"    value={data.emergencies.pending}  max={total} color="amber" />
            <BarRow label="Active"     value={data.emergencies.active}   max={total} color="blue" />
            <BarRow label="Resolved"   value={data.emergencies.resolved} max={total} color="green" />
          </div>
        </div>

        {/* Severity breakdown */}
        <div className="card space-y-4">
          <h2 className="text-sm font-semibold text-gray-300">Severity Distribution</h2>
          <div className="space-y-3">
            <BarRow label="Critical" value={data.by_severity.critical} max={total} color="red" />
            <BarRow label="Medium"   value={data.by_severity.medium}   max={total} color="amber" />
            <BarRow label="Low"      value={data.by_severity.low}      max={total} color="green" />
          </div>
        </div>

        {/* Ambulance utilization */}
        <div className="card flex flex-col gap-4">
          <h2 className="text-sm font-semibold text-gray-300">Ambulance Fleet Status</h2>
          <div className="flex items-center justify-around py-4">
            <Ring value={data.ambulances.available} max={data.ambulances.total} color="green" label="Available" />
            <Ring value={data.ambulances.busy}      max={data.ambulances.total} color="red"   label="Deployed" />
          </div>
        </div>

        {/* Hospital capacity */}
        <div className="card flex flex-col gap-4">
          <h2 className="text-sm font-semibold text-gray-300">Hospital Bed Capacity</h2>
          <div className="flex items-center justify-around py-4">
            <Ring
              value={data.hospitals.total_beds - data.hospitals.available_beds}
              max={data.hospitals.total_beds}
              color="amber"
              label="Occupied"
            />
            <Ring
              value={data.hospitals.available_beds}
              max={data.hospitals.total_beds}
              color="green"
              label="Available"
            />
          </div>
          <div className="text-center text-xs text-gray-500">
            {data.hospitals.occupancy_rate}% overall occupancy across all facilities
          </div>
        </div>
      </div>

      {/* Summary note */}
      <div className="card border border-blue-600/20 bg-blue-600/5">
        <div className="flex items-start gap-3">
          <TrendingUp size={16} className="text-blue-400 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-blue-300">Phase 2 Analytics</p>
            <p className="text-xs text-gray-500 mt-1">
              Average response time, daily trends, dispatch efficiency charts, and per-driver performance
              will be available in Phase 2 once historical data accumulates.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
