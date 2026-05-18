import { AlertTriangle, Ambulance, Building2, Activity } from 'lucide-react'
import { useAnalytics } from '../hooks/useAnalytics'
import { useEmergencies } from '../hooks/useEmergencies'
import StatCard from '../components/StatCard'
import SeverityBadge from '../components/SeverityBadge'
import StatusBadge from '../components/StatusBadge'
import Spinner from '../components/Spinner'
import { format } from '../utils/format'

export default function Dashboard() {
  const { data: analytics, loading: aLoading } = useAnalytics()
  const { emergencies, loading: eLoading } = useEmergencies()

  const recent = emergencies
    .filter((e) => e.status !== 'resolved' && e.status !== 'cancelled')
    .slice(0, 6)

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-xl font-bold text-white">Control Room</h1>
        <p className="text-sm text-gray-500 mt-0.5">Live overview of all active emergency operations</p>
      </div>

      {/* Stat cards */}
      {aLoading ? <Spinner /> : (
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
          <StatCard
            label="Active Emergencies"
            value={analytics?.emergencies?.active}
            sub={`${analytics?.emergencies?.pending ?? 0} pending dispatch`}
            icon={AlertTriangle}
            color="red"
          />
          <StatCard
            label="Available Ambulances"
            value={analytics?.ambulances?.available}
            sub={`${analytics?.ambulances?.busy ?? 0} currently deployed`}
            icon={Ambulance}
            color="green"
          />
          <StatCard
            label="Hospital Beds Free"
            value={analytics?.hospitals?.available_beds}
            sub={`${analytics?.hospitals?.occupancy_rate ?? 0}% occupancy rate`}
            icon={Building2}
            color="blue"
          />
          <StatCard
            label="Total Resolved"
            value={analytics?.emergencies?.resolved}
            sub="All time"
            icon={Activity}
            color="purple"
          />
        </div>
      )}

      {/* Severity breakdown */}
      {analytics && (
        <div className="card">
          <h2 className="text-sm font-semibold text-gray-300 mb-4">Severity Breakdown</h2>
          <div className="flex gap-6">
            {['critical', 'medium', 'low'].map((s) => {
              const count = analytics.by_severity[s] ?? 0
              const total = analytics.emergencies.total || 1
              const pct = Math.round((count / total) * 100)
              const bar = {
                critical: 'bg-red-500',
                medium: 'bg-amber-500',
                low: 'bg-green-500',
              }[s]
              return (
                <div key={s} className="flex-1">
                  <div className="flex justify-between mb-1">
                    <SeverityBadge severity={s} />
                    <span className="text-sm font-bold text-white">{count}</span>
                  </div>
                  <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                    <div className={`h-full ${bar} rounded-full transition-all`} style={{ width: `${pct}%` }} />
                  </div>
                  <p className="text-xs text-gray-600 mt-1">{pct}% of total</p>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Active emergencies table */}
      <div className="card">
        <h2 className="text-sm font-semibold text-gray-300 mb-4">Active Emergencies</h2>
        {eLoading ? <Spinner size="sm" /> : recent.length === 0 ? (
          <p className="text-sm text-gray-600 text-center py-4">No active emergencies</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-gray-500 border-b border-gray-800">
                  <th className="pb-2 font-medium">Patient</th>
                  <th className="pb-2 font-medium">Severity</th>
                  <th className="pb-2 font-medium">Status</th>
                  <th className="pb-2 font-medium">Location</th>
                  <th className="pb-2 font-medium">Created</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/50">
                {recent.map((e) => (
                  <tr key={e.id} className="hover:bg-gray-800/30 transition-colors">
                    <td className="py-2.5 text-gray-200 font-medium">{e.patient_name}</td>
                    <td className="py-2.5"><SeverityBadge severity={e.severity} /></td>
                    <td className="py-2.5"><StatusBadge status={e.status} /></td>
                    <td className="py-2.5 text-gray-400 text-xs truncate max-w-[160px]">{e.address || `${e.lat.toFixed(3)}, ${e.lng.toFixed(3)}`}</td>
                    <td className="py-2.5 text-gray-500 text-xs">{format.timeAgo(e.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
