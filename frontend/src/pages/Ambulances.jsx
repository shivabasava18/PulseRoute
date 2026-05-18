import { useState } from 'react'
import { Plus, Loader2, X, RefreshCw, MapPin, Clock } from 'lucide-react'
import { useAmbulances } from '../hooks/useAmbulances'
import { ambulanceAPI } from '../api/endpoints'
import StatusBadge from '../components/StatusBadge'
import Spinner from '../components/Spinner'
import toast from 'react-hot-toast'
import { format } from '../utils/format'

const STATUS_OPTIONS = ['available', 'dispatched', 'in_transit', 'maintenance', 'offline']

const defaultForm = { vehicle_number: '', equipment_notes: '' }

export default function Ambulances() {
  const { ambulances, loading, refetch } = useAmbulances()
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(defaultForm)
  const [submitting, setSubmitting] = useState(false)

  const set = (f) => (e) => setForm({ ...form, [f]: e.target.value })

  const handleCreate = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      await ambulanceAPI.create(form)
      toast.success(`Ambulance ${form.vehicle_number} registered!`)
      setForm(defaultForm)
      setShowForm(false)
      refetch()
    } catch (err) {
      toast.error(err.response?.data?.detail ?? 'Failed to register ambulance')
    } finally {
      setSubmitting(false)
    }
  }

  const handleStatusChange = async (id, status) => {
    try {
      await ambulanceAPI.updateStatus(id, status)
      toast.success('Status updated')
      refetch()
    } catch {
      toast.error('Failed to update status')
    }
  }

  const statusColor = {
    available:   'border-green-600/30 bg-green-600/5',
    dispatched:  'border-blue-600/30 bg-blue-600/5',
    in_transit:  'border-amber-600/30 bg-amber-600/5',
    maintenance: 'border-amber-600/30 bg-amber-600/5',
    offline:     'border-gray-700 bg-gray-800/30',
  }

  return (
    <div className="p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">Ambulances</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {ambulances.filter((a) => a.status === 'available').length} of {ambulances.length} available
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={refetch} className="btn-secondary flex items-center gap-2 text-sm">
            <RefreshCw size={14} /> Refresh
          </button>
          <button onClick={() => setShowForm(true)} className="btn-primary flex items-center gap-2 text-sm">
            <Plus size={14} /> Add Ambulance
          </button>
        </div>
      </div>

      {/* Register Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-md">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800">
              <h2 className="font-semibold text-white">Register Ambulance</h2>
              <button onClick={() => setShowForm(false)} className="text-gray-500 hover:text-gray-300">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleCreate} className="p-6 space-y-4">
              <div>
                <label className="label">Vehicle Number *</label>
                <input
                  className="input"
                  value={form.vehicle_number}
                  onChange={set('vehicle_number')}
                  placeholder="KA-01-AM-1234"
                  required
                />
              </div>
              <div>
                <label className="label">Equipment Notes</label>
                <textarea
                  className="input h-20 resize-none"
                  value={form.equipment_notes}
                  onChange={set('equipment_notes')}
                  placeholder="Defibrillator, oxygen tank, stretcher..."
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)} className="btn-secondary flex-1">Cancel</button>
                <button className="btn-primary flex-1 flex items-center justify-center gap-2" disabled={submitting}>
                  {submitting && <Loader2 size={14} className="animate-spin" />}
                  Register
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Cards Grid */}
      {loading ? <Spinner /> : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {ambulances.length === 0 ? (
            <p className="text-gray-600 col-span-full text-center py-12">No ambulances registered yet.</p>
          ) : ambulances.map((amb) => (
            <div
              key={amb.id}
              className={`card border transition-colors ${statusColor[amb.status] ?? 'border-gray-800'}`}
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="font-bold text-white text-base">{amb.vehicle_number}</p>
                  <StatusBadge status={amb.status} />
                </div>
                <select
                  value={amb.status}
                  onChange={(e) => handleStatusChange(amb.id, e.target.value)}
                  className="text-xs bg-gray-800 border border-gray-700 rounded-lg px-2 py-1.5 text-gray-300 focus:outline-none focus:ring-1 focus:ring-red-500"
                >
                  {STATUS_OPTIONS.map((s) => (
                    <option key={s} value={s}>{s.replace('_', ' ')}</option>
                  ))}
                </select>
              </div>

              {/* GPS Info */}
              <div className="space-y-1.5 mt-3 pt-3 border-t border-gray-800/60">
                <div className="flex items-center gap-2 text-xs text-gray-400">
                  <MapPin size={12} className="text-gray-600" />
                  {amb.current_lat && amb.current_lng
                    ? `${amb.current_lat.toFixed(4)}, ${amb.current_lng.toFixed(4)}`
                    : 'No GPS data yet'}
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <Clock size={12} className="text-gray-600" />
                  {amb.last_ping_at ? `Last ping: ${format.timeAgo(amb.last_ping_at)}` : 'Never pinged'}
                </div>
                {amb.equipment_notes && (
                  <p className="text-xs text-gray-500 mt-1 truncate" title={amb.equipment_notes}>
                    {amb.equipment_notes}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
