import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, MapPin, Package } from 'lucide-react'
import { getOrderById, updateOrderStatus } from '../../firebase/orders'
import { formatCurrency, formatDateTime } from '../../utils/formatters'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import toast from 'react-hot-toast'

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-700',
  confirmed: 'bg-brand-100 text-brand-700',
  shipped: 'bg-blue-100 text-blue-700',
  delivered: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
}

const AdminOrderDetail = () => {
  const { id } = useParams()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)

  useEffect(() => {
    getOrderById(id).then(o => {
      setOrder(o)
      setLoading(false)
    })
  }, [id])

  const handleStatusChange = async (newStatus) => {
    setUpdating(true)
    try {
      await updateOrderStatus(id, newStatus)
      setOrder(prev => ({ ...prev, status: newStatus }))
      toast.success(`Order status updated to ${newStatus}.`)
    } catch {
      toast.error('Something went wrong. Please try again.')
    } finally {
      setUpdating(false)
    }
  }

  if (loading) {
    return <div className="flex items-center justify-center h-64"><LoadingSpinner size="lg" /></div>
  }

  if (!order) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Order not found.</p>
        <Link to="/admin/orders" className="btn-primary mt-4 inline-block">Back to orders</Link>
      </div>
    )
  }

  return (
    <div className="max-w-3xl">
      <Link to="/admin/orders" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 mb-6">
        <ArrowLeft className="w-4 h-4" /> Back to orders
      </Link>

      <div className="flex flex-wrap items-center gap-3 mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Order #{order.id.slice(-8).toUpperCase()}</h1>
        <span className={`badge capitalize ${statusColors[order.status] || 'bg-gray-100 text-gray-600'} text-sm px-3 py-1`}>
          {order.status}
        </span>
      </div>

      {/* Update status */}
      <div className="card p-5 mb-6">
        <h2 className="font-semibold text-gray-900 mb-3">Update status</h2>
        <div className="flex flex-wrap gap-2">
          {['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'].map(status => (
            <button
              key={status}
              onClick={() => handleStatusChange(status)}
              disabled={updating || order.status === status}
              className={`badge capitalize px-4 py-2 text-xs font-medium cursor-pointer transition-colors ${
                order.status === status
                  ? (statusColors[status] || 'bg-gray-100 text-gray-600') + ' ring-2 ring-offset-1 ring-current'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              } disabled:cursor-not-allowed`}
            >
              {status}
            </button>
          ))}
          {updating && <LoadingSpinner size="sm" />}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
        {/* Items */}
        <div className="card p-5">
          <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Package className="w-4 h-4 text-brand-600" /> Items
          </h2>
          <div className="space-y-3">
            {order.items?.map((item, i) => (
              <div key={i} className="flex items-center gap-3 text-sm">
                {item.image && <img src={item.image} alt={item.name} className="w-10 h-10 rounded-lg object-cover bg-gray-50" />}
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{item.name}</p>
                  <p className="text-gray-500 text-xs">× {item.quantity}</p>
                </div>
                <span className="font-medium">{formatCurrency(item.price * item.quantity)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Address */}
        <div className="card p-5">
          <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-brand-600" /> Delivery address
          </h2>
          {order.address && (
            <div className="text-sm text-gray-600 space-y-1">
              <p className="font-medium text-gray-900">{order.address.name}</p>
              <p>{order.address.phone}</p>
              <p>{order.address.line1}</p>
              {order.address.line2 && <p>{order.address.line2}</p>}
              <p>{order.address.city}, {order.address.state} – {order.address.pincode}</p>
            </div>
          )}
        </div>
      </div>

      {/* Payment */}
      <div className="card p-5">
        <h2 className="font-semibold text-gray-900 mb-4">Payment</h2>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between text-gray-600"><span>Subtotal</span><span>{formatCurrency(order.subtotal)}</span></div>
          {order.discount > 0 && (
            <div className="flex justify-between text-brand-700"><span>Discount</span><span>−{formatCurrency(order.discount)}</span></div>
          )}
          <div className="flex justify-between text-gray-600"><span>Shipping</span><span>{order.shipping === 0 ? 'Free' : formatCurrency(order.shipping)}</span></div>
          <div className="flex justify-between font-bold text-gray-900 pt-2 border-t border-gray-100"><span>Total</span><span>{formatCurrency(order.total)}</span></div>
        </div>
        <div className="mt-4 pt-4 border-t border-gray-100 text-xs text-gray-400 space-y-1">
          <p>Placed: {formatDateTime(order.createdAt)}</p>
          {order.paymentId && <p>Payment ID: {order.paymentId}</p>}
          {order.discountCode && <p>Discount code: {order.discountCode}</p>}
        </div>
      </div>
    </div>
  )
}

export default AdminOrderDetail
