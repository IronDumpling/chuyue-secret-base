'use client'

import { useRef, useState } from 'react'
import { useIsomorphicLayoutEffect } from '@/lib/useIsomorphicLayoutEffect'
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
  // 'no' until the picture has loaded, so it can fade in over its placeholder instead of popping;
  // 'cached' when it was already there (no fade needed).
  const [loaded, setLoaded] = useState<'no' | 'fade' | 'cached'>('no')
  const imgRef = useRef<HTMLImageElement>(null)

  // New source: start over in this same render, so the old picture is never shown under the new one.
  const [prevSrc, setPrevSrc] = useState(srcWithBasePath)
  if (prevSrc !== srcWithBasePath) {
    setPrevSrc(srcWithBasePath)
    setImgSrc(srcWithBasePath)
    setHasError(false)
    setLoaded('no')
  }

  const handleError = () => {
    if (!hasError && imgSrc !== defaultSrcWithBasePath) {
      setHasError(true)
      setImgSrc(defaultSrcWithBasePath)
      setLoaded('no')
    }
  }

  // The server-rendered <img> may have loaded, or failed, before React attached its handlers;
  // look at it once hydrated so neither case is missed.
  useIsomorphicLayoutEffect(() => {
    const el = imgRef.current
    if (!el || !el.complete) return
    if (el.naturalWidth > 0) setLoaded('cached')
    else handleError()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [imgSrc])

  const style = fill
    ? { width: '100%', height: '100%', objectFit }
    : width && height
    ? { width: `${width}px`, height: `${height}px` }
    : undefined

  return (
    <img
      ref={imgRef}
      src={imgSrc}
      alt={alt}
      className={`${className ?? ''} ${
        loaded === 'no' ? 'opacity-0' : loaded === 'fade' ? 'opacity-100 motion-safe:animate-fade-in' : 'opacity-100'
      }`}
      style={style}
      onLoad={() => setLoaded(value => (value === 'no' ? 'fade' : value))}
      onError={handleError}
      loading={priority ? 'eager' : 'lazy'}
    />
  )
}
