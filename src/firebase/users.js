import {
  doc,
  updateDoc,
  arrayUnion,
  arrayRemove,
  getDoc,
  getDocs,
  collection,
  serverTimestamp,
} from 'firebase/firestore'
import { db } from './config'

export const updateUserProfile = async (uid, data) => {
  await updateDoc(doc(db, 'users', uid), {
    ...data,
    updatedAt: serverTimestamp(),
  })
}

export const addAddress = async (uid, address) => {
  await updateDoc(doc(db, 'users', uid), {
    addresses: arrayUnion({ ...address, id: Date.now().toString() }),
  })
}

export const removeAddress = async (uid, address) => {
  await updateDoc(doc(db, 'users', uid), {
    addresses: arrayRemove(address),
  })
}

export const addToWishlist = async (uid, productId) => {
  await updateDoc(doc(db, 'users', uid), {
    wishlist: arrayUnion(productId),
  })
}

export const removeFromWishlist = async (uid, productId) => {
  await updateDoc(doc(db, 'users', uid), {
    wishlist: arrayRemove(productId),
  })
}

export const getUserWishlist = async (uid) => {
  const snap = await getDoc(doc(db, 'users', uid))
  return snap.exists() ? snap.data().wishlist || [] : []
}

export const getAllUsers = async () => {
  const snap = await getDocs(collection(db, 'users'))
  return snap.docs.map(d => ({ id: d.id, ...d.data() }))
}
