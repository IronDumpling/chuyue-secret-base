'use client'

import { useEffect } from 'react'

export default function ScrollHandler() {
  useEffect(() => {
    // Handle hash navigation on page load
    const hash = window.location.hash
    if (hash) {
      const element = document.getElementById(hash.substring(1))
      if (element) {
        const headerOffset = 80
        const elementPosition = element.getBoundingClientRect().top
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset

        setTimeout(() => {
          window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth',
          })
        }, 100)
      }
    }
  }, [])

  return null
}

