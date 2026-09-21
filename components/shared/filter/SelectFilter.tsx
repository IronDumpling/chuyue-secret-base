'use client'

import { useEffect, useId, useRef, useState } from 'react'
import { ALL, type FilterGroup, type Selection } from '@/lib/filter-model'
import type { FilterLabels } from './CategoryFilter'

interface SelectFilterProps {
  model: FilterGroup[]
  selection: Selection
  onChange: (selection: Selection) => void
  labels: FilterLabels
  className?: string
}

const pillBase = 'rounded-full px-3 py-1.5 text-sm transition-colors duration-200'
const activePill = 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400'
const idlePill = 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
const count = 'ml-1.5 text-xs tabular-nums opacity-60'

// The narrow-screen menu: the top bar of the portfolio folded into one line. A hairline row shows
// the current choice; opening it unfolds the same pills the top bar shows, in the page rather than
// over it. Both folds are a grid-rows 0fr -> 1fr, so they animate to the content's own height.
export default function SelectFilter({ model, selection, onChange, labels, className = '' }: SelectFilterProps) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const panelId = useId()

  useEffect(() => {
    if (!open) return
    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false)
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return
      setOpen(false)
      triggerRef.current?.focus()
    }
    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  const group = model.find(g => g.id === selection.group)
  const category = group?.categories.find(c => c.id === selection.category)
  const hasSecondRow = !!group && group.categories.length > 0

  // Keep the last group's pills on screen while the second row folds away.
  const lastGroup = useRef<FilterGroup | null>(null)
  if (hasSecondRow) lastGroup.current = group!
  const shown = hasSecondRow ? group! : lastGroup.current

  // Picking something final closes the menu; picking a group that has categories keeps it open
  // so the categories can be chosen.
  const choose = (next: Selection, final = true) => {
    onChange(next)
    if (final) setOpen(false)
  }

  // Closed panels stay out of the tab order.
  const tab = open ? 0 : -1
  const wholeGroup = !!group && selection.category === null

  return (
    <div ref={rootRef} className={`border-b border-gray-200 dark:border-gray-800 ${className}`}>
      <button
        ref={triggerRef}
        type="button"
        aria-label={labels.ariaLabel}
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen(value => !value)}
        className="flex w-full items-center gap-2 py-3 text-left text-sm font-medium text-primary-600 transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/40 dark:text-primary-400"
      >
        <span className="truncate">{category ? `${group!.label} / ${category.label}` : (group?.label ?? labels.all)}</span>
        {group && <span className="text-xs font-normal tabular-nums opacity-60">{category?.count ?? group.count}</span>}
        <svg
          aria-hidden
          className={`ml-auto h-4 w-4 shrink-0 text-gray-500 transition-transform duration-300 ease-out dark:text-gray-400 ${
            open ? 'rotate-180' : ''
          }`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      <div
        id={panelId}
        className={`grid motion-safe:transition-[grid-template-rows,opacity,visibility] motion-safe:duration-300 motion-safe:ease-out ${
          open ? 'visible grid-rows-[1fr] opacity-100' : 'invisible grid-rows-[0fr] opacity-0'
        }`}
      >
        <div className="overflow-hidden">
          <div className="flex flex-wrap gap-2 pb-4 pt-1">
            <button
              type="button"
              tabIndex={tab}
              aria-pressed={selection.group === null}
              onClick={() => choose(ALL)}
              className={`${pillBase} ${selection.group === null ? activePill : idlePill}`}
            >
              {labels.all}
            </button>
            {model.map(g => (
              <button
                key={g.id}
                type="button"
                tabIndex={tab}
                aria-pressed={selection.group === g.id}
                onClick={() => choose({ group: g.id, category: null }, g.categories.length === 0)}
                className={`${pillBase} ${selection.group === g.id ? activePill : idlePill}`}
              >
                {g.label}
                <span className={count}>{g.count}</span>
              </button>
            ))}
          </div>

          <div
            className={`grid motion-safe:transition-[grid-template-rows,opacity] motion-safe:duration-300 motion-safe:ease-out ${
              hasSecondRow ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
            }`}
            aria-hidden={!hasSecondRow}
          >
            <div className="overflow-hidden">
              {shown && (
                // Replays the fade when the visitor moves from one group to another.
                <div
                  key={shown.id}
                  className="flex flex-wrap gap-2 border-t border-gray-200 pb-4 pt-3 dark:border-gray-800 motion-safe:animate-fade-slide"
                >
                  <button
                    type="button"
                    tabIndex={open && hasSecondRow ? 0 : -1}
                    aria-pressed={wholeGroup}
                    onClick={() => choose({ group: shown.id, category: null })}
                    className={`${pillBase} ${wholeGroup ? activePill : idlePill}`}
                  >
                    {labels.allIn(shown.label)}
                  </button>
                  {shown.categories.map(c => {
                    const isActive = selection.category === c.id
                    return (
                      <button
                        key={c.id}
                        type="button"
                        tabIndex={open && hasSecondRow ? 0 : -1}
                        aria-pressed={isActive}
                        onClick={() => choose({ group: shown.id, category: c.id })}
                        className={`${pillBase} ${isActive ? activePill : idlePill}`}
                      >
                        {c.label}
                        <span className={count}>{c.count}</span>
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
