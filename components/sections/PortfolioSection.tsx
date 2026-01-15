'use client'

import { useState } from 'react'
import { withBasePath } from '@/lib/utils'
import Link from 'next/link'

const PORTFOLIO_ITEMS = [
  { id: 1, src: '/images/portfolio/resonance/resonance-3.png', alt: 'Project Resonance' },
  { id: 2, src: '/images/portfolio/backtrack/portfolioImg_backtrack_2.png', alt: 'Project Backtrack' },
  { id: 3, src: '/images/portfolio/computer-graphics/portfolioImg_graphics_1.gif', alt: 'Computer Graphics' },
  { id: 4, src: '/images/portfolio/candle-lighter/candle-4.png', alt: 'Candle Lighter' },
  { id: 5, src: '/images/portfolio/distributed-storage-service/distributed-storage.png', alt: 'Distributed Storage' },
  { id: 6, src: '/images/portfolio/frametime/frametime-1.png', alt: 'Frame Time' },
  { id: 7, src: '/images/portfolio/easy-go-map/portfolioImg_map.jpeg', alt: 'Easy Go Map' },
  { id: 8, src: '/images/portfolio/signal-android/portfolioImg_signal-android-1.png', alt: 'Signal Android' },
]

export default function PortfolioSection() {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)

  // Triangle Effect
  const getTranslateY = (index: number) => {
    if (hoveredIndex === null) return '0px'

    const distance = Math.abs(hoveredIndex - index)
    
    // Define the height logic
    switch (distance) {
      case 0: return '-40px' // The element being hovered rises the highest
      case 1: return '-24px' // The adjacent element
      case 2: return '-12px' // The element two away
      default: return '0px'  // Other elements stay in place
    }
  }

  return (
    <section id="portfolio-section" className="section bg-gray-50 dark:bg-gray-800 overflow-hidden">
      <div className="container">
        <h2 className="section-title">Portfolio</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          
          {/* Left Side: Interactive File System (The Wave/Triangle Effect) */}
          {/* h-[400px] Leave enough top space for the rising animation, items-end ensures bottom alignment */}
          <div className="relative h-[300px] md:h-[400px] w-full flex items-end justify-center pb-8 gap-1 md:gap-2">
            
            {PORTFOLIO_ITEMS.map((item, index) => (
              <div
                key={item.id}
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
                style={{ 
                  transform: `translateY(${getTranslateY(index)})`,
                  zIndex: hoveredIndex === index ? 50 : 10 // The element being hovered has the highest layer
                }}
                className="relative w-12 md:w-16 h-48 md:h-64 bg-white dark:bg-gray-700 rounded-t-lg shadow-lg border-t border-x border-gray-200 dark:border-gray-600 transition-all duration-300 ease-out cursor-pointer group flex-shrink-0"
              >
                {/* Simulate the top label bar of the file bag/glass sheet */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-blue-500/50" />
                
                {/* Image container */}
                <div className="w-full h-full overflow-hidden rounded-t-lg pt-2 px-1">
                  <img
                    src={withBasePath(item.src)}
                    alt={item.alt}
                    className="w-full h-full object-cover rounded-t-md opacity-80 group-hover:opacity-100 transition-opacity"
                    onError={(e) => {e.currentTarget.style.display='none'}}
                  />
                </div>
              </div>
            ))}

            {/* A line at the bottom, simulating the "desktop" or "track" */}
            <div className="absolute bottom-8 left-0 right-0 h-[1px] bg-gray-300 dark:bg-gray-600 -z-10" />
          </div>

          {/* Right Side: Text and Link */}
          <div>
            <h3 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
              Selected Works
            </h3>
            <p className="text-lg text-gray-700 dark:text-gray-300 mb-6 leading-relaxed">
              Explore a collection of my past projects, ranging from system architecture to game development.
            </p>
            
            <Link 
              href="/portfolio" 
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors duration-200 shadow-md hover:shadow-lg"
            >
              View Full Portfolio
              <svg className="w-4 h-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}