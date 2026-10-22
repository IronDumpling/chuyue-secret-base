'use client'

import { useEffect } from 'react'
import { scrollToSection } from '@/lib/smooth-scroll'

export default function ScrollHandler() {
  useEffect(() => {
    // Handle hash navigation on page load
    const hash = window.location.hash
    if (hash) {
      setTimeout(() => scrollToSection(hash), 100)
    }
  }, [])

  return null
}

