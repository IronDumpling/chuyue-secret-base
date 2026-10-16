'use client'

import { useEffect, useMemo, useRef, useState, type RefObject } from 'react'
import { ancestorIds, defaultExpanded, type TocNode } from '@/lib/toc'
import type { Dictionary } from '@/lib/i18n/dictionaries/en'
import { useSlidingIndicator } from '@/components/shared/filter/useSlidingIndicator'

interface TocTreeProps {
  tree: TocNode[]
  activeId: string | null
  onNavigate: (id: string) => void
  labels: Dictionary['toc']
  // Compact rows for pointer devices; false gives touch-sized rows (drawer on phones).
  dense?: boolean
  // The element this list scrolls inside; the current entry is kept visible in it.
  scrollRef?: RefObject<HTMLElement>
}

// Same vocabulary as SidebarFilter: one highlight block slides to the current entry.
const active = 'font-medium text-primary-600 dark:text-primary-400'
const onPath = 'text-gray-900 dark:text-gray-100'
const idle = 'text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400'
const highlight =
  'pointer-events-none absolute inset-x-0 top-0 rounded-lg bg-primary-50 dark:bg-primary-900/20'

export default function TocTree({ tree, activeId, onNavigate, labels, dense = true, scrollRef }: TocTreeProps) {
  const [expanded, setExpanded] = useState(() => defaultExpanded(tree, activeId))
  // Nodes the reader folded or unfolded by hand; auto-expansion leaves those alone.
  const touched = useRef(new Set<string>())

  const path = useMemo(() => (activeId ? ancestorIds(tree, activeId) : []), [tree, activeId])

  // Reading into a folded branch opens it.
  useEffect(() => {
    const toOpen = path.filter(id => !expanded.has(id) && !touched.current.has(id))
    if (toOpen.length > 0) setExpanded(prev => new Set([...prev, ...toOpen]))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [path])

  // When the current entry is inside a folded branch, the highlight sits on the deepest
  // entry that is still visible.
  let visibleKey: string | null = null
  if (activeId) {
    const chain = [...path, activeId]
    visibleKey = chain[0]
    for (let i = 1; i < chain.length && expanded.has(chain[i - 1]); i++) visibleKey = chain[i]
  }

  const indicator = useSlidingIndicator<HTMLDivElement>(visibleKey, 'y')

  useEffect(() => {
    const scroller = scrollRef?.current
    const row = visibleKey && indicator.containerRef.current?.querySelector<HTMLElement>(`[data-key="${CSS.escape(visibleKey)}"]`)
    if (!scroller || !row) return
    const box = scroller.getBoundingClientRect()
    const rect = row.getBoundingClientRect()
    const margin = 24
    if (rect.top < box.top + margin) scroller.scrollTop -= box.top + margin - rect.top
    else if (rect.bottom > box.bottom - margin) scroller.scrollTop += rect.bottom - (box.bottom - margin)
  }, [visibleKey, scrollRef, indicator.containerRef])

  const toggle = (id: string) => {
    touched.current.add(id)
    setExpanded(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const renderList = (nodes: TocNode[], nested: boolean) => (
    // The guide line of a nested list runs under its parent's chevron.
    <ul className={nested ? `${dense ? 'ml-2.5' : 'ml-4'} border-l border-gray-200 dark:border-gray-800` : ''}>
      {nodes.map(node => {
        const hasChildren = node.children.length > 0
        const open = expanded.has(node.id)
        const tone = node.id === activeId ? active : path.includes(node.id) ? onPath : idle
        return (
          <li key={node.id}>
            <div data-key={node.id} className="flex items-start">
              {hasChildren ? (
                <button
                  type="button"
                  onClick={() => toggle(node.id)}
                  aria-expanded={open}
                  aria-label={labels.toggleSection}
                  className={`relative z-10 flex shrink-0 items-center justify-center rounded text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 ${
                    dense ? 'h-7 w-5' : 'h-11 w-8'
                  }`}
                >
                  <svg
                    className={`h-3 w-3 motion-safe:transition-transform motion-safe:duration-200 ${open ? 'rotate-90' : ''}`}
                    viewBox="0 0 12 12"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={1.75}
                    aria-hidden
                  >
                    <path d="M4.5 2.5 8 6l-3.5 3.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              ) : (
                <span aria-hidden className={`shrink-0 ${dense ? 'w-5' : 'w-8'}`} />
              )}
              <a
                href={`#${node.id}`}
                title={node.text}
                aria-current={node.id === activeId ? 'location' : undefined}
                onClick={event => {
                  event.preventDefault()
                  onNavigate(node.id)
                }}
                className={`relative z-10 min-w-0 flex-1 rounded-lg pr-2 transition-colors duration-200 ${tone} ${
                  node.level === 1 ? 'text-sm' : 'text-[13px]'
                } ${dense ? 'py-1 leading-5' : 'flex min-h-11 items-center py-2 leading-5'}`}
              >
                <span className="line-clamp-2">{node.text}</span>
              </a>
            </div>
            {hasChildren && open && renderList(node.children, true)}
          </li>
        )
      })}
    </ul>
  )

  return (
    <div ref={indicator.containerRef} className="relative">
      <span
        aria-hidden
        style={indicator.style}
        className={`${highlight} ${
          indicator.animate ? 'motion-safe:transition-[transform,height] motion-safe:duration-300 motion-safe:ease-out' : ''
        }`}
      />
      {renderList(tree, false)}
    </div>
  )
}
