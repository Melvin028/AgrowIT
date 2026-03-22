import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { Plus, Trash2, Tag, ToggleLeft, ToggleRight } from 'lucide-react'
import { getAllDiscounts, createDiscount, deleteDiscount, updateDiscount } from '../../firebase/discounts'
import { formatDate } from '../../utils/formatters'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import toast from 'react-hot-toast'

const AdminDiscounts = () => {
  const [discounts, setDiscounts] = useState([])
  const [loading, setLoading] = useState(true)
  const [formOpen, setFormOpen] = useState(false)
  const [saving, setSaving] = useState(false)

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    defaultValues: { type: 'percentage', minOrderAmount: 0, usageLimit: 0, active: true },
  })

  const load = async () => {
    const d = await getAllDiscounts()
    setDiscounts(d)
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const onSubmit = async (data) => {
    setSaving(true)
    try {
      await createDiscount({
        ...data,
        value: parseFloat(data.value),
        minOrderAmount: parseFloat(data.minOrderAmount) || 0,
        usageLimit: parseInt(data.usageLimit) || 0,
        expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
        active: true,
      })
      toast.success('Discount code created.')
      reset()
      setFormOpen(false)
      load()
    } catch (err) {
      toast.error(err.message || 'Something went wrong.')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (code) => {
    if (!confirm(`Delete discount code "${code}"?`)) return
    try {
      await deleteDiscount(code)
      setDiscounts(prev => prev.filter(d => d.id !== code))
      toast.success('Discount code deleted.')
    } catch {
      toast.error('Something went wrong.')
    }
  }

  const handleToggleActive = async (code, current) => {
    try {
      await updateDiscount(code, { active: !current })
      setDiscounts(prev => prev.map(d => d.id === code ? { ...d, active: !current } : d))
      toast.success(`Discount ${!current ? 'activated' : 'deactivated'}.`)
    } catch {
      toast.error('Something went wrong.')
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Discount codes</h1>
        <button onClick={() => setFormOpen(o => !o)} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" /> Add code
        </button>
      </div>

      {/* Create form */}
      {formOpen && (
        <div className="card p-6 mb-6">
          <h2 className="font-semibold text-gray-900 mb-5">New discount code</h2>
          <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Code</label>
              <input
                className="input uppercase"
                placeholder="SUMMER20"
                {...register('code', { required: 'Code is required' })}
                style={{ textTransform: 'uppercase' }}
              />
              {errors.code && <p className="text-xs text-red-500 mt-1">{errors.code.message}</p>}
            </div>

            <div>
              <label className="label">Type</label>
              <select className="input" {...register('type')}>
                <option value="percentage">Percentage (%)</option>
                <option value="fixed">Fixed amount (₹)</option>
              </select>
            </div>

            <div>
              <label className="label">Discount value</label>
              <input type="number" step="0.01" className="input" placeholder="20" {...register('value', { required: 'Value is required', min: { value: 0, message: 'Must be positive' } })} />
              {errors.value && <p className="text-xs text-red-500 mt-1">{errors.value.message}</p>}
            </div>

            <div>
              <label className="label">Minimum order amount (₹)</label>
              <input type="number" className="input" placeholder="0" {...register('minOrderAmount')} />
            </div>

            <div>
              <label className="label">Usage limit <span className="text-gray-400 font-normal">(0 = unlimited)</span></label>
              <input type="number" className="input" placeholder="0" {...register('usageLimit')} />
            </div>

            <div>
              <label className="label">Expires on <span className="text-gray-400 font-normal">(optional)</span></label>
              <input type="date" className="input" {...register('expiresAt')} />
            </div>

            <div className="sm:col-span-2 flex gap-3">
              <button type="submit" disabled={saving} className="btn-primary flex items-center gap-2">
                {saving ? <LoadingSpinner size="sm" /> : <Tag className="w-4 h-4" />}
                Create code
              </button>
              <button type="button" onClick={() => { setFormOpen(false); reset() }} className="btn-ghost">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Discounts table */}
      <div className="card overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-12"><LoadingSpinner size="lg" /></div>
        ) : discounts.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <Tag className="w-10 h-10 text-gray-200 mx-auto mb-2" />
            <p className="text-sm">No discount codes yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 text-left">
                  <th className="px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Code</th>
                  <th className="px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Discount</th>
                  <th className="px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Min order</th>
                  <th className="px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Usage</th>
                  <th className="px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Expires</th>
                  <th className="px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Status</th>
                  <th className="px-5 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {discounts.map(d => (
                  <tr key={d.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3 font-mono font-bold text-gray-900">{d.id}</td>
                    <td className="px-5 py-3 text-gray-700">
                      {d.type === 'percentage' ? `${d.value}% off` : `₹${d.value} off`}
                    </td>
                    <td className="px-5 py-3 text-gray-600">
                      {d.minOrderAmount > 0 ? `₹${d.minOrderAmount}` : 'None'}
                    </td>
                    <td className="px-5 py-3 text-gray-600">
                      {d.usedCount}/{d.usageLimit > 0 ? d.usageLimit : '∞'}
                    </td>
                    <td className="px-5 py-3 text-gray-400 text-xs">
                      {d.expiresAt ? formatDate(d.expiresAt) : 'Never'}
                    </td>
                    <td className="px-5 py-3">
                      <span className={`badge ${d.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                        {d.active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleToggleActive(d.id, d.active)}
                          className="p-1.5 text-gray-400 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-colors"
                          title={d.active ? 'Deactivate' : 'Activate'}
                        >
                          {d.active ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
                        </button>
                        <button
                          onClick={() => handleDelete(d.id)}
                          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
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

export default AdminDiscounts
