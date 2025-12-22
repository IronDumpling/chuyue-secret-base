// Utility function for smooth scrolling to anchor links
export function scrollToSection(href: string) {
  if (href.includes('#')) {
    const [path, hash] = href.split('#')
    const element = document.getElementById(hash)
    if (element) {
      const headerOffset = 80
      const elementPosition = element.getBoundingClientRect().top
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      })
    }
  }
}

