import { Link } from 'react-router-dom'
import { Leaf, Mail, Phone, MapPin } from 'lucide-react'

const Footer = () => (
  <footer className="bg-brand-700 text-white mt-16">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Brand */}
        <div className="md:col-span-2">
          <Link to="/" className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
              <Leaf className="w-5 h-5 text-brand-700" />
            </div>
            <span className="text-xl font-bold">AgrowIT</span>
          </Link>
          <p className="text-brand-200 text-sm leading-relaxed max-w-xs">
            Premium quality spices sourced directly from farms, delivered fresh to your door. Taste the difference of authentic flavors.
          </p>
          <div className="mt-4 space-y-2">
            <div className="flex items-center gap-2 text-brand-200 text-sm">
              <Mail className="w-4 h-4" />
              <span>hello@agrowit.in</span>
            </div>
            <div className="flex items-center gap-2 text-brand-200 text-sm">
              <Phone className="w-4 h-4" />
              <span>+91 98765 43210</span>
            </div>
            <div className="flex items-center gap-2 text-brand-200 text-sm">
              <MapPin className="w-4 h-4" />
              <span>Kochi, Kerala, India</span>
            </div>
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <h4 className="font-semibold mb-4">Shop</h4>
          <ul className="space-y-2 text-brand-200 text-sm">
            <li><Link to="/products" className="hover:text-white transition-colors">All spices</Link></li>
            <li><Link to="/products?category=whole-spices" className="hover:text-white transition-colors">Whole spices</Link></li>
            <li><Link to="/products?category=ground-spices" className="hover:text-white transition-colors">Ground spices</Link></li>
            <li><Link to="/products?category=spice-blends" className="hover:text-white transition-colors">Spice blends</Link></li>
            <li><Link to="/products?featured=true" className="hover:text-white transition-colors">Featured</Link></li>
          </ul>
        </div>

        {/* Account */}
        <div>
          <h4 className="font-semibold mb-4">Account</h4>
          <ul className="space-y-2 text-brand-200 text-sm">
            <li><Link to="/login" className="hover:text-white transition-colors">Log in</Link></li>
            <li><Link to="/signup" className="hover:text-white transition-colors">Sign up</Link></li>
            <li><Link to="/orders" className="hover:text-white transition-colors">My orders</Link></li>
            <li><Link to="/wishlist" className="hover:text-white transition-colors">Wishlist</Link></li>
            <li><Link to="/account" className="hover:text-white transition-colors">Account settings</Link></li>
          </ul>
        </div>
      </div>

      <div className="mt-8 pt-8 border-t border-brand-600 flex flex-col sm:flex-row items-center justify-between gap-4 text-brand-300 text-sm">
        <p>© {new Date().getFullYear()} AgrowIT. All rights reserved.</p>
        <div className="flex items-center gap-4">
          <Link to="/privacy" className="hover:text-white transition-colors">Privacy policy</Link>
          <Link to="/terms" className="hover:text-white transition-colors">Terms of service</Link>
        </div>
      </div>
    </div>
  </footer>
)

export default Footer
