'use client'

import { useRef } from 'react'
import { ALL, type FilterGroup, type Selection } from '@/lib/filter-model'
import { useSlidingIndicator } from './useSlidingIndicator'
import type { FilterLabels } from './CategoryFilter'

interface TopBarFilterProps {
  model: FilterGroup[]
  selection: Selection
  onChange: (selection: Selection) => void
  labels: FilterLabels
  className?: string
}

const tabBase = 'relative px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors duration-200'
const pillBase = 'rounded-full px-3 py-1 text-sm transition-colors duration-200'
const active = 'text-primary-600 dark:text-primary-400'
const activePill = 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400'
const idle = 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
const idlePill = 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'

// Two rows: the groups as tabs on one shared line, and under it the categories of the chosen
// group. Left-aligned, so it reads as one header rather than a scatter of buttons.
export default function TopBarFilter({ model, selection, onChange, labels, className = '' }: TopBarFilterProps) {
  const firstRow = useSlidingIndicator<HTMLDivElement>(selection.group ?? 'all', 'x')
  const group = model.find(g => g.id === selection.group)
  const hasSecondRow = !!group && group.categories.length > 0

  // Keep the last group's pills on screen while the second row folds away, otherwise its
  // content vanishes before the height has finished animating.
  const lastGroup = useRef<FilterGroup | null>(null)
  if (hasSecondRow) lastGroup.current = group!
  const shown = hasSecondRow ? group! : lastGroup.current

  return (
    <nav aria-label={labels.ariaLabel} className={className}>
      <div
        ref={firstRow.containerRef}
        className="relative flex border-b border-gray-200 dark:border-gray-800"
      >
        <button
          type="button"
          data-key="all"
          aria-pressed={selection.group === null}
          onClick={() => onChange(ALL)}
          className={`${tabBase} ${selection.group === null ? active : idle}`}
        >
          {labels.all}
        </button>
        {model.map(g => (
          <button
            key={g.id}
            type="button"
            data-key={g.id}
            aria-pressed={selection.group === g.id}
            onClick={() => onChange({ group: g.id, category: null })}
            className={`${tabBase} ${selection.group === g.id ? active : idle}`}
          >
            {g.label}
            <span className="ml-1.5 text-xs tabular-nums opacity-60">{g.count}</span>
          </button>
        ))}
        <span
          aria-hidden
          style={firstRow.style}
          className={`pointer-events-none absolute -bottom-px left-0 h-0.5 rounded-full bg-primary-600 dark:bg-primary-400 ${
            firstRow.animate ? 'motion-safe:transition-[transform,width] motion-safe:duration-300 motion-safe:ease-out' : ''
          }`}
        />
      </div>

      {/* grid-rows 0fr -> 1fr animates to the content's own height. */}
      <div
        className={`grid motion-safe:transition-[grid-template-rows,opacity] motion-safe:duration-300 motion-safe:ease-out ${
          hasSecondRow ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
        }`}
        aria-hidden={!hasSecondRow}
      >
        <div className="overflow-hidden">
          {shown && (
            <SecondRow group={shown} selection={selection} onChange={onChange} labels={labels} focusable={hasSecondRow} />
          )}
        </div>
      </div>
    </nav>
  )
}

function SecondRow({
  group,
  selection,
  onChange,
  labels,
  focusable,
}: {
  group: FilterGroup
  selection: Selection
  onChange: (selection: Selection) => void
  labels: FilterLabels
  focusable: boolean
}) {
  const wholeGroup = selection.group === group.id && selection.category === null
  return (
    // Replays the fade when the visitor moves from one group to another.
    <div key={group.id} className="flex flex-wrap gap-2 pt-3 motion-safe:animate-fade-slide">
      <button
        type="button"
        tabIndex={focusable ? 0 : -1}
        aria-pressed={wholeGroup}
        onClick={() => onChange({ group: group.id, category: null })}
        className={`${pillBase} ${wholeGroup ? activePill : idlePill}`}
      >
        {labels.allIn(group.label)}
      </button>
      {group.categories.map(category => {
        const isActive = selection.category === category.id
        return (
          <button
            key={category.id}
            type="button"
            tabIndex={focusable ? 0 : -1}
            aria-pressed={isActive}
            onClick={() => onChange({ group: group.id, category: category.id })}
            className={`${pillBase} ${isActive ? activePill : idlePill}`}
          >
            {category.label}
            <span className="ml-1.5 text-xs tabular-nums opacity-60">{category.count}</span>
          </button>
        )
      })}
    </div>
  )
}
