'use client'

import { useEffect, useState } from 'react'
import SafeImage from '@/components/shared/SafeImage'

interface RotatingImageProps {
  images?: string[]
  alt: string
  className?: string
  defaultSrc: string
  intervalMs?: number
}

export default function RotatingImage({
  images,
  alt,
  className,
  defaultSrc,
  intervalMs = 4000,
}: RotatingImageProps) {
  const validImages = images && images.length > 0 ? images : [defaultSrc]
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isHovered, setIsHovered] = useState(false)

  useEffect(() => {
    setCurrentIndex(0)
  }, [JSON.stringify(validImages)])

  useEffect(() => {
    if (!validImages || validImages.length <= 1 || isHovered) return

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % validImages.length)
    }, intervalMs)

    return () => clearInterval(interval)
  }, [validImages, intervalMs, isHovered])

  return (
    <div
      className="relative w-full h-full overflow-hidden"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {validImages.map((src, index) => (
        <div
          key={`${src}-${index}`}
          className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
            index === currentIndex ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <SafeImage
            src={src}
            alt={alt}
            fill
            className={className}
            defaultSrc={defaultSrc}
          />
        </div>
      ))}
    </div>
  )
}

