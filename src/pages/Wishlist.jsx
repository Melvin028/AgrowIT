import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Heart, ArrowRight, Package } from 'lucide-react'
import { useWishlist } from '../contexts/WishlistContext'
import { getProductById } from '../firebase/products'
import ProductCard from '../components/product/ProductCard'
import LoadingSpinner from '../components/common/LoadingSpinner'

const Wishlist = () => {
  const { wishlist } = useWishlist()
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (wishlist.length === 0) {
      setProducts([])
      setLoading(false)
      return
    }
    Promise.all(wishlist.map(id => getProductById(id))).then(results => {
      setProducts(results.filter(Boolean))
      setLoading(false)
    })
  }, [wishlist])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">
        Wishlist <span className="text-gray-400 font-normal text-lg">({products.length})</span>
      </h1>

      {products.length === 0 ? (
        <div className="text-center py-24">
          <Heart className="w-16 h-16 text-gray-200 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Your wishlist is empty</h2>
          <p className="text-gray-500 mb-6">Save products you love to find them easily later.</p>
          <Link to="/products" className="btn-primary inline-flex items-center gap-2">
            Browse products <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {products.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  )
}

export default Wishlist
