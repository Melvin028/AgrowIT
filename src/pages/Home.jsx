import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Shield, Truck, Leaf, Star } from 'lucide-react'
import { getProducts, getCategories } from '../firebase/products'
import ProductCard from '../components/product/ProductCard'
import LoadingSpinner from '../components/common/LoadingSpinner'

const Home = () => {
  const [featuredProducts, setFeaturedProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      const [products, cats] = await Promise.all([
        getProducts({ featured: true, limit: 8 }),
        getCategories(),
      ])
      setFeaturedProducts(products)
      setCategories(cats)
      setLoading(false)
    }
    load()
  }, [])

  return (
    <div>
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-brand-700 via-brand-600 to-brand-500 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-64 h-64 rounded-full bg-white blur-3xl" />
          <div className="absolute bottom-10 right-10 w-96 h-96 rounded-full bg-white blur-3xl" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-1.5 text-sm font-medium mb-6">
              <Leaf className="w-4 h-4" />
              Farm-fresh spices, delivered
            </div>
            <h1 className="text-4xl md:text-6xl font-bold leading-tight mb-6">
              The finest spices, <span className="text-amber-400">pure and natural</span>
            </h1>
            <p className="text-brand-100 text-lg md:text-xl leading-relaxed mb-8">
              Sourced directly from Kerala's lush spice farms. No additives, no preservatives — just pure, authentic flavors that elevate every dish.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link to="/products" className="inline-flex items-center gap-2 bg-white text-brand-700 font-semibold px-6 py-3 rounded-xl hover:bg-brand-50 transition-colors">
                Shop all spices <ArrowRight className="w-4 h-4" />
              </Link>
              <Link to="/products?featured=true" className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm text-white font-semibold px-6 py-3 rounded-xl hover:bg-white/30 transition-colors">
                View featured
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Trust badges */}
      <section className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center sm:text-left">
            {[
              { icon: Truck, title: 'Free delivery over ₹499', desc: 'Pan India shipping' },
              { icon: Shield, title: '100% authentic', desc: 'Farm-sourced, quality guaranteed' },
              { icon: Star, title: '10,000+ happy customers', desc: 'Rated 4.8 out of 5' },
            ].map((item) => (
              <div key={item.title} className="flex items-center gap-3 justify-center sm:justify-start">
                <div className="w-10 h-10 bg-brand-50 rounded-xl flex items-center justify-center shrink-0">
                  <item.icon className="w-5 h-5 text-brand-600" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900 text-sm">{item.title}</p>
                  <p className="text-gray-500 text-xs">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      {categories.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-gray-900">Browse by category</h2>
            <Link to="/products" className="text-sm font-medium text-brand-600 hover:text-brand-700 flex items-center gap-1">
              View all <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {categories.map(cat => (
              <Link
                key={cat.id}
                to={`/products?category=${cat.slug}`}
                className="group card overflow-hidden hover:shadow-md transition-shadow"
              >
                <div className="aspect-video bg-brand-50 overflow-hidden">
                  {cat.image ? (
                    <img src={cat.image} alt={cat.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Leaf className="w-10 h-10 text-brand-300" />
                    </div>
                  )}
                </div>
                <div className="p-3">
                  <p className="font-semibold text-sm text-gray-900">{cat.name}</p>
                  {cat.description && <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{cat.description}</p>}
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Featured products */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-gray-900">Featured spices</h2>
          <Link to="/products" className="text-sm font-medium text-brand-600 hover:text-brand-700 flex items-center gap-1">
            View all <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <LoadingSpinner size="lg" />
          </div>
        ) : featuredProducts.length === 0 ? (
          <div className="text-center py-16 text-gray-500">
            <Leaf className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="font-medium">No featured products yet.</p>
            <p className="text-sm mt-1">Check back soon or browse all products.</p>
            <Link to="/products" className="btn-primary inline-flex mt-4">Browse products</Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {featuredProducts.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>

      {/* CTA Banner */}
      <section className="bg-brand-50 border-t border-brand-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Your first order? Get 10% off</h2>
          <p className="text-gray-600 mb-6">Use code <span className="font-mono font-bold text-brand-700 bg-brand-100 px-2 py-0.5 rounded">WELCOME10</span> at checkout.</p>
          <Link to="/products" className="btn-primary inline-flex items-center gap-2">
            Start shopping <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </div>
  )
}

export default Home
