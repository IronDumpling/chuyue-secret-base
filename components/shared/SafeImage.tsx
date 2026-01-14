'use client'

import { useState, useEffect } from 'react'
import { withBasePath } from '@/lib/utils'

interface SafeImageProps {
  src: string
  alt: string
  fill?: boolean
  width?: number
  height?: number
  className?: string
  defaultSrc?: string
  priority?: boolean
  objectFit?: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down'
}

export default function SafeImage({
  src,
  alt,
  fill,
  width,
  height,
  className,
  defaultSrc = '/images/placeholder/portofolio-default.jpg',
  priority = false,
  objectFit = 'cover',
}: SafeImageProps) {
  // Add base path to src and defaultSrc for GitHub Pages deployment
  const srcWithBasePath = withBasePath(src)
  const defaultSrcWithBasePath = withBasePath(defaultSrc)
  
  const [imgSrc, setImgSrc] = useState(srcWithBasePath)
  const [hasError, setHasError] = useState(false)

  // Update image source when src prop changes
  useEffect(() => {
    setImgSrc(srcWithBasePath)
    setHasError(false)
  }, [srcWithBasePath])

  const handleError = () => {
    if (!hasError && imgSrc !== defaultSrcWithBasePath) {
      setHasError(true)
      setImgSrc(defaultSrcWithBasePath)
    }
  }

  const style = fill
    ? { width: '100%', height: '100%', objectFit }
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
      loading={priority ? 'eager' : 'lazy'}
    />
  )
}

