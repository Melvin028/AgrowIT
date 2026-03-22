import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Edit, Trash2, Search, Package } from 'lucide-react'
import { getProducts, deleteProduct } from '../../firebase/products'
import { formatCurrency, formatDate } from '../../utils/formatters'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import toast from 'react-hot-toast'

const AdminProducts = () => {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [deletingId, setDeletingId] = useState(null)

  const load = async () => {
    const p = await getProducts()
    setProducts(p)
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const handleDelete = async (product) => {
    if (!confirm(`Delete "${product.name}"? This action cannot be undone.`)) return
    setDeletingId(product.id)
    try {
      await deleteProduct(product.id)
      setProducts(prev => prev.filter(p => p.id !== product.id))
      toast.success('Product deleted.')
    } catch {
      toast.error('Something went wrong. Please try again.')
    } finally {
      setDeletingId(null)
    }
  }

  const filtered = products.filter(p =>
    p.name?.toLowerCase().includes(search.toLowerCase()) ||
    p.category?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Products</h1>
        <Link to="/admin/products/new" className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" /> Add product
        </Link>
      </div>

      <div className="card overflow-hidden">
        <div className="p-4 border-b border-gray-100">
          <div className="relative max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input pl-9 text-sm"
              placeholder="Search products..."
            />
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner size="lg" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <Package className="w-10 h-10 text-gray-200 mx-auto mb-2" />
            <p className="text-sm">No products found.</p>
            <Link to="/admin/products/new" className="btn-primary inline-flex items-center gap-2 mt-4">
              <Plus className="w-4 h-4" /> Add your first product
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 text-left">
                  <th className="px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Product</th>
                  <th className="px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Category</th>
                  <th className="px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Price</th>
                  <th className="px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Stock</th>
                  <th className="px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Rating</th>
                  <th className="px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Created</th>
                  <th className="px-5 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map(product => (
                  <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-100 rounded-lg overflow-hidden shrink-0">
                          {product.images?.[0]
                            ? <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
                            : <Package className="w-5 h-5 text-gray-300 m-auto" />
                          }
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 line-clamp-1">{product.name}</p>
                          <p className="text-xs text-gray-400">{product.unit}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-gray-600 capitalize">{product.category}</td>
                    <td className="px-5 py-3">
                      <div>
                        <p className="font-medium text-gray-900">{formatCurrency(product.discountedPrice ?? product.price)}</p>
                        {product.discountedPrice && (
                          <p className="text-xs text-gray-400 line-through">{formatCurrency(product.price)}</p>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <span className={`badge ${product.stock === 0 ? 'bg-red-100 text-red-700' : product.stock < 10 ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'}`}>
                        {product.stock}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-gray-600">
                      {product.avgRating > 0 ? `★ ${product.avgRating} (${product.reviewCount})` : '—'}
                    </td>
                    <td className="px-5 py-3 text-gray-400 text-xs">{formatDate(product.createdAt)}</td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <Link
                          to={`/admin/products/${product.id}/edit`}
                          className="p-1.5 text-gray-400 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => handleDelete(product)}
                          disabled={deletingId === product.id}
                          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          {deletingId === product.id ? <LoadingSpinner size="sm" /> : <Trash2 className="w-4 h-4" />}
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

export default AdminProducts
