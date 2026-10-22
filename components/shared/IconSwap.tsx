import type { ReactNode } from 'react'

// Two icons stacked in one box; `showB` cross-fades between them with a small turn and scale, the
// way the contents button already swaps its dots for a cross. Size the box with `className`.
export default function IconSwap({
  a,
  b,
  showB,
  className = 'h-5 w-5',
}: {
  a: ReactNode
  b: ReactNode
  showB: boolean
  className?: string
}) {
  const layer =
    'absolute inset-0 flex items-center justify-center motion-safe:transition-[transform,opacity] motion-safe:duration-base motion-safe:ease-ios'
  return (
    <span className={`relative inline-block ${className}`}>
      <span aria-hidden={showB} className={`${layer} ${showB ? 'rotate-90 scale-50 opacity-0' : 'opacity-100'}`}>
        {a}
      </span>
      <span aria-hidden={!showB} className={`${layer} ${showB ? 'opacity-100' : '-rotate-90 scale-50 opacity-0'}`}>
        {b}
      </span>
    </span>
  )
}
