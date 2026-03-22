import { Star } from 'lucide-react'

const StarRating = ({ rating, size = 'sm', showCount = false, count = 0, interactive = false, onChange }) => {
  const sizes = { sm: 'w-3.5 h-3.5', md: 'w-4 h-4', lg: 'w-5 h-5' }

  return (
    <div className="flex items-center gap-1">
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type={interactive ? 'button' : undefined}
            onClick={interactive ? () => onChange?.(star) : undefined}
            className={interactive ? 'cursor-pointer' : 'cursor-default'}
            disabled={!interactive}
          >
            <Star
              className={`${sizes[size]} ${
                star <= Math.round(rating)
                  ? 'fill-amber-400 text-amber-400'
                  : 'fill-gray-200 text-gray-200'
              } ${interactive ? 'hover:fill-amber-400 hover:text-amber-400 transition-colors' : ''}`}
            />
          </button>
        ))}
      </div>
      {showCount && (
        <span className="text-xs text-gray-500">
          {rating > 0 ? rating.toFixed(1) : '0'} ({count})
        </span>
      )}
    </div>
  )
}

export default StarRating
