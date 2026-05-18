import { useState, useEffect } from 'react'
import { Plus, X, Loader2, Bed, Phone, MapPin, RefreshCw } from 'lucide-react'
import { hospitalAPI } from '../api/endpoints'
import Spinner from '../components/Spinner'
import toast from 'react-hot-toast'

const defaultForm = {
  name: '', address: '', lat: '', lng: '',
  contact_number: '', total_beds: '', available_beds: '',
  icu_beds: '', available_icu_beds: '', specialties: '',
}

export default function Hospitals() {
  const [hospitals, setHospitals] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(defaultForm)
  const [submitting, setSubmitting] = useState(false)
  const [editBeds, setEditBeds] = useState({}) // { [id]: { available_beds, available_icu_beds } }

  const set = (f) => (e) => setForm({ ...form, [f]: e.target.value })

  const load = async () => {
    try {
      const res = await hospitalAPI.list()
      setHospitals(res.data)
    } catch {
      toast.error('Failed to load hospitals')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const handleCreate = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      await hospitalAPI.create({
        ...form,
        lat: parseFloat(form.lat),
        lng: parseFloat(form.lng),
        total_beds: parseInt(form.total_beds) || 0,
        available_beds: parseInt(form.available_beds) || 0,
        icu_beds: parseInt(form.icu_beds) || 0,
        available_icu_beds: parseInt(form.available_icu_beds) || 0,
        specialties: form.specialties.split(',').map((s) => s.trim()).filter(Boolean),
      })
      toast.success('Hospital registered!')
      setForm(defaultForm)
      setShowForm(false)
      load()
    } catch (err) {
      toast.error(err.response?.data?.detail ?? 'Failed to register hospital')
    } finally {
      setSubmitting(false)
    }
  }

  const handleBedUpdate = async (id) => {
    const data = editBeds[id]
    if (!data) return
    try {
      await hospitalAPI.updateBeds(id, {
        available_beds: parseInt(data.available_beds),
        available_icu_beds: parseInt(data.available_icu_beds),
      })
      toast.success('Bed count updated')
      setEditBeds((prev) => { const n = { ...prev }; delete n[id]; return n })
      load()
    } catch {
      toast.error('Failed to update beds')
    }
  }

  const occupancyColor = (avail, total) => {
    if (!total) return 'bg-gray-700'
    const pct = (1 - avail / total) * 100
    if (pct >= 90) return 'bg-red-500'
    if (pct >= 70) return 'bg-amber-500'
    return 'bg-green-500'
  }

  return (
    <div className="p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">Hospitals</h1>
          <p className="text-sm text-gray-500 mt-0.5">{hospitals.length} registered facilities</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={load} className="btn-secondary flex items-center gap-2 text-sm">
            <RefreshCw size={14} /> Refresh
          </button>
          <button onClick={() => setShowForm(true)} className="btn-primary flex items-center gap-2 text-sm">
            <Plus size={14} /> Add Hospital
          </button>
        </div>
      </div>

      {/* Register Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800 sticky top-0 bg-gray-900">
              <h2 className="font-semibold text-white">Register Hospital</h2>
              <button onClick={() => setShowForm(false)} className="text-gray-500 hover:text-gray-300"><X size={18} /></button>
            </div>
            <form onSubmit={handleCreate} className="p-6 space-y-4">
              <div>
                <label className="label">Hospital Name *</label>
                <input className="input" value={form.name} onChange={set('name')} required placeholder="City General Hospital" />
              </div>
              <div>
                <label className="label">Address *</label>
                <input className="input" value={form.address} onChange={set('address')} required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Latitude *</label>
                  <input className="input" type="number" step="any" value={form.lat} onChange={set('lat')} required />
                </div>
                <div>
                  <label className="label">Longitude *</label>
                  <input className="input" type="number" step="any" value={form.lng} onChange={set('lng')} required />
                </div>
              </div>
              <div>
                <label className="label">Contact Number</label>
                <input className="input" value={form.contact_number} onChange={set('contact_number')} placeholder="+91 80 1234 5678" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Total Beds</label>
                  <input className="input" type="number" value={form.total_beds} onChange={set('total_beds')} placeholder="200" />
                </div>
                <div>
                  <label className="label">Available Beds</label>
                  <input className="input" type="number" value={form.available_beds} onChange={set('available_beds')} placeholder="45" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">ICU Beds</label>
                  <input className="input" type="number" value={form.icu_beds} onChange={set('icu_beds')} placeholder="20" />
                </div>
                <div>
                  <label className="label">Available ICU</label>
                  <input className="input" type="number" value={form.available_icu_beds} onChange={set('available_icu_beds')} placeholder="5" />
                </div>
              </div>
              <div>
                <label className="label">Specialties (comma-separated)</label>
                <input className="input" value={form.specialties} onChange={set('specialties')} placeholder="trauma, cardiac, pediatric" />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)} className="btn-secondary flex-1">Cancel</button>
                <button className="btn-primary flex-1 flex items-center justify-center gap-2" disabled={submitting}>
                  {submitting && <Loader2 size={14} className="animate-spin" />}
                  Register Hospital
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Hospital Cards */}
      {loading ? <Spinner /> : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {hospitals.length === 0 ? (
            <p className="text-gray-600 col-span-full text-center py-12">No hospitals registered yet.</p>
          ) : hospitals.map((h) => {
            const editing = editBeds[h.id]
            const occupancy = h.total_beds ? Math.round((1 - h.available_beds / h.total_beds) * 100) : 0

            return (
              <div key={h.id} className="card space-y-4">
                {/* Top */}
                <div>
                  <h3 className="font-bold text-white text-base">{h.name}</h3>
                  <div className="flex items-center gap-1.5 text-xs text-gray-400 mt-1">
                    <MapPin size={11} className="text-gray-600" />
                    {h.address}
                  </div>
                  {h.contact_number && (
                    <div className="flex items-center gap-1.5 text-xs text-gray-500 mt-0.5">
                      <Phone size={11} className="text-gray-600" />
                      {h.contact_number}
                    </div>
                  )}
                </div>

                {/* Bed occupancy bar */}
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-gray-500">Bed Occupancy</span>
                    <span className="text-gray-300 font-medium">{occupancy}%</span>
                  </div>
                  <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${occupancyColor(h.available_beds, h.total_beds)}`}
                      style={{ width: `${occupancy}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-xs mt-1 text-gray-600">
                    <span>{h.available_beds} available</span>
                    <span>{h.total_beds} total</span>
                  </div>
                </div>

                {/* Stats row */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-gray-800/60 rounded-lg p-2.5 text-center">
                    <p className="text-lg font-bold text-white">{h.available_beds}</p>
                    <p className="text-xs text-gray-500">Free Beds</p>
                  </div>
                  <div className="bg-gray-800/60 rounded-lg p-2.5 text-center">
                    <p className="text-lg font-bold text-white">{h.available_icu_beds}</p>
                    <p className="text-xs text-gray-500">Free ICU</p>
                  </div>
                  <div className="bg-gray-800/60 rounded-lg p-2.5 text-center">
                    <p className="text-lg font-bold text-white">{h.specialties?.length || 0}</p>
                    <p className="text-xs text-gray-500">Specialties</p>
                  </div>
                </div>

                {/* Specialties */}
                {h.specialties?.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {h.specialties.map((s) => (
                      <span key={s} className="text-xs bg-gray-800 text-gray-400 px-2 py-0.5 rounded-full capitalize">{s}</span>
                    ))}
                  </div>
                )}

                {/* Update beds */}
                {editing ? (
                  <div className="pt-3 border-t border-gray-800 space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="label">Available Beds</label>
                        <input
                          className="input"
                          type="number"
                          value={editing.available_beds}
                          onChange={(e) => setEditBeds((prev) => ({ ...prev, [h.id]: { ...prev[h.id], available_beds: e.target.value } }))}
                        />
                      </div>
                      <div>
                        <label className="label">Available ICU</label>
                        <input
                          className="input"
                          type="number"
                          value={editing.available_icu_beds}
                          onChange={(e) => setEditBeds((prev) => ({ ...prev, [h.id]: { ...prev[h.id], available_icu_beds: e.target.value } }))}
                        />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => setEditBeds((prev) => { const n = {...prev}; delete n[h.id]; return n })} className="btn-secondary flex-1 text-xs">Cancel</button>
                      <button onClick={() => handleBedUpdate(h.id)} className="btn-primary flex-1 text-xs flex items-center justify-center gap-1">
                        <Bed size={12} /> Save
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setEditBeds((prev) => ({ ...prev, [h.id]: { available_beds: h.available_beds, available_icu_beds: h.available_icu_beds } }))}
                    className="w-full text-xs text-gray-500 hover:text-gray-300 border border-gray-800 hover:border-gray-700 rounded-lg py-1.5 transition-colors"
                  >
                    Update Bed Count
                  </button>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
