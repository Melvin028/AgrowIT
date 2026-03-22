import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  serverTimestamp,
  increment,
} from 'firebase/firestore'
import { db } from './config'

export const validateDiscount = async (code, orderTotal) => {
  const snap = await getDoc(doc(db, 'discounts', code.toUpperCase()))

  if (!snap.exists()) {
    throw new Error('Invalid discount code.')
  }

  const discount = snap.data()

  if (!discount.active) {
    throw new Error('This discount code is no longer active.')
  }

  if (discount.expiresAt && discount.expiresAt.toDate() < new Date()) {
    throw new Error('This discount code has expired.')
  }

  if (discount.usageLimit && discount.usedCount >= discount.usageLimit) {
    throw new Error('This discount code has reached its usage limit.')
  }

  if (orderTotal < discount.minOrderAmount) {
    throw new Error(
      `Minimum order amount for this code is ₹${discount.minOrderAmount}.`
    )
  }

  const discountAmount =
    discount.type === 'percentage'
      ? (orderTotal * discount.value) / 100
      : discount.value

  return {
    code: snap.id,
    type: discount.type,
    value: discount.value,
    discountAmount: Math.min(discountAmount, orderTotal),
  }
}

export const applyDiscount = async (code) => {
  await updateDoc(doc(db, 'discounts', code.toUpperCase()), {
    usedCount: increment(1),
  })
}

export const getAllDiscounts = async () => {
  const snap = await getDocs(collection(db, 'discounts'))
  return snap.docs.map(d => ({ id: d.id, ...d.data() }))
}

export const createDiscount = async (data) => {
  const code = data.code.toUpperCase()
  await setDoc(doc(db, 'discounts', code), {
    ...data,
    code,
    usedCount: 0,
    active: true,
    createdAt: serverTimestamp(),
  })
}

export const updateDiscount = async (code, data) => {
  await updateDoc(doc(db, 'discounts', code.toUpperCase()), data)
}

export const deleteDiscount = async (code) => {
  await deleteDoc(doc(db, 'discounts', code.toUpperCase()))
}
