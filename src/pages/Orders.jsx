import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Package, ArrowRight, ShoppingBag } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { getUserOrders } from '../firebase/orders'
import { formatCurrency, formatDate } from '../utils/formatters'
import LoadingSpinner from '../components/common/LoadingSpinner'

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-700',
  confirmed: 'bg-brand-100 text-brand-700',
  shipped: 'bg-blue-100 text-blue-700',
  delivered: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
}

const Orders = () => {
  const { user } = useAuth()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getUserOrders(user.uid).then(o => {
      setOrders(o)
      setLoading(false)
    })
  }, [user.uid])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (orders.length === 0) {
    return (
      <div className="max-w-xl mx-auto px-4 py-24 text-center">
        <ShoppingBag className="w-16 h-16 text-gray-200 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-gray-900 mb-2">No orders yet</h2>
        <p className="text-gray-500 mb-6">Place your first order to see it here.</p>
        <Link to="/products" className="btn-primary inline-flex items-center gap-2">
          Browse products <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">My orders</h1>
      <div className="space-y-4">
        {orders.map(order => (
          <Link
            key={order.id}
            to={`/orders/${order.id}`}
            className="card p-5 flex items-center gap-5 hover:shadow-md transition-shadow group"
          >
            <div className="w-12 h-12 bg-brand-50 rounded-xl flex items-center justify-center shrink-0">
              <Package className="w-6 h-6 text-brand-600" />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-semibold text-gray-900 text-sm">#{order.id.slice(-8).toUpperCase()}</span>
                <span className={`badge ${statusColors[order.status] || 'bg-gray-100 text-gray-600'} capitalize`}>
                  {order.status}
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-0.5">{formatDate(order.createdAt)} · {order.items?.length} {order.items?.length === 1 ? 'item' : 'items'}</p>
              <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">
                {order.items?.map(i => i.name).join(', ')}
              </p>
            </div>

            <div className="text-right shrink-0">
              <p className="font-bold text-gray-900">{formatCurrency(order.total)}</p>
              <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-brand-600 ml-auto mt-1 transition-colors" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}

export default Orders
