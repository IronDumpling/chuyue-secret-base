'use client'

import { useState } from 'react'
import SafeImage from '@/components/shared/SafeImage'
import ImageLightbox from '@/components/shared/ImageLightbox'

// Props for the MDXContentImage component
interface MDXContentImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src?: string
  alt?: string
}

export default function MDXContentImage({ src, alt, ...props }: MDXContentImageProps) {
  const [isOpen, setIsOpen] = useState(false)

  if (!src) return null

  return (
    <>
      <span 
        className="block my-8 relative h-[400px] w-full cursor-zoom-in rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800"
        onClick={() => setIsOpen(true)}
      >
        <SafeImage
          src={src}
          alt={alt || 'Blog Image'}
          fill
          className="object-contain"
        />
      </span>

      {/* Caption */}
      {alt && (
        <span className="block text-center text-sm text-gray-500 mt-2 mb-8 italic">
          {alt}
        </span>
      )}

      {/* Lightbox */}
      <ImageLightbox
        images={[src]}
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        initialIndex={0}
        alt={alt}
      />
    </>
  )
}