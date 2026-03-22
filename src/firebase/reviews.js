import {
  collection,
  doc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  increment,
} from 'firebase/firestore'
import { db } from './config'

export const getProductReviews = async (productId) => {
  const q = query(
    collection(db, 'reviews'),
    where('productId', '==', productId),
    orderBy('createdAt', 'desc')
  )
  const snap = await getDocs(q)
  return snap.docs.map(d => ({ id: d.id, ...d.data() }))
}

export const hasUserReviewedProduct = async (userId, productId) => {
  const q = query(
    collection(db, 'reviews'),
    where('userId', '==', userId),
    where('productId', '==', productId)
  )
  const snap = await getDocs(q)
  return !snap.empty
}

export const hasUserPurchasedProduct = async (userId, productId) => {
  const q = query(
    collection(db, 'orders'),
    where('userId', '==', userId),
    where('status', 'in', ['confirmed', 'shipped', 'delivered'])
  )
  const snap = await getDocs(q)
  return snap.docs.some(d => {
    const order = d.data()
    return order.items?.some(item => item.productId === productId)
  })
}

export const addReview = async ({ productId, userId, userName, rating, text, verified }) => {
  const reviewRef = await addDoc(collection(db, 'reviews'), {
    productId,
    userId,
    userName,
    rating,
    text,
    verified,
    createdAt: serverTimestamp(),
  })

  const reviews = await getProductReviews(productId)
  const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length

  await updateDoc(doc(db, 'products', productId), {
    avgRating: parseFloat(avgRating.toFixed(1)),
    reviewCount: increment(1),
  })

  return reviewRef.id
}

export const deleteReview = async (reviewId, productId) => {
  await deleteDoc(doc(db, 'reviews', reviewId))

  const reviews = await getProductReviews(productId)
  const avgRating = reviews.length
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    : 0

  await updateDoc(doc(db, 'products', productId), {
    avgRating: parseFloat(avgRating.toFixed(1)),
    reviewCount: reviews.length,
  })
}
