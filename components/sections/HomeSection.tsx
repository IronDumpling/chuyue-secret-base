import Link from 'next/link'
import { withBasePath } from '@/lib/utils'

export default function HomeSection() {
  return (
    <section id="home-section" className="min-h-screen flex items-center justify-center bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          {/* Profile Image */}
          <div className="flex justify-center md:justify-start order-2 md:order-1">
            <div className="w-64 h-64 rounded-full overflow-hidden shadow-2xl bg-gradient-to-br from-primary-400 to-primary-600">
              <img
                src={withBasePath('/images/home/profileImg2.jpeg')}
                alt="Chuyue Zhang"
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Content */}
          <div className="text-center md:text-left order-1 md:order-2">
            <h1 className="text-5xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-primary-600 to-primary-400 bg-clip-text text-transparent leading-relaxed pb-3">
              Hi, I am Chuyue
            </h1>
            <h3 className="text-2xl md:text-3xl font-semibold mb-4 text-gray-700 dark:text-gray-300">
              More than just one title
            </h3>
            <p className="text-lg text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto md:mx-0">
              I live as a{' '}
              <span className="identity-accent-text font-semibold">software engineer</span>, a{' '}
              <span className="identity-accent-text font-semibold">creator</span>, and an{' '}
              <span className="identity-accent-text font-semibold">adventurer</span>. Scroll down to
              see how these three identities connect through my work and life.
            </p>
            <Link
              href="/contact"
              className="button-primary inline-flex items-center gap-2"
            >
              Contact Me
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </Link>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="mt-16 flex justify-center">
          <a
            href="#about-section"
            className="flex flex-col items-center text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors animate-bounce"
          >
            <span className="text-sm mb-2">Scroll down</span>
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </a>
        </div>
      </div>
    </section>
  )
}

