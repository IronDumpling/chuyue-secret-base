'use client'

import { withBasePath } from '@/lib/utils'
import Link from 'next/link'

export default function PortfolioSection() {
  return (
    <section id="portfolio-section" className="section bg-gray-50 dark:bg-gray-800">
      <div className="container">
        <h2 className="section-title">Portfolio</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          {/* Left Side: Showcase */}
          <div className="relative h-[300px] md:h-[400px] w-full flex items-center justify-center pl-4 md:pl-0">
            {/* File 3 */}
            <div className="absolute w-3/4 aspect-video bg-gray-300 rounded-lg shadow-lg transform rotate-6 translate-x-8 translate-y-4 opacity-80 border border-gray-200 dark:border-gray-700 overflow-hidden">
              <img 
                src={withBasePath('/images/portfolio/computer-graphics/portfolioImg_graphics_1.gif')} 
                alt="Project Archive 3" 
                className="w-full h-full object-cover grayscale opacity-60"
                onError={(e) => {e.currentTarget.style.display='none'}} 
              />
            </div>

            {/* File 2 */}
            <div className="absolute w-3/4 aspect-video bg-gray-200 rounded-lg shadow-xl transform rotate-3 translate-x-4 translate-y-2 opacity-90 border border-gray-200 dark:border-gray-700 overflow-hidden z-10">
              <img 
                src={withBasePath('/images/portfolio/backtrack/portfolioImg_backtrack_2.png')} 
                alt="Project Archive 2" 
                className="w-full h-full object-cover grayscale opacity-80"
                onError={(e) => {e.currentTarget.style.display='none'}}
              />
            </div>

            {/* File 1 */}
            <div className="absolute w-3/4 aspect-video bg-white dark:bg-gray-700 rounded-lg shadow-2xl transform -rotate-2 hover:rotate-0 hover:scale-105 transition-all duration-300 cursor-pointer border border-gray-100 dark:border-gray-600 overflow-hidden z-20 group">
              <img 
                src={withBasePath('/images/portfolio/resonance/resonance-3.png')} 
                alt="Main Project Showcase" 
                className="w-full h-full object-cover"
                onError={(e) => {e.currentTarget.style.display='none'}}
              />
            </div>
          </div>

          {/* Right Side: Text and Link */}
          <div>
            <h3 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
              Selected Works
            </h3>
            <p className="text-lg text-gray-700 dark:text-gray-300 mb-6 leading-relaxed">
              Explore a collection of my past projects, ranging from system architecture to game development. Each "file" represents a challenge solved and a story told.
            </p>
            
            <Link 
              href={withBasePath('/portfolio')} 
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