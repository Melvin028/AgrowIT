import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ShoppingBag, Package, TrendingUp, Users, ArrowRight, Clock } from 'lucide-react'
import { getAllOrders } from '../../firebase/orders'
import { getProducts } from '../../firebase/products'
import { getAllUsers } from '../../firebase/users'
import { formatCurrency, formatDate } from '../../utils/formatters'
import LoadingSpinner from '../../components/common/LoadingSpinner'

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-700',
  confirmed: 'bg-brand-100 text-brand-700',
  shipped: 'bg-blue-100 text-blue-700',
  delivered: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
}

const AdminDashboard = () => {
  const [orders, setOrders] = useState([])
  const [products, setProducts] = useState([])
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([getAllOrders(), getProducts(), getAllUsers()]).then(([o, p, u]) => {
      setOrders(o)
      setProducts(p)
      setUsers(u)
      setLoading(false)
    })
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  const totalRevenue = orders
    .filter(o => o.status !== 'cancelled')
    .reduce((sum, o) => sum + (o.total ?? 0), 0)

  const pendingOrders = orders.filter(o => o.status === 'pending').length
  const recentOrders = orders.slice(0, 5)

  const topProducts = [...products]
    .sort((a, b) => (b.reviewCount ?? 0) - (a.reviewCount ?? 0))
    .slice(0, 5)

  const stats = [
    { label: 'Total revenue', value: formatCurrency(totalRevenue), icon: TrendingUp, color: 'text-brand-600 bg-brand-50' },
    { label: 'Total orders', value: orders.length, icon: ShoppingBag, color: 'text-blue-600 bg-blue-50' },
    { label: 'Products', value: products.length, icon: Package, color: 'text-purple-600 bg-purple-50' },
    { label: 'Customers', value: users.filter(u => u.role === 'customer').length, icon: Users, color: 'text-amber-600 bg-amber-50' },
  ]

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500">{formatDate(new Date())}</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        {stats.map(stat => (
          <div key={stat.label} className="card p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm text-gray-500">{stat.label}</p>
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${stat.color}`}>
                <stat.icon className="w-5 h-5" />
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
          </div>
        ))}
      </div>

      {pendingOrders > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 flex items-center justify-between">
          <div className="flex items-center gap-2 text-amber-800">
            <Clock className="w-4 h-4" />
            <span className="text-sm font-medium">{pendingOrders} order{pendingOrders > 1 ? 's' : ''} awaiting confirmation</span>
          </div>
          <Link to="/admin/orders" className="text-sm font-medium text-amber-700 hover:underline flex items-center gap-1">
            View <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent orders */}
        <div className="card">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900">Recent orders</h2>
            <Link to="/admin/orders" className="text-xs text-brand-600 hover:underline flex items-center gap-1">
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="divide-y divide-gray-50">
            {recentOrders.length === 0 ? (
              <p className="text-sm text-gray-500 px-5 py-4">No orders yet.</p>
            ) : (
              recentOrders.map(order => (
                <Link key={order.id} to={`/admin/orders/${order.id}`} className="flex items-center justify-between px-5 py-3 hover:bg-gray-50 transition-colors">
                  <div>
                    <p className="text-sm font-medium text-gray-900">#{order.id.slice(-8).toUpperCase()}</p>
                    <p className="text-xs text-gray-500">{formatDate(order.createdAt)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-gray-900">{formatCurrency(order.total)}</p>
                    <span className={`badge text-[10px] ${statusColors[order.status] || 'bg-gray-100 text-gray-600'} capitalize`}>
                      {order.status}
                    </span>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>

        {/* Top products */}
        <div className="card">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900">Top products</h2>
            <Link to="/admin/products" className="text-xs text-brand-600 hover:underline flex items-center gap-1">
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="divide-y divide-gray-50">
            {topProducts.length === 0 ? (
              <p className="text-sm text-gray-500 px-5 py-4">No products yet.</p>
            ) : (
              topProducts.map(product => (
                <Link key={product.id} to={`/admin/products/${product.id}/edit`} className="flex items-center gap-3 px-5 py-3 hover:bg-gray-50 transition-colors">
                  <div className="w-10 h-10 bg-gray-50 rounded-lg overflow-hidden shrink-0">
                    {product.images?.[0] && <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 line-clamp-1">{product.name}</p>
                    <p className="text-xs text-gray-500">{product.reviewCount || 0} reviews · ★ {product.avgRating || 0}</p>
                  </div>
                  <p className="text-sm font-bold text-gray-900">{formatCurrency(product.discountedPrice ?? product.price)}</p>
                </Link>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard
