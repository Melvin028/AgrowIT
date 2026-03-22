import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { ArrowLeft, Upload, X, Package } from 'lucide-react'
import {
  getProductById, createProduct, updateProduct,
  uploadProductImage, getCategories
} from '../../firebase/products'
import { slugify } from '../../utils/formatters'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import toast from 'react-hot-toast'

const AdminProductForm = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEdit = !!id

  const [loading, setLoading] = useState(isEdit)
  const [saving, setSaving] = useState(false)
  const [categories, setCategories] = useState([])
  const [existingImages, setExistingImages] = useState([])
  const [newImageFiles, setNewImageFiles] = useState([])
  const [newImagePreviews, setNewImagePreviews] = useState([])

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm({
    defaultValues: { featured: false, stock: 0 },
  })

  const productName = watch('name')

  useEffect(() => {
    getCategories().then(setCategories)
    if (isEdit) {
      getProductById(id).then(p => {
        if (!p) { navigate('/admin/products'); return }
        Object.entries(p).forEach(([key, val]) => setValue(key, val))
        setExistingImages(p.images || [])
        setLoading(false)
      })
    }
  }, [id, isEdit, navigate, setValue])

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files)
    setNewImageFiles(prev => [...prev, ...files])
    files.forEach(file => {
      const reader = new FileReader()
      reader.onload = (ev) => setNewImagePreviews(prev => [...prev, ev.target.result])
      reader.readAsDataURL(file)
    })
  }

  const removeExistingImage = (url) => {
    setExistingImages(prev => prev.filter(img => img !== url))
  }

  const removeNewImage = (index) => {
    setNewImageFiles(prev => prev.filter((_, i) => i !== index))
    setNewImagePreviews(prev => prev.filter((_, i) => i !== index))
  }

  const onSubmit = async (data) => {
    setSaving(true)
    try {
      const slug = slugify(data.name)
      const productId = isEdit ? id : `${slug}-${Date.now()}`

      const uploadedUrls = await Promise.all(
        newImageFiles.map(file => uploadProductImage(file, productId))
      )

      const allImages = [...existingImages, ...uploadedUrls]

      const productData = {
        ...data,
        slug,
        price: parseFloat(data.price),
        discountedPrice: data.discountedPrice ? parseFloat(data.discountedPrice) : null,
        stock: parseInt(data.stock),
        images: allImages,
        tags: typeof data.tags === 'string' ? data.tags.split(',').map(t => t.trim()).filter(Boolean) : data.tags || [],
        featured: data.featured === true || data.featured === 'true',
      }

      if (isEdit) {
        await updateProduct(id, productData)
        toast.success('Product updated.')
      } else {
        await createProduct(productData)
        toast.success('Product created.')
      }

      navigate('/admin/products')
    } catch (err) {
      console.error(err)
      toast.error('Something went wrong. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="max-w-3xl">
      <Link to="/admin/products" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 mb-6">
        <ArrowLeft className="w-4 h-4" /> Back to products
      </Link>

      <h1 className="text-2xl font-bold text-gray-900 mb-8">
        {isEdit ? 'Edit product' : 'Add product'}
      </h1>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="card p-6 space-y-5">
          <h2 className="font-semibold text-gray-900">Basic information</h2>

          <div>
            <label className="label">Product name</label>
            <input className="input" placeholder="Turmeric Powder" {...register('name', { required: 'Name is required' })} />
            {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>}
            {productName && (
              <p className="text-xs text-gray-400 mt-1">Slug: {slugify(productName)}</p>
            )}
          </div>

          <div>
            <label className="label">Description</label>
            <textarea
              className="input resize-none"
              rows={4}
              placeholder="Describe the product..."
              {...register('description', { required: 'Description is required' })}
            />
            {errors.description && <p className="text-xs text-red-500 mt-1">{errors.description.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Category</label>
              <select className="input" {...register('category', { required: 'Category is required' })}>
                <option value="">Select category</option>
                {categories.map(c => <option key={c.id} value={c.slug}>{c.name}</option>)}
                <option value="whole-spices">Whole spices</option>
                <option value="ground-spices">Ground spices</option>
                <option value="spice-blends">Spice blends</option>
                <option value="seeds">Seeds</option>
                <option value="herbs">Herbs</option>
              </select>
              {errors.category && <p className="text-xs text-red-500 mt-1">{errors.category.message}</p>}
            </div>
            <div>
              <label className="label">Unit / Size</label>
              <input className="input" placeholder="e.g. 100g, 250g pack" {...register('unit', { required: 'Unit is required' })} />
              {errors.unit && <p className="text-xs text-red-500 mt-1">{errors.unit.message}</p>}
            </div>
          </div>

          <div>
            <label className="label">Tags (comma-separated)</label>
            <input className="input" placeholder="organic, premium, kerala" {...register('tags')} />
          </div>
        </div>

        <div className="card p-6 space-y-5">
          <h2 className="font-semibold text-gray-900">Pricing & inventory</h2>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Price (₹)</label>
              <input
                type="number"
                step="0.01"
                className="input"
                placeholder="199.00"
                {...register('price', { required: 'Price is required', min: { value: 0, message: 'Price must be positive' } })}
              />
              {errors.price && <p className="text-xs text-red-500 mt-1">{errors.price.message}</p>}
            </div>
            <div>
              <label className="label">Discounted price (₹) <span className="text-gray-400 font-normal">optional</span></label>
              <input type="number" step="0.01" className="input" placeholder="149.00" {...register('discountedPrice')} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Stock quantity</label>
              <input
                type="number"
                className="input"
                placeholder="100"
                {...register('stock', { required: 'Stock is required', min: { value: 0, message: 'Stock must be 0 or more' } })}
              />
              {errors.stock && <p className="text-xs text-red-500 mt-1">{errors.stock.message}</p>}
            </div>
            <div className="flex items-center gap-3 pt-6">
              <input type="checkbox" id="featured" className="w-4 h-4 accent-brand-600" {...register('featured')} />
              <label htmlFor="featured" className="text-sm text-gray-700">Mark as featured</label>
            </div>
          </div>
        </div>

        <div className="card p-6 space-y-4">
          <h2 className="font-semibold text-gray-900">Product images</h2>

          {/* Existing images */}
          {existingImages.length > 0 && (
            <div className="flex flex-wrap gap-3">
              {existingImages.map((url, i) => (
                <div key={i} className="relative w-20 h-20 group">
                  <img src={url} alt="" className="w-full h-full object-cover rounded-lg border border-gray-200" />
                  <button
                    type="button"
                    onClick={() => removeExistingImage(url)}
                    className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* New image previews */}
          {newImagePreviews.length > 0 && (
            <div className="flex flex-wrap gap-3">
              {newImagePreviews.map((src, i) => (
                <div key={i} className="relative w-20 h-20 group">
                  <img src={src} alt="" className="w-full h-full object-cover rounded-lg border border-brand-200" />
                  <button
                    type="button"
                    onClick={() => removeNewImage(i)}
                    className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}

          <label className="flex flex-col items-center justify-center w-full h-28 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-brand-400 hover:bg-brand-50 transition-colors">
            <Upload className="w-6 h-6 text-gray-400 mb-1" />
            <span className="text-sm text-gray-500">Click to upload images</span>
            <span className="text-xs text-gray-400 mt-0.5">PNG, JPG up to 5MB each</span>
            <input type="file" className="hidden" multiple accept="image/*" onChange={handleImageChange} />
          </label>
        </div>

        <div className="flex items-center gap-3">
          <button type="submit" disabled={saving} className="btn-primary flex items-center gap-2">
            {saving ? <LoadingSpinner size="sm" /> : null}
            {isEdit ? 'Save changes' : 'Create product'}
          </button>
          <Link to="/admin/products" className="btn-ghost">Cancel</Link>
        </div>
      </form>
    </div>
  )
}

export default AdminProductForm
