import { Link } from 'react-router-dom'
import { Heart, ShoppingCart, Package } from 'lucide-react'
import { useCart } from '../../contexts/CartContext'
import { useWishlist } from '../../contexts/WishlistContext'
import { useAuth } from '../../contexts/AuthContext'
import StarRating from './StarRating'
import toast from 'react-hot-toast'
import { formatCurrency } from '../../utils/formatters'
import { useNavigate } from 'react-router-dom'

const ProductCard = ({ product }) => {
  const { addItem, isInCart } = useCart()
  const { toggleWishlist, isWishlisted } = useWishlist()
  const { user } = useAuth()
  const navigate = useNavigate()

  const inCart = isInCart(product.id)
  const wishlisted = isWishlisted(product.id)

  const handleAddToCart = (e) => {
    e.preventDefault()
    addItem(product)
    toast.success(`${product.name} added to cart.`)
  }

  const handleWishlist = async (e) => {
    e.preventDefault()
    if (!user) {
      navigate('/login')
      return
    }
    const added = await toggleWishlist(product.id)
    toast.success(added ? 'Added to wishlist.' : 'Removed from wishlist.')
  }

  const price = product.discountedPrice ?? product.price
  const hasDiscount = product.discountedPrice && product.discountedPrice < product.price

  return (
    <Link to={`/products/${product.slug}`} className="group card overflow-hidden hover:shadow-md transition-shadow duration-200">
      {/* Image */}
      <div className="relative aspect-square bg-gray-50 overflow-hidden">
        {product.images?.[0] ? (
          <img
            src={product.images[0]}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-300">
            <Package className="w-16 h-16" />
          </div>
        )}

        {/* Wishlist button */}
        <button
          onClick={handleWishlist}
          className="absolute top-3 right-3 p-2 bg-white rounded-full shadow-sm hover:bg-brand-50 transition-colors"
          aria-label={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          <Heart
            className={`w-4 h-4 transition-colors ${
              wishlisted ? 'fill-red-500 text-red-500' : 'text-gray-400'
            }`}
          />
        </button>

        {hasDiscount && (
          <span className="absolute top-3 left-3 badge bg-brand-100 text-brand-700">
            Sale
          </span>
        )}

        {product.stock === 0 && (
          <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
            <span className="badge bg-gray-200 text-gray-600 text-xs">Out of stock</span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-4">
        <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">{product.category}</p>
        <h3 className="font-semibold text-gray-900 text-sm leading-snug mb-1 line-clamp-2">{product.name}</h3>
        <p className="text-xs text-gray-500 mb-2">{product.unit}</p>

        <StarRating rating={product.avgRating || 0} showCount count={product.reviewCount || 0} />

        <div className="mt-3 flex items-center justify-between">
          <div>
            <span className="font-bold text-gray-900">{formatCurrency(price)}</span>
            {hasDiscount && (
              <span className="ml-2 text-xs text-gray-400 line-through">{formatCurrency(product.price)}</span>
            )}
          </div>

          <button
            onClick={handleAddToCart}
            disabled={product.stock === 0 || inCart}
            className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg bg-brand-600 text-white hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ShoppingCart className="w-3.5 h-3.5" />
            {inCart ? 'In cart' : 'Add'}
          </button>
        </div>
      </div>
    </Link>
  )
}

export default ProductCard
