// Several layers (lightbox, share sheet, contents drawer) can lock page scroll at once. Each takes a
// lock and gives it back; the page only unlocks when the last one is released, and restores
// whatever `overflow` was there before the first lock.
let locks = 0
let saved: { overflow: string; gutter: string } | null = null

export function lockScroll(): () => void {
  if (typeof document === 'undefined') return () => {}
  const root = document.documentElement
  if (locks === 0) {
    saved = { overflow: document.body.style.overflow, gutter: root.style.scrollbarGutter }
    // Keep the scrollbar's space so content and the fixed header do not shift sideways.
    root.style.scrollbarGutter = 'stable'
    document.body.style.overflow = 'hidden'
  }
  locks += 1
  let released = false
  return () => {
    if (released) return
    released = true
    locks -= 1
    if (locks === 0 && saved) {
      document.body.style.overflow = saved.overflow
      root.style.scrollbarGutter = saved.gutter
      saved = null
    }
  }
}
