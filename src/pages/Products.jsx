import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Search, SlidersHorizontal, X, Leaf } from 'lucide-react'
import { getProducts, getCategories, searchProducts } from '../firebase/products'
import ProductCard from '../components/product/ProductCard'
import LoadingSpinner from '../components/common/LoadingSpinner'

const Products = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [filtersOpen, setFiltersOpen] = useState(false)

  const searchTerm = searchParams.get('search') || ''
  const selectedCategory = searchParams.get('category') || ''
  const sortBy = searchParams.get('sort') || 'newest'

  useEffect(() => {
    getCategories().then(setCategories)
  }, [])

  useEffect(() => {
    setLoading(true)
    const load = async () => {
      let results
      if (searchTerm) {
        results = await searchProducts(searchTerm)
      } else {
        results = await getProducts({ category: selectedCategory || undefined })
      }

      // Client-side sort
      if (sortBy === 'price-asc') results.sort((a, b) => (a.discountedPrice ?? a.price) - (b.discountedPrice ?? b.price))
      else if (sortBy === 'price-desc') results.sort((a, b) => (b.discountedPrice ?? b.price) - (a.discountedPrice ?? a.price))
      else if (sortBy === 'rating') results.sort((a, b) => (b.avgRating ?? 0) - (a.avgRating ?? 0))

      setProducts(results)
      setLoading(false)
    }
    load()
  }, [searchTerm, selectedCategory, sortBy])

  const updateParam = (key, value) => {
    const next = new URLSearchParams(searchParams)
    if (value) next.set(key, value)
    else next.delete(key)
    setSearchParams(next)
  }

  const clearFilters = () => setSearchParams({})

  const hasFilters = searchTerm || selectedCategory || sortBy !== 'newest'

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {searchTerm ? `Results for "${searchTerm}"` : selectedCategory ? categories.find(c => c.slug === selectedCategory)?.name || 'Products' : 'All spices'}
          </h1>
          {!loading && (
            <p className="text-sm text-gray-500 mt-1">
              {products.length} {products.length === 1 ? 'product' : 'products'} found
            </p>
          )}
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setFiltersOpen(o => !o)}
            className="flex items-center gap-2 btn-secondary text-sm py-2"
          >
            <SlidersHorizontal className="w-4 h-4" />
            Filters
          </button>

          <select
            value={sortBy}
            onChange={(e) => updateParam('sort', e.target.value)}
            className="input w-auto text-sm py-2"
          >
            <option value="newest">Newest first</option>
            <option value="price-asc">Price: low to high</option>
            <option value="price-desc">Price: high to low</option>
            <option value="rating">Top rated</option>
          </select>
        </div>
      </div>

      {/* Active filters */}
      {hasFilters && (
        <div className="flex flex-wrap items-center gap-2 mb-4">
          {searchTerm && (
            <span className="inline-flex items-center gap-1.5 badge bg-brand-100 text-brand-700 text-xs px-3 py-1">
              Search: {searchTerm}
              <button onClick={() => updateParam('search', '')}><X className="w-3 h-3" /></button>
            </span>
          )}
          {selectedCategory && (
            <span className="inline-flex items-center gap-1.5 badge bg-brand-100 text-brand-700 text-xs px-3 py-1">
              {categories.find(c => c.slug === selectedCategory)?.name || selectedCategory}
              <button onClick={() => updateParam('category', '')}><X className="w-3 h-3" /></button>
            </span>
          )}
          <button onClick={clearFilters} className="text-xs text-gray-500 hover:text-gray-700 underline">
            Clear all
          </button>
        </div>
      )}

      {/* Filters panel */}
      {filtersOpen && (
        <div className="card p-4 mb-6">
          <h3 className="font-semibold text-sm text-gray-900 mb-3">Category</h3>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => updateParam('category', '')}
              className={`badge px-3 py-1 text-xs font-medium cursor-pointer transition-colors ${
                !selectedCategory ? 'bg-brand-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All
            </button>
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => updateParam('category', cat.slug)}
                className={`badge px-3 py-1 text-xs font-medium cursor-pointer transition-colors ${
                  selectedCategory === cat.slug ? 'bg-brand-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Products grid */}
      {loading ? (
        <div className="flex justify-center py-24">
          <LoadingSpinner size="lg" />
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-24 text-gray-500">
          <Leaf className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="font-medium">No products found.</p>
          <p className="text-sm mt-1">Try adjusting your search or filters.</p>
          <button onClick={clearFilters} className="btn-primary mt-4">Clear filters</button>
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

export default Products
