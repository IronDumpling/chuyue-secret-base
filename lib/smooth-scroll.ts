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

const easeInOutCubic = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2)

// Glide the window to `top` over a duration that grows with the distance. The browser's own
// smooth scroll finishes a short hop (a paragraph or two) so fast it reads as a jump; this keeps
// even short moves visibly gliding. Returns a function that stops the glide where it is.
export function glideTo(top: number): () => void {
  const from = window.scrollY
  const max = document.documentElement.scrollHeight - window.innerHeight
  const distance = Math.max(0, Math.min(max, top)) - from
  if (Math.abs(distance) < 1) return () => {}
  const duration = Math.min(900, Math.max(450, 300 + Math.abs(distance) * 0.4))
  const start = performance.now()
  let frame = requestAnimationFrame(function step(now) {
    const t = Math.min(1, (now - start) / duration)
    // 'instant', not 'auto': `auto` would follow the global `scroll-behavior: smooth`.
    window.scrollTo({ top: from + distance * easeInOutCubic(t), behavior: 'instant' })
    frame = t < 1 ? requestAnimationFrame(step) : 0
  })
  return () => cancelAnimationFrame(frame)
}

