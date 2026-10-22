'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import ThemeToggle from './ThemeToggle'
import LanguageSwitch from './LanguageSwitch'
import { scrollToSection } from '@/lib/smooth-scroll'
import { splitLocale } from '@/lib/i18n/paths'
import { useLocalePath, useT } from '@/components/shared/LocaleProvider'
import { useBreakpoint } from '@/lib/useBreakpoint'

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [activeSection, setActiveSection] = useState('home-section')
  const pathname = usePathname()
  const router = useRouter()
  const t = useT()
  const lp = useLocalePath()
  const wide = useBreakpoint('md')
  const headerRef = useRef<HTMLElement>(null)

  // Widening past the mobile layout hides the menu button; close the menu with it so it does not
  // stay open (and keep the header blurred) behind the desktop nav, ready to reappear on narrowing.
  useEffect(() => {
    if (wide) setIsMenuOpen(false)
  }, [wide])

  // Escape or a tap outside the header closes the open menu.
  useEffect(() => {
    if (!isMenuOpen) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setIsMenuOpen(false)
    const onPointer = (e: PointerEvent) => {
      if (!headerRef.current?.contains(e.target as Node)) setIsMenuOpen(false)
    }
    document.addEventListener('keydown', onKey)
    document.addEventListener('pointerdown', onPointer)
    return () => {
      document.removeEventListener('keydown', onKey)
      document.removeEventListener('pointerdown', onPointer)
    }
  }, [isMenuOpen])

  // Paths below are language-neutral ('/blog'); lp() adds /en or /zh.
  const navLinks = [
    { href: '/#home-section', label: t.nav.home },
    { href: '/#identity-card-section', label: t.nav.identity },
    { href: '/#experiences-section', label: t.nav.experiences },
    { href: '/portfolio', label: t.nav.portfolio },
    { href: '/blog', label: t.nav.blog },
    { href: '/contact', label: t.nav.contact },
  ]
  // The current page without its language prefix, so '/en/blog/x/' compares as '/blog/x/'.
  const currentPath = splitLocale(pathname).rest
  const onHome = currentPath === '/'

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 80)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Handle active link highlighting for anchor links
  useEffect(() => {
    if (!onHome) return

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
  }, [onHome])

  return (
    <header
      ref={headerRef}
      className={`fixed top-0 left-0 right-0 z-50 transition-[background-color,box-shadow,backdrop-filter] duration-slow ease-ios ${
        // As long as the menu is open (isMenuOpen) or the page has been scrolled (isScrolled),
        isMenuOpen || isScrolled
          ? 'bg-white/80 dark:bg-gray-900/80 backdrop-blur-md shadow-md'
          : 'bg-transparent'
      }`}
    >
      <nav className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          <Link href={lp('/')} className="text-2xl font-bold text-primary-600 dark:text-primary-400">
            {t.meta.siteName}
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navLinks.map((link) => {
              let isActive = false

              if (link.href.startsWith('/#')) {
                // Case A: This is an anchor link
                // Only highlight when we are on the Home page, and ScrollSpy tells us we are currently in this Section
                if (onHome) {
                  const sectionId = link.href.split('#')[1]
                  isActive = activeSection === sectionId
                }
              } else {
                // Case B: This is a normal page link
                // Use startsWith to match, so /portfolio/project-1 also highlights /portfolio
                // Also exclude '/' to prevent matching all paths
                isActive = currentPath.startsWith(`${link.href}/`)
              }
              
              const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
                if (link.href.includes('#')) {
                  e.preventDefault()
                  const [path, hash] = link.href.split('#')
                  const targetPath = lp(path || '/')
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
                  href={lp(link.href)}
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
            <div className="ml-4 flex items-center space-x-1">
              <LanguageSwitch />
              <ThemeToggle />
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center space-x-2 md:hidden">
            <LanguageSwitch />
            <ThemeToggle />
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors"
              aria-label={t.nav.toggleMenu}
              aria-expanded={isMenuOpen}
              aria-controls="mobile-nav"
            >
              {/* Three bars that fold into a cross: the outer two slide to the middle and turn, the middle one fades. */}
              <span className="relative block h-6 w-6">
                {[
                  isMenuOpen ? 'top-1/2 -translate-y-1/2 rotate-45' : 'top-[6px] rotate-0',
                  isMenuOpen ? 'top-1/2 -translate-y-1/2 scale-x-0 opacity-0' : 'top-[11px] opacity-100',
                  isMenuOpen ? 'top-1/2 -translate-y-1/2 -rotate-45' : 'top-[16px] rotate-0',
                ].map((pos, i) => (
                  <span
                    key={i}
                    className={`absolute left-[3px] h-0.5 w-[18px] rounded-full bg-current motion-safe:transition-all motion-safe:duration-base motion-safe:ease-ios ${pos}`}
                  />
                ))}
              </span>
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div
          id="mobile-nav"
          className={`grid md:hidden motion-safe:transition-[grid-template-rows,opacity,visibility] motion-safe:duration-slow motion-safe:ease-ios ${
            isMenuOpen ? 'grid-rows-[1fr] opacity-100 visible' : 'grid-rows-[0fr] opacity-0 invisible'
          }`}
        >
          <div className="overflow-hidden">
            <div className="flex flex-col space-y-2 py-4 border-t border-gray-200 dark:border-gray-800">
              {navLinks.map((link) => {
                let isActive = false
                if (link.href.startsWith('/#')) {
                  if (onHome) {
                    const sectionId = link.href.split('#')[1]
                    isActive = activeSection === sectionId
                  }
                } else {
                  isActive = currentPath.startsWith(`${link.href}/`)
                }
                
                const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
                  setIsMenuOpen(false)
                  if (link.href.includes('#')) {
                    e.preventDefault()
                    const [path, hash] = link.href.split('#')
                    const targetPath = lp(path || '/')
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
                    href={lp(link.href)}
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
        </div>
      </nav>
    </header>
  )
}

