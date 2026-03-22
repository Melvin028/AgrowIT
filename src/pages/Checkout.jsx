import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { Tag, CheckCircle, ShoppingCart } from 'lucide-react'
import { useCart } from '../contexts/CartContext'
import { useAuth } from '../contexts/AuthContext'
import { createOrder, updateOrderPayment } from '../firebase/orders'
import { validateDiscount, applyDiscount } from '../firebase/discounts'
import { formatCurrency } from '../utils/formatters'
import LoadingSpinner from '../components/common/LoadingSpinner'
import toast from 'react-hot-toast'

const Checkout = () => {
  const { items, total, clearCart } = useCart()
  const { user } = useAuth()
  const navigate = useNavigate()
  const { register, handleSubmit, formState: { errors } } = useForm()

  const [discountCode, setDiscountCode] = useState('')
  const [discountData, setDiscountData] = useState(null)
  const [validatingDiscount, setValidatingDiscount] = useState(false)
  const [paymentLoading, setPaymentLoading] = useState(false)

  if (items.length === 0) {
    navigate('/cart')
    return null
  }

  const discountAmount = discountData?.discountAmount ?? 0
  const finalTotal = Math.max(0, total - discountAmount)
  const shipping = finalTotal >= 499 ? 0 : 50

  const handleApplyDiscount = async () => {
    if (!discountCode.trim()) return
    setValidatingDiscount(true)
    try {
      const data = await validateDiscount(discountCode.trim(), total)
      setDiscountData(data)
      toast.success('Discount code applied.')
    } catch (err) {
      toast.error(err.message)
      setDiscountData(null)
    } finally {
      setValidatingDiscount(false)
    }
  }

  const loadRazorpayScript = () =>
    new Promise((resolve) => {
      const script = document.createElement('script')
      script.src = 'https://checkout.razorpay.com/v1/checkout.js'
      script.onload = () => resolve(true)
      script.onerror = () => resolve(false)
      document.body.appendChild(script)
    })

  const onSubmit = async (formData) => {
    setPaymentLoading(true)
    const scriptLoaded = await loadRazorpayScript()
    if (!scriptLoaded) {
      toast.error('Payment gateway failed to load. Please try again.')
      setPaymentLoading(false)
      return
    }

    const orderItems = items.map(item => ({
      productId: item.id,
      name: item.name,
      price: item.discountedPrice ?? item.price,
      quantity: item.quantity,
      image: item.images?.[0] ?? '',
    }))

    const grandTotal = finalTotal + shipping
    const orderId = await createOrder({
      userId: user.uid,
      items: orderItems,
      subtotal: total,
      discount: discountAmount,
      shipping,
      total: grandTotal,
      address: {
        name: formData.name,
        phone: formData.phone,
        line1: formData.line1,
        line2: formData.line2,
        city: formData.city,
        state: formData.state,
        pincode: formData.pincode,
      },
      discountCode: discountData?.code ?? null,
    })

    const options = {
      key: import.meta.env.VITE_RAZORPAY_KEY_ID,
      amount: Math.round(grandTotal * 100),
      currency: 'INR',
      name: 'AgrowIT',
      description: `Order #${orderId}`,
      order_id: undefined,
      prefill: {
        name: formData.name,
        email: user.email,
        contact: formData.phone,
      },
      theme: { color: '#2d6a4f' },
      handler: async (response) => {
        try {
          await updateOrderPayment(orderId, {
            paymentId: response.razorpay_payment_id,
            razorpayOrderId: response.razorpay_order_id,
          })
          if (discountData) await applyDiscount(discountData.code)
          clearCart()
          navigate(`/order-success/${orderId}`)
        } catch {
          toast.error('Payment recorded but order update failed. Contact support.')
        }
      },
      modal: {
        ondismiss: () => {
          setPaymentLoading(false)
          toast.error('Payment cancelled.')
        },
      },
    }

    const rzp = new window.Razorpay(options)
    rzp.open()
    setPaymentLoading(false)
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Checkout</h1>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Left: Address form */}
          <div className="lg:col-span-3 space-y-6">
            <div className="card p-6">
              <h2 className="font-bold text-gray-900 mb-5">Delivery address</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="label">Full name</label>
                  <input className="input" placeholder="John Doe" {...register('name', { required: 'Name is required' })} />
                  {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>}
                </div>
                <div className="sm:col-span-2">
                  <label className="label">Phone number</label>
                  <input className="input" placeholder="+91 98765 43210" {...register('phone', { required: 'Phone is required' })} />
                  {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone.message}</p>}
                </div>
                <div className="sm:col-span-2">
                  <label className="label">Address line 1</label>
                  <input className="input" placeholder="House/Flat no., Street" {...register('line1', { required: 'Address is required' })} />
                  {errors.line1 && <p className="text-xs text-red-500 mt-1">{errors.line1.message}</p>}
                </div>
                <div className="sm:col-span-2">
                  <label className="label">Address line 2 (optional)</label>
                  <input className="input" placeholder="Landmark, Area" {...register('line2')} />
                </div>
                <div>
                  <label className="label">City</label>
                  <input className="input" placeholder="Kochi" {...register('city', { required: 'City is required' })} />
                  {errors.city && <p className="text-xs text-red-500 mt-1">{errors.city.message}</p>}
                </div>
                <div>
                  <label className="label">State</label>
                  <input className="input" placeholder="Kerala" {...register('state', { required: 'State is required' })} />
                  {errors.state && <p className="text-xs text-red-500 mt-1">{errors.state.message}</p>}
                </div>
                <div>
                  <label className="label">Pincode</label>
                  <input className="input" placeholder="682001" {...register('pincode', { required: 'Pincode is required' })} />
                  {errors.pincode && <p className="text-xs text-red-500 mt-1">{errors.pincode.message}</p>}
                </div>
              </div>
            </div>
          </div>

          {/* Right: Order summary */}
          <div className="lg:col-span-2">
            <div className="card p-5 sticky top-24 space-y-5">
              <h2 className="font-bold text-gray-900">Order summary</h2>

              {/* Items */}
              <div className="space-y-3">
                {items.map(item => (
                  <div key={item.id} className="flex items-center gap-3 text-sm">
                    <div className="w-10 h-10 bg-gray-50 rounded-lg overflow-hidden shrink-0">
                      {item.images?.[0] && <img src={item.images[0]} alt={item.name} className="w-full h-full object-cover" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 line-clamp-1">{item.name}</p>
                      <p className="text-gray-500 text-xs">× {item.quantity}</p>
                    </div>
                    <span className="font-medium">{formatCurrency((item.discountedPrice ?? item.price) * item.quantity)}</span>
                  </div>
                ))}
              </div>

              {/* Discount code */}
              <div>
                <label className="label">Discount code</label>
                <div className="flex gap-2">
                  <input
                    value={discountCode}
                    onChange={(e) => setDiscountCode(e.target.value.toUpperCase())}
                    className="input flex-1 text-sm"
                    placeholder="WELCOME10"
                    disabled={!!discountData}
                  />
                  <button
                    type="button"
                    onClick={handleApplyDiscount}
                    disabled={!!discountData || validatingDiscount}
                    className="btn-secondary text-sm py-2 px-3 shrink-0"
                  >
                    {validatingDiscount ? <LoadingSpinner size="sm" /> : <Tag className="w-4 h-4" />}
                  </button>
                </div>
                {discountData && (
                  <div className="flex items-center gap-1.5 mt-1.5 text-xs text-brand-700">
                    <CheckCircle className="w-3.5 h-3.5" />
                    {discountData.type === 'percentage' ? `${discountData.value}% off applied` : `${formatCurrency(discountData.value)} off applied`}
                  </div>
                )}
              </div>

              {/* Totals */}
              <div className="border-t border-gray-100 pt-4 space-y-2 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>{formatCurrency(total)}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-brand-700">
                    <span>Discount</span>
                    <span>−{formatCurrency(discountAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-gray-600">
                  <span>Shipping</span>
                  <span>{shipping === 0 ? 'Free' : formatCurrency(shipping)}</span>
                </div>
                <div className="flex justify-between font-bold text-gray-900 text-base pt-2 border-t border-gray-100">
                  <span>Total</span>
                  <span>{formatCurrency(finalTotal + shipping)}</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={paymentLoading}
                className="btn-primary w-full flex items-center justify-center gap-2"
              >
                {paymentLoading ? <LoadingSpinner size="sm" /> : <ShoppingCart className="w-4 h-4" />}
                Pay {formatCurrency(finalTotal + shipping)}
              </button>

              <p className="text-[11px] text-gray-400 text-center">
                Secured by Razorpay. We accept UPI, cards, and net banking.
              </p>
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}

export default Checkout
