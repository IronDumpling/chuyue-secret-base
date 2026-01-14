'use client'

import { useState } from 'react'
import SafeImage from '@/components/shared/SafeImage'
import ImageLightbox from '@/components/shared/ImageLightbox'

interface MDXHeaderImageProps {
  images: string[]
  title: string
}

export default function MDXHeaderImage({ images, title }: MDXHeaderImageProps) {
  const [lightboxOpen, setLightboxOpen] = useState(false)

  if (!images || images.length === 0) {
    return null
  }

  const coverImage = images[0]
  const imageCount = images.length

  return (
    <>
      {/* Cover Image */}
      <div 
        className="relative w-full h-[300px] md:h-[450px] rounded-xl overflow-hidden cursor-pointer group mb-8"
        onClick={() => setLightboxOpen(true)}
      >
        <SafeImage
          src={coverImage}
          alt={title}
          fill
          // Priority loading for the cover image
          priority
          className="object-cover group-hover:scale-105 transition-transform duration-500"
        />

        {/* Overlay: Darken on hover, hint that it's clickable */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />

        {/* Bottom right button to view all photos */}
        {imageCount > 1 && (
          <div className="absolute bottom-4 right-4 bg-black/70 backdrop-blur-sm text-white px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-2 group-hover:bg-black/80 transition-colors">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span>View {imageCount} Photos</span>
          </div>
        )}
      </div>

      {/* Lightbox: Receive the entire images array, initialIndex is 0 by default */}
      <ImageLightbox
        images={images}
        initialIndex={0} 
        isOpen={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
        alt={title}
      />
    </>
  )
}

