interface RatingProps {
  score: number
  maxScore?: number
}

export default function Rating({ score, maxScore = 10 }: RatingProps) {
  // Map 0-10 score to 0-5 stars
  const stars = (score / maxScore) * 5

  const StarIcon = ({ className }: { className: string }) => (
    <svg
      className={`w-5 h-5 ${className}`}
      fill="currentColor"
      viewBox="0 0 20 20"
    >
      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
    </svg>
  )

  return (
    <div className="flex items-center gap-1" title={`${score}/${maxScore}`}>
      {Array.from({ length: 5 }).map((_, index) => {
        // Calculate the fill ratio of the current star (between 0 and 1)
        // For example, 3.5 stars: index 0,1,2 is 1(full), index 3 is 0.5(half), index 4 is 0(empty)
        const fillPercentage = Math.min(Math.max(stars - index, 0), 1) * 100

        return (
          <div key={index} className="relative">
            <StarIcon className="text-gray-300 dark:text-gray-600" />
            
            {/* Top layer: render yellow full star, control the display ratio by width */}
            <div 
              className="absolute top-0 left-0 overflow-hidden"
              style={{ width: `${fillPercentage}%` }}
            >
              <StarIcon className="text-yellow-400" />
            </div>
          </div>
        )
      })}
    </div>
  )
}

