import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { ShoppingCart, Heart, ArrowLeft, Package, Minus, Plus, Send } from 'lucide-react'
import { getProductBySlug } from '../firebase/products'
import { getProductReviews, addReview, hasUserReviewedProduct, hasUserPurchasedProduct } from '../firebase/reviews'
import { useCart } from '../contexts/CartContext'
import { useWishlist } from '../contexts/WishlistContext'
import { useAuth } from '../contexts/AuthContext'
import StarRating from '../components/product/StarRating'
import LoadingSpinner from '../components/common/LoadingSpinner'
import { formatCurrency, formatDate } from '../utils/formatters'
import toast from 'react-hot-toast'

const ProductDetail = () => {
  const { slug } = useParams()
  const navigate = useNavigate()
  const { addItem, isInCart } = useCart()
  const { toggleWishlist, isWishlisted } = useWishlist()
  const { user } = useAuth()

  const [product, setProduct] = useState(null)
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [quantity, setQuantity] = useState(1)
  const [activeImage, setActiveImage] = useState(0)

  const [reviewText, setReviewText] = useState('')
  const [reviewRating, setReviewRating] = useState(5)
  const [submittingReview, setSubmittingReview] = useState(false)
  const [canReview, setCanReview] = useState(false)
  const [hasReviewed, setHasReviewed] = useState(false)

  useEffect(() => {
    const load = async () => {
      const p = await getProductBySlug(slug)
      if (!p) { navigate('/products'); return }
      const [r] = await Promise.all([getProductReviews(p.id)])
      setProduct(p)
      setReviews(r)
      setLoading(false)

      if (user) {
        const [reviewed, purchased] = await Promise.all([
          hasUserReviewedProduct(user.uid, p.id),
          hasUserPurchasedProduct(user.uid, p.id),
        ])
        setHasReviewed(reviewed)
        setCanReview(purchased && !reviewed)
      }
    }
    load()
  }, [slug, user, navigate])

  const handleAddToCart = () => {
    addItem(product, quantity)
    toast.success(`${product.name} added to cart.`)
  }

  const handleWishlist = async () => {
    if (!user) { navigate('/login'); return }
    const added = await toggleWishlist(product.id)
    toast.success(added ? 'Added to wishlist.' : 'Removed from wishlist.')
  }

  const handleSubmitReview = async (e) => {
    e.preventDefault()
    if (!user) { navigate('/login'); return }
    setSubmittingReview(true)
    try {
      await addReview({
        productId: product.id,
        userId: user.uid,
        userName: user.displayName || 'Customer',
        rating: reviewRating,
        text: reviewText,
        verified: true,
      })
      const updated = await getProductReviews(product.id)
      setReviews(updated)
      setCanReview(false)
      setHasReviewed(true)
      setReviewText('')
      toast.success('Review submitted.')
    } catch {
      toast.error('Something went wrong. Please try again.')
    } finally {
      setSubmittingReview(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  const price = product.discountedPrice ?? product.price
  const hasDiscount = product.discountedPrice && product.discountedPrice < product.price

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Link to="/products" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 mb-6">
        <ArrowLeft className="w-4 h-4" /> Back to products
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-12">
        {/* Images */}
        <div>
          <div className="aspect-square bg-gray-50 rounded-2xl overflow-hidden mb-3">
            {product.images?.[activeImage] ? (
              <img src={product.images[activeImage]} alt={product.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-300">
                <Package className="w-24 h-24" />
              </div>
            )}
          </div>
          {product.images?.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-1">
              {product.images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImage(i)}
                  className={`shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-colors ${
                    activeImage === i ? 'border-brand-600' : 'border-transparent'
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">{product.category}</p>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>
          <p className="text-sm text-gray-500 mb-3">{product.unit}</p>

          <div className="flex items-center gap-3 mb-4">
            <StarRating rating={product.avgRating || 0} size="md" showCount count={product.reviewCount || 0} />
          </div>

          <div className="flex items-baseline gap-3 mb-6">
            <span className="text-3xl font-bold text-gray-900">{formatCurrency(price)}</span>
            {hasDiscount && (
              <span className="text-lg text-gray-400 line-through">{formatCurrency(product.price)}</span>
            )}
            {hasDiscount && (
              <span className="badge bg-brand-100 text-brand-700">
                {Math.round(((product.price - product.discountedPrice) / product.price) * 100)}% off
              </span>
            )}
          </div>

          <p className="text-gray-600 leading-relaxed mb-6">{product.description}</p>

          {product.tags?.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
              {product.tags.map(tag => (
                <span key={tag} className="badge bg-gray-100 text-gray-600 text-xs px-3 py-1">{tag}</span>
              ))}
            </div>
          )}

          {/* Quantity + Add to cart */}
          {product.stock > 0 ? (
            <div className="flex items-center gap-3 mb-4">
              <div className="flex items-center border border-gray-200 rounded-lg">
                <button
                  onClick={() => setQuantity(q => Math.max(1, q - 1))}
                  className="p-2.5 text-gray-500 hover:text-gray-900 hover:bg-gray-50 rounded-l-lg"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-10 text-center text-sm font-medium">{quantity}</span>
                <button
                  onClick={() => setQuantity(q => Math.min(product.stock, q + 1))}
                  className="p-2.5 text-gray-500 hover:text-gray-900 hover:bg-gray-50 rounded-r-lg"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              <button
                onClick={handleAddToCart}
                disabled={isInCart(product.id)}
                className="flex-1 btn-primary flex items-center justify-center gap-2"
              >
                <ShoppingCart className="w-4 h-4" />
                {isInCart(product.id) ? 'Added to cart' : 'Add to cart'}
              </button>

              <button
                onClick={handleWishlist}
                className="p-3 border border-gray-200 rounded-lg hover:bg-brand-50 hover:border-brand-200 transition-colors"
              >
                <Heart
                  className={`w-5 h-5 ${isWishlisted(product.id) ? 'fill-red-500 text-red-500' : 'text-gray-500'}`}
                />
              </button>
            </div>
          ) : (
            <div className="badge bg-red-100 text-red-600 px-4 py-2 text-sm mb-4">Out of stock</div>
          )}

          {isInCart(product.id) && (
            <Link to="/cart" className="btn-secondary text-sm inline-flex items-center gap-2">
              <ShoppingCart className="w-4 h-4" /> View cart
            </Link>
          )}

          <div className="mt-6 p-4 bg-brand-50 rounded-xl text-sm text-brand-800">
            <p className="font-medium mb-1">Stock available: {product.stock} units</p>
            <p className="text-brand-600">Free delivery on orders above ₹499</p>
          </div>
        </div>
      </div>

      {/* Reviews */}
      <div className="border-t border-gray-100 pt-10">
        <h2 className="text-xl font-bold text-gray-900 mb-6">
          Reviews {reviews.length > 0 && `(${reviews.length})`}
        </h2>

        {/* Write review */}
        {canReview && (
          <form onSubmit={handleSubmitReview} className="card p-6 mb-8">
            <h3 className="font-semibold text-gray-900 mb-4">Write a review</h3>
            <div className="mb-4">
              <label className="label">Your rating</label>
              <StarRating rating={reviewRating} size="lg" interactive onChange={setReviewRating} />
            </div>
            <div className="mb-4">
              <label className="label">Your review</label>
              <textarea
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                rows={4}
                className="input resize-none"
                placeholder="Share your experience with this product..."
                required
              />
            </div>
            <button type="submit" disabled={submittingReview} className="btn-primary flex items-center gap-2">
              {submittingReview ? <LoadingSpinner size="sm" /> : <Send className="w-4 h-4" />}
              Submit review
            </button>
          </form>
        )}

        {hasReviewed && (
          <div className="card p-4 mb-6 bg-brand-50 border-brand-100 text-sm text-brand-700">
            You've already reviewed this product.
          </div>
        )}

        {!user && (
          <div className="card p-4 mb-6 text-sm text-gray-600">
            <Link to="/login" className="text-brand-600 font-medium hover:underline">Log in</Link> to leave a review (requires a verified purchase).
          </div>
        )}

        {reviews.length === 0 ? (
          <p className="text-gray-500 text-sm">No reviews yet. Be the first to review this product.</p>
        ) : (
          <div className="space-y-4">
            {reviews.map(review => (
              <div key={review.id} className="card p-5">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="font-semibold text-sm text-gray-900">{review.userName}</p>
                    {review.verified && (
                      <span className="badge bg-green-100 text-green-700 text-[10px]">Verified purchase</span>
                    )}
                  </div>
                  <span className="text-xs text-gray-400">{formatDate(review.createdAt)}</span>
                </div>
                <StarRating rating={review.rating} size="sm" />
                <p className="mt-2 text-sm text-gray-700 leading-relaxed">{review.text}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default ProductDetail
