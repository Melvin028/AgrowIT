import { createContext, useContext, useState, useEffect } from 'react'
import { useAuth } from './AuthContext'
import { addToWishlist, removeFromWishlist, getUserWishlist } from '../firebase/users'

const WishlistContext = createContext(null)

export const WishlistProvider = ({ children }) => {
  const { user } = useAuth()
  const [wishlist, setWishlist] = useState([])

  useEffect(() => {
    if (user) {
      getUserWishlist(user.uid).then(setWishlist)
    } else {
      setWishlist([])
    }
  }, [user])

  const toggleWishlist = async (productId) => {
    if (!user) return false

    const isWishlisted = wishlist.includes(productId)

    if (isWishlisted) {
      await removeFromWishlist(user.uid, productId)
      setWishlist(prev => prev.filter(id => id !== productId))
    } else {
      await addToWishlist(user.uid, productId)
      setWishlist(prev => [...prev, productId])
    }

    return !isWishlisted
  }

  const isWishlisted = (productId) => wishlist.includes(productId)

  return (
    <WishlistContext.Provider value={{ wishlist, toggleWishlist, isWishlisted }}>
      {children}
    </WishlistContext.Provider>
  )
}

export const useWishlist = () => {
  const ctx = useContext(WishlistContext)
  if (!ctx) throw new Error('useWishlist must be used within WishlistProvider')
  return ctx
}
