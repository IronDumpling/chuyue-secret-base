'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import ThemeToggle from './ThemeToggle'
import { scrollToSection } from '@/lib/smooth-scroll'

const navLinks = [
  { href: '/#home-section', label: 'Home' },
  { href: '/#identity-card-section', label: 'Identity' },
  { href: '/#experiences-section', label: 'Experiences' },
  { href: '/portfolio', label: 'Portfolio' },
  { href: '/blog', label: 'Blog' },
  { href: '/contact', label: 'Contact Me' },
]

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [activeSection, setActiveSection] = useState('home-section')
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 80)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Handle active link highlighting for anchor links
  useEffect(() => {
    if (pathname !== '/') return

    const handleScrollSpy = () => {
      // Get the target ID of all anchor links
      const sections = navLinks
        .filter(link => link.href.startsWith('/#'))
        .map(link => link.href.split('#')[1])

      // Find the Section that is the closest to the top of the viewport
      for (const sectionId of sections) {
        const element = document.getElementById(sectionId)
        if (element) {
          const rect = element.getBoundingClientRect()
          // Logic: If a Section's top is close to the top of the viewport, or in the middle of the viewport, it is considered active
          // 100px is an offset, adapted to the height of the Header
          if (rect.top >= -300 && rect.top <= 300) {
            setActiveSection(sectionId)
            break 
          }
        }
      }
    }

    // Initialize and run once
    handleScrollSpy()
    
    window.addEventListener('scroll', handleScrollSpy)
    return () => window.removeEventListener('scroll', handleScrollSpy)
  }, [pathname])

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        // As long as the menu is open (isMenuOpen) or the page has been scrolled (isScrolled),
        isMenuOpen || isScrolled
          ? 'bg-white/80 dark:bg-gray-900/80 backdrop-blur-md shadow-md'
          : 'bg-transparent'
      }`}
    >
      <nav className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          <Link href="/" className="text-2xl font-bold text-primary-600 dark:text-primary-400">
            Chuyue
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navLinks.map((link) => {
              let isActive = false

              if (link.href.startsWith('/#')) {
                // Case A: This is an anchor link
                // Only highlight when we are on the Home page, and ScrollSpy tells us we are currently in this Section
                if (pathname === '/') {
                  const sectionId = link.href.split('#')[1]
                  isActive = activeSection === sectionId
                }
              } else {
                // Case B: This is a normal page link
                // Use startsWith to match, so /portfolio/project-1 also highlights /portfolio
                // Also exclude '/' to prevent matching all paths
                isActive = pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href))
              }
              
              const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
                if (link.href.includes('#')) {
                  e.preventDefault()
                  const [path, hash] = link.href.split('#')
                  const targetPath = path || '/'
                  if (pathname !== targetPath) {
                    router.push(targetPath)
                    // Wait for navigation then scroll
                    setTimeout(() => {
                      scrollToSection(link.href)
                    }, 100)
                  } else {
                    scrollToSection(link.href)
                  }
                }
              }

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={handleClick}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/20'
                      : 'text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                >
                  {link.label}
                </Link>
              )
            })}
            <div className="ml-4">
              <ThemeToggle />
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center space-x-2 md:hidden">
            <ThemeToggle />
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors"
              aria-label="Toggle menu"
            >
              {isMenuOpen ? (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200 dark:border-gray-800">
            <div className="flex flex-col space-y-2">
              {navLinks.map((link) => {
                let isActive = false
                if (link.href.startsWith('/#')) {
                  if (pathname === '/') {
                    const sectionId = link.href.split('#')[1]
                    isActive = activeSection === sectionId
                  }
                } else {
                  isActive = pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href))
                }
                
                const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
                  setIsMenuOpen(false)
                  if (link.href.includes('#')) {
                    e.preventDefault()
                    const [path, hash] = link.href.split('#')
                    const targetPath = path || '/'
                    if (pathname !== targetPath) {
                      router.push(targetPath)
                      setTimeout(() => {
                        scrollToSection(link.href)
                      }, 100)
                    } else {
                      scrollToSection(link.href)
                    }
                  }
                }

                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={handleClick}
                    className={`px-4 py-2 rounded-lg text-base font-medium transition-colors ${
                      isActive
                        ? 'text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/20'
                        : 'text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                    }`}
                  >
                    {link.label}
                  </Link>
                )
              })}
            </div>
          </div>
        )}
      </nav>
    </header>
  )
}

