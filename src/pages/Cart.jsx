import { Link, useNavigate } from 'react-router-dom'
import { Trash2, Plus, Minus, ShoppingCart, ArrowRight } from 'lucide-react'
import { useCart } from '../contexts/CartContext'
import { useAuth } from '../contexts/AuthContext'
import { formatCurrency } from '../utils/formatters'

const Cart = () => {
  const { items, removeItem, updateQuantity, total, itemCount } = useCart()
  const { user } = useAuth()
  const navigate = useNavigate()

  if (items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-24 text-center">
        <ShoppingCart className="w-16 h-16 text-gray-200 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-gray-900 mb-2">Your cart is empty</h2>
        <p className="text-gray-500 mb-6">Add some spices to get started.</p>
        <Link to="/products" className="btn-primary inline-flex items-center gap-2">
          Browse products <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">
        Cart <span className="text-gray-400 font-normal text-lg">({itemCount} {itemCount === 1 ? 'item' : 'items'})</span>
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Items */}
        <div className="lg:col-span-2 space-y-4">
          {items.map(item => {
            const price = item.discountedPrice ?? item.price
            return (
              <div key={item.id} className="card p-4 flex gap-4">
                <Link to={`/products/${item.slug}`} className="shrink-0 w-20 h-20 bg-gray-50 rounded-xl overflow-hidden">
                  {item.images?.[0] ? (
                    <img src={item.images[0]} alt={item.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300">
                      <ShoppingCart className="w-6 h-6" />
                    </div>
                  )}
                </Link>

                <div className="flex-1 min-w-0">
                  <Link to={`/products/${item.slug}`} className="font-semibold text-gray-900 hover:text-brand-700 text-sm line-clamp-1">
                    {item.name}
                  </Link>
                  <p className="text-xs text-gray-500 mt-0.5">{item.unit}</p>

                  <div className="mt-2 flex items-center justify-between">
                    <div className="flex items-center border border-gray-200 rounded-lg">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="p-1.5 text-gray-500 hover:text-gray-900 hover:bg-gray-50 rounded-l-lg"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="w-8 text-center text-sm">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="p-1.5 text-gray-500 hover:text-gray-900 hover:bg-gray-50 rounded-r-lg"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="font-bold text-sm">{formatCurrency(price * item.quantity)}</span>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="text-gray-400 hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Summary */}
        <div>
          <div className="card p-5 sticky top-24">
            <h2 className="font-bold text-gray-900 mb-4">Order summary</h2>

            <div className="space-y-2 text-sm mb-4">
              {items.map(item => (
                <div key={item.id} className="flex justify-between text-gray-600">
                  <span className="line-clamp-1 flex-1 mr-2">{item.name} × {item.quantity}</span>
                  <span>{formatCurrency((item.discountedPrice ?? item.price) * item.quantity)}</span>
                </div>
              ))}
            </div>

            <div className="border-t border-gray-100 pt-3 mb-4">
              <div className="flex justify-between font-bold text-gray-900">
                <span>Subtotal</span>
                <span>{formatCurrency(total)}</span>
              </div>
              <p className="text-xs text-gray-500 mt-1">Shipping and discounts calculated at checkout.</p>
            </div>

            {total >= 499 ? (
              <p className="text-xs text-brand-600 font-medium mb-4">You qualify for free delivery!</p>
            ) : (
              <p className="text-xs text-gray-500 mb-4">
                Add {formatCurrency(499 - total)} more for free delivery.
              </p>
            )}

            <button
              onClick={() => user ? navigate('/checkout') : navigate('/login', { state: { from: { pathname: '/checkout' } } })}
              className="btn-primary w-full flex items-center justify-center gap-2"
            >
              Proceed to checkout <ArrowRight className="w-4 h-4" />
            </button>

            <Link to="/products" className="btn-ghost w-full text-center text-sm mt-2 block">
              Continue shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Cart
