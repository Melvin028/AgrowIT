import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { CheckCircle, Package, ArrowRight } from 'lucide-react'
import { getOrderById } from '../firebase/orders'
import { formatCurrency, formatDateTime } from '../utils/formatters'
import LoadingSpinner from '../components/common/LoadingSpinner'

const OrderSuccess = () => {
  const { id } = useParams()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getOrderById(id).then(o => {
      setOrder(o)
      setLoading(false)
    })
  }, [id])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="max-w-xl mx-auto px-4 py-16 text-center">
      <div className="w-20 h-20 bg-brand-100 rounded-full flex items-center justify-center mx-auto mb-6">
        <CheckCircle className="w-10 h-10 text-brand-600" />
      </div>

      <h1 className="text-3xl font-bold text-gray-900 mb-2">Order placed!</h1>
      <p className="text-gray-600 mb-8">
        Thank you for your purchase. You'll receive a confirmation email shortly.
      </p>

      {order && (
        <div className="card p-6 text-left mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900">Order details</h2>
            <span className="badge bg-brand-100 text-brand-700 capitalize">{order.status}</span>
          </div>
          <div className="space-y-2 text-sm text-gray-600 mb-4">
            <div className="flex justify-between">
              <span>Order ID</span>
              <span className="font-mono text-xs text-gray-800">{order.id}</span>
            </div>
            <div className="flex justify-between">
              <span>Date</span>
              <span>{formatDateTime(order.createdAt)}</span>
            </div>
            <div className="flex justify-between">
              <span>Payment ID</span>
              <span className="font-mono text-xs text-gray-800">{order.paymentId}</span>
            </div>
            <div className="flex justify-between font-bold text-gray-900 pt-2 border-t border-gray-100">
              <span>Total paid</span>
              <span>{formatCurrency(order.total)}</span>
            </div>
          </div>

          <div className="space-y-3">
            {order.items?.map((item, i) => (
              <div key={i} className="flex items-center gap-3 text-sm">
                {item.image && (
                  <img src={item.image} alt={item.name} className="w-10 h-10 rounded-lg object-cover bg-gray-50" />
                )}
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{item.name}</p>
                  <p className="text-gray-500 text-xs">× {item.quantity}</p>
                </div>
                <span>{formatCurrency(item.price * item.quantity)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Link to="/orders" className="btn-secondary flex items-center justify-center gap-2">
          <Package className="w-4 h-4" /> Track order
        </Link>
        <Link to="/products" className="btn-primary flex items-center justify-center gap-2">
          Continue shopping <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  )
}

export default OrderSuccess
