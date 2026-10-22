// The one scroll engine: TOC jumps, back-to-top, anchor links and read-aloud follow all glide the same way.
const HEADER_OFFSET = 80

const prefersReducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches

// Utility function for smooth scrolling to anchor links
export function scrollToSection(href: string) {
  if (href.includes('#')) {
    const [path, hash] = href.split('#')
    const element = document.getElementById(hash)
    if (element) {
      const elementPosition = element.getBoundingClientRect().top
      glideTo(elementPosition + window.pageYOffset - HEADER_OFFSET)
    }
  }
}

const easeOutCubic = (t: number) => 1 - (1 - t) ** 3

// Glide the window to `top` over a duration that grows with the distance. The browser's own
// smooth scroll finishes a short hop (a paragraph or two) so fast it reads as a jump; this keeps
// even short moves visibly gliding. Returns a function that stops the glide where it is.
export function glideTo(top: number, onDone?: () => void): () => void {
  const from = window.scrollY
  const max = document.documentElement.scrollHeight - window.innerHeight
  const target = Math.max(0, Math.min(max, top))
  const distance = target - from
  if (Math.abs(distance) < 1) {
    onDone?.()
    return () => {}
  }
  if (prefersReducedMotion()) {
    window.scrollTo({ top: target, behavior: 'instant' })
    onDone?.()
    return () => {}
  }
  const duration = Math.min(900, Math.max(450, 300 + Math.abs(distance) * 0.4))
  const start = performance.now()
  let frame = requestAnimationFrame(function step(now) {
    const t = Math.min(1, (now - start) / duration)
    // 'instant', not 'auto': say it outright rather than rely on any inherited scroll-behavior.
    window.scrollTo({ top: from + distance * easeOutCubic(t), behavior: 'instant' })
    if (t < 1) frame = requestAnimationFrame(step)
    else {
      frame = 0
      onDone?.()
    }
  })
  return () => cancelAnimationFrame(frame)
}
