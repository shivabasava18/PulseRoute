import { useState } from 'react'
import { Plus, Loader2, X, RefreshCw } from 'lucide-react'
import { useEmergencies } from '../hooks/useEmergencies'
import SeverityBadge from '../components/SeverityBadge'
import StatusBadge from '../components/StatusBadge'
import Spinner from '../components/Spinner'
import toast from 'react-hot-toast'
import { format } from '../utils/format'

const STATUSES = ['', 'pending', 'dispatched', 'in_transit', 'resolved', 'cancelled']

const defaultForm = {
  patient_name: '', patient_phone: '', description: '',
  lat: '', lng: '', address: '', severity: 'medium',
}

export default function Emergencies() {
  const [statusFilter, setStatusFilter] = useState('')
  const { emergencies, loading, refetch, createEmergency, updateStatus } = useEmergencies(statusFilter || null)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(defaultForm)
  const [submitting, setSubmitting] = useState(false)

  const set = (f) => (e) => setForm({ ...form, [f]: e.target.value })

  const handleCreate = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      await createEmergency({
        ...form,
        lat: parseFloat(form.lat),
        lng: parseFloat(form.lng),
      })
      toast.success('Emergency created and queued for dispatch!')
      setForm(defaultForm)
      setShowForm(false)
    } catch (err) {
      toast.error(err.response?.data?.detail ?? 'Failed to create emergency')
    } finally {
      setSubmitting(false)
    }
  }

  const handleResolve = async (id) => {
    try {
      await updateStatus(id, 'resolved')
      toast.success('Marked as resolved')
    } catch {
      toast.error('Failed to update status')
    }
  }

  return (
    <div className="p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">Emergencies</h1>
          <p className="text-sm text-gray-500 mt-0.5">{emergencies.length} records</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={refetch} className="btn-secondary flex items-center gap-2 text-sm">
            <RefreshCw size={14} /> Refresh
          </button>
          <button onClick={() => setShowForm(true)} className="btn-primary flex items-center gap-2 text-sm">
            <Plus size={14} /> New Emergency
          </button>
        </div>
      </div>

      {/* Filter */}
      <div className="flex gap-2 flex-wrap">
        {STATUSES.map((s) => (
          <button
            key={s || 'all'}
            onClick={() => setStatusFilter(s)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              statusFilter === s
                ? 'bg-red-600 text-white'
                : 'bg-gray-800 text-gray-400 hover:text-gray-200'
            }`}
          >
            {s || 'All'}
          </button>
        ))}
      </div>

      {/* New Emergency Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-lg">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800">
              <h2 className="font-semibold text-white">New Emergency Request</h2>
              <button onClick={() => setShowForm(false)} className="text-gray-500 hover:text-gray-300">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleCreate} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Patient Name *</label>
                  <input className="input" value={form.patient_name} onChange={set('patient_name')} required />
                </div>
                <div>
                  <label className="label">Phone</label>
                  <input className="input" value={form.patient_phone} onChange={set('patient_phone')} />
                </div>
              </div>
              <div>
                <label className="label">Description</label>
                <textarea className="input h-20 resize-none" value={form.description} onChange={set('description')} placeholder="Brief description of the emergency..." />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Latitude *</label>
                  <input className="input" type="number" step="any" value={form.lat} onChange={set('lat')} required placeholder="12.9716" />
                </div>
                <div>
                  <label className="label">Longitude *</label>
                  <input className="input" type="number" step="any" value={form.lng} onChange={set('lng')} required placeholder="77.5946" />
                </div>
              </div>
              <div>
                <label className="label">Address</label>
                <input className="input" value={form.address} onChange={set('address')} placeholder="Street address or landmark" />
              </div>
              <div>
                <label className="label">Severity *</label>
                <select className="input" value={form.severity} onChange={set('severity')}>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="critical">Critical</option>
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)} className="btn-secondary flex-1">Cancel</button>
                <button className="btn-primary flex-1 flex items-center justify-center gap-2" disabled={submitting}>
                  {submitting && <Loader2 size={14} className="animate-spin" />}
                  Dispatch Emergency
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Table */}
      {loading ? <Spinner /> : (
        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-gray-500 border-b border-gray-800">
                <th className="pb-3 font-medium">Patient</th>
                <th className="pb-3 font-medium">Severity</th>
                <th className="pb-3 font-medium">Status</th>
                <th className="pb-3 font-medium">Location</th>
                <th className="pb-3 font-medium">Created</th>
                <th className="pb-3 font-medium">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/40">
              {emergencies.length === 0 ? (
                <tr><td colSpan={6} className="py-8 text-center text-gray-600">No emergencies found</td></tr>
              ) : emergencies.map((e) => (
                <tr key={e.id} className="hover:bg-gray-800/20 transition-colors">
                  <td className="py-3 pr-4">
                    <p className="font-medium text-gray-200">{e.patient_name}</p>
                    <p className="text-xs text-gray-500">{e.patient_phone}</p>
                  </td>
                  <td className="py-3 pr-4"><SeverityBadge severity={e.severity} /></td>
                  <td className="py-3 pr-4"><StatusBadge status={e.status} /></td>
                  <td className="py-3 pr-4 text-xs text-gray-400 max-w-[160px] truncate">
                    {e.address || `${e.lat?.toFixed(4)}, ${e.lng?.toFixed(4)}`}
                  </td>
                  <td className="py-3 pr-4 text-xs text-gray-500">{format.timeAgo(e.created_at)}</td>
                  <td className="py-3">
                    {e.status !== 'resolved' && e.status !== 'cancelled' && (
                      <button
                        onClick={() => handleResolve(e.id)}
                        className="text-xs text-green-400 hover:text-green-300 font-medium"
                      >
                        Resolve
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
