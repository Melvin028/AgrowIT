import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { User, Mail, Phone, Save } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { updateUserProfile } from '../firebase/users'
import { updateProfile } from 'firebase/auth'
import { auth } from '../firebase/config'
import LoadingSpinner from '../components/common/LoadingSpinner'
import toast from 'react-hot-toast'

const Account = () => {
  const { user, profile, refreshProfile } = useAuth()
  const [saving, setSaving] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      name: profile?.name || user?.displayName || '',
      phone: profile?.phone || '',
    },
  })

  const onSubmit = async (data) => {
    setSaving(true)
    try {
      await updateUserProfile(user.uid, { name: data.name, phone: data.phone })
      await updateProfile(auth.currentUser, { displayName: data.name })
      await refreshProfile()
      toast.success('Profile updated.')
    } catch {
      toast.error('Something went wrong. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Account settings</h1>

      <div className="card p-6">
        <div className="flex items-center gap-4 mb-6 pb-6 border-b border-gray-100">
          <div className="w-14 h-14 bg-brand-100 rounded-full flex items-center justify-center text-brand-700 text-xl font-bold">
            {(profile?.name || user?.displayName || 'U')[0].toUpperCase()}
          </div>
          <div>
            <p className="font-semibold text-gray-900">{profile?.name || user?.displayName}</p>
            <p className="text-sm text-gray-500">{user?.email}</p>
            {profile?.role === 'admin' && (
              <span className="badge bg-brand-100 text-brand-700 text-xs mt-1">Admin</span>
            )}
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="label">Full name</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                className="input pl-10"
                placeholder="Your full name"
                {...register('name', { required: 'Name is required' })}
              />
            </div>
            {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>}
          </div>

          <div>
            <label className="label">Email address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                className="input pl-10 bg-gray-50 cursor-not-allowed"
                value={user?.email}
                disabled
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">Email cannot be changed.</p>
          </div>

          <div>
            <label className="label">Phone number</label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                className="input pl-10"
                placeholder="+91 98765 43210"
                {...register('phone')}
              />
            </div>
          </div>

          <button type="submit" disabled={saving} className="btn-primary flex items-center gap-2">
            {saving ? <LoadingSpinner size="sm" /> : <Save className="w-4 h-4" />}
            Save changes
          </button>
        </form>
      </div>
    </div>
  )
}

export default Account
