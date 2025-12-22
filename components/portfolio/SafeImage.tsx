'use client'

import { useState } from 'react'

interface SafeImageProps {
  src: string
  alt: string
  fill?: boolean
  width?: number
  height?: number
  className?: string
  defaultSrc?: string
}

export default function SafeImage({
  src,
  alt,
  fill,
  width,
  height,
  className,
  defaultSrc = '/images/placeholder/portofolio-default.jpg',
}: SafeImageProps) {
  const [imgSrc, setImgSrc] = useState(src)
  const [hasError, setHasError] = useState(false)

  const handleError = () => {
    if (!hasError && imgSrc !== defaultSrc) {
      setHasError(true)
      setImgSrc(defaultSrc)
    }
  }

  const style = fill
    ? { width: '100%', height: '100%', objectFit: 'cover' as const }
    : width && height
    ? { width: `${width}px`, height: `${height}px` }
    : undefined

  return (
    <img
      src={imgSrc}
      alt={alt}
      className={className}
      style={style}
      onError={handleError}
      loading="lazy"
    />
  )
}

