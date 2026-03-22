import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
} from 'firebase/firestore'
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage'
import { db, storage } from './config'

export const getProducts = async (filters = {}) => {
  let q = collection(db, 'products')
  const constraints = []

  if (filters.category) {
    constraints.push(where('category', '==', filters.category))
  }
  if (filters.featured) {
    constraints.push(where('featured', '==', true))
  }

  constraints.push(orderBy('createdAt', 'desc'))

  if (filters.limit) {
    constraints.push(limit(filters.limit))
  }

  q = query(q, ...constraints)
  const snap = await getDocs(q)
  return snap.docs.map(d => ({ id: d.id, ...d.data() }))
}

export const getProductBySlug = async (slug) => {
  const q = query(collection(db, 'products'), where('slug', '==', slug))
  const snap = await getDocs(q)
  if (snap.empty) return null
  const d = snap.docs[0]
  return { id: d.id, ...d.data() }
}

export const getProductById = async (id) => {
  const snap = await getDoc(doc(db, 'products', id))
  return snap.exists() ? { id: snap.id, ...snap.data() } : null
}

export const getCategories = async () => {
  const snap = await getDocs(collection(db, 'categories'))
  return snap.docs.map(d => ({ id: d.id, ...d.data() }))
}

export const uploadProductImage = async (file, productId) => {
  const imageRef = ref(storage, `products/${productId}/${Date.now()}_${file.name}`)
  await uploadBytes(imageRef, file)
  return getDownloadURL(imageRef)
}

export const deleteProductImage = async (imageUrl) => {
  const imageRef = ref(storage, imageUrl)
  await deleteObject(imageRef)
}

export const createProduct = async (data) => {
  const docRef = await addDoc(collection(db, 'products'), {
    ...data,
    avgRating: 0,
    reviewCount: 0,
    createdAt: serverTimestamp(),
  })
  return docRef.id
}

export const updateProduct = async (id, data) => {
  await updateDoc(doc(db, 'products', id), {
    ...data,
    updatedAt: serverTimestamp(),
  })
}

export const deleteProduct = async (id) => {
  await deleteDoc(doc(db, 'products', id))
}

export const searchProducts = async (searchTerm) => {
  const snap = await getDocs(collection(db, 'products'))
  const term = searchTerm.toLowerCase()
  return snap.docs
    .map(d => ({ id: d.id, ...d.data() }))
    .filter(p =>
      p.name?.toLowerCase().includes(term) ||
      p.description?.toLowerCase().includes(term) ||
      p.tags?.some(t => t.toLowerCase().includes(term))
    )
}
