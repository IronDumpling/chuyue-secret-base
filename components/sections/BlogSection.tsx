'use client'

import Link from 'next/link'

export default function BlogSection() {
  return (
    <section id="blog-section" className="section bg-white dark:bg-gray-900 overflow-hidden">
      <div className="container">
        <h2 className="section-title">Blogs</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          
          {/* Left Side: Floating Icons Spiral */}
          <div className="relative h-[300px] md:h-[400px] w-full flex items-center justify-center">
            {/* Background decorative circle */}
            <div className="absolute w-64 h-64 bg-blue-100 dark:bg-blue-900/20 rounded-full blur-3xl opacity-50 animate-pulse" />

            {/* 1. Book Icon (Bottom Left) */}
            <div 
              className="absolute left-[10%] bottom-[15%] text-gray-400 dark:text-gray-600 transform -rotate-12 z-10"
              style={{ animation: 'float 6s ease-in-out infinite' }}
            >
              <svg className="w-16 h-16 md:w-20 md:h-20 drop-shadow-lg" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
              </svg>
            </div>

            {/* 2. Gamepad Icon (Center - The Core) */}
            <div 
              className="absolute left-[40%] top-[40%] -translate-x-1/2 -translate-y-1/2 text-gray-800 dark:text-gray-200 transform rotate-6 z-20"
              style={{ animation: 'float 7s ease-in-out infinite 1s' }}
            >
              <svg className="w-24 h-24 md:w-32 md:h-32 drop-shadow-2xl" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                 <rect x="2" y="6" width="20" height="12" rx="2" ry="2" />
                 <path strokeLinecap="round" strokeLinejoin="round" d="M6 12h4m-2-2v4m7-1h.01m2.99-2h.01" />
              </svg>
            </div>

            {/* 3. Music Icon (Right Middle) */}
            <div 
              className="absolute right-[15%] top-[35%] text-gray-500 dark:text-gray-400 transform rotate-12 z-10"
              style={{ animation: 'float 5s ease-in-out infinite 0.5s' }}
            >
              <svg className="w-14 h-14 md:w-18 md:h-18 drop-shadow-lg" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 9l10.5-3m0 6.553v3.75a2.25 2.25 0 01-1.632 2.163l-1.32.377a1.803 1.803 0 11-.99-3.467l2.31-.66a2.25 2.25 0 001.632-2.163zm0 0V2.25L9 5.25v10.303m0 0v3.75a2.25 2.25 0 01-1.632 2.163l-1.32.377a1.803 1.803 0 11-.99-3.467l2.31-.66a2.25 2.25 0 001.632-2.163z" />
              </svg>
            </div>

            {/* 4. Movie Icon (Top Left) */}
            <div 
              className="absolute left-[20%] top-[10%] text-gray-600 dark:text-gray-500 transform -rotate-6 z-0"
              style={{ animation: 'float 8s ease-in-out infinite 2s' }}
            >
              <svg className="w-12 h-12 md:w-16 md:h-16 drop-shadow-md" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                <rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18" />
                <line x1="7" y1="2" x2="7" y2="22" />
                <line x1="17" y1="2" x2="17" y2="22" />
                <line x1="2" y1="12" x2="22" y2="12" />
                <line x1="2" y1="7" x2="7" y2="7" />
                <line x1="2" y1="17" x2="7" y2="17" />
                <line x1="17" y1="17" x2="22" y2="17" />
                <line x1="17" y1="7" x2="22" y2="7" />
              </svg>
            </div>

            <style jsx>{`
              @keyframes float {
                0%, 100% { transform: translateY(0px) rotate(var(--tw-rotate)); }
                50% { transform: translateY(-10px) rotate(var(--tw-rotate) + 2deg); }
              }
            `}</style>
          </div>

          {/* Right Side: Text and Link */}
          <div className="text-center md:text-left">
            <h3 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
              Thoughts & Reviews
            </h3>
            <p className="text-lg text-gray-700 dark:text-gray-300 mb-6 leading-relaxed">
              Dive into my personal space where I share reviews and thoughts on the things I love: <span className="font-semibold text-primary-600 dark:text-primary-400">Movies, Video Games, Music, and Books.</span>
            </p>
            
            <Link 
              href="/blog" 
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors duration-200 shadow-md hover:shadow-lg"
            >
              Read the Blog
              <svg className="w-4 h-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </Link>
          </div>
          
        </div>
      </div>
    </section>
  )
}
