'use client'

import { ALL, type FilterGroup, type Selection } from '@/lib/filter-model'
import { useSlidingIndicator } from './useSlidingIndicator'
import type { FilterLabels } from './CategoryFilter'

interface SidebarFilterProps {
  model: FilterGroup[]
  selection: Selection
  onChange: (selection: Selection) => void
  labels: FilterLabels
  className?: string
}

const itemBase =
  'relative z-10 flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm transition-colors duration-200'
const active = 'font-medium text-primary-600 dark:text-primary-400'
const idle = 'text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400'
const highlight =
  'pointer-events-none absolute inset-x-0 top-0 rounded-lg bg-primary-50 dark:bg-primary-900/20'

// Two columns side by side: the groups, and next to them the categories of the chosen group.
// Both columns keep their width even when the second one is empty, so the list beside the
// menu never shifts sideways when a group with categories is picked.
export default function SidebarFilter({ model, selection, onChange, labels, className = '' }: SidebarFilterProps) {
  const group = model.find(g => g.id === selection.group)
  const secondLevel = group && group.categories.length > 0 ? group : null

  const first = useSlidingIndicator<HTMLDivElement>(selection.group ?? 'all', 'y')
  const second = useSlidingIndicator<HTMLDivElement>(
    secondLevel ? (selection.category ?? '__group__') : null,
    'y'
  )

  return (
    <nav aria-label={labels.ariaLabel} className={`flex ${className}`}>
      <div ref={first.containerRef} className="relative flex w-32 shrink-0 flex-col gap-1 pr-3">
        <span
          aria-hidden
          style={first.style}
          className={`${highlight} ${first.animate ? 'motion-safe:transition-[transform,height] motion-safe:duration-300 motion-safe:ease-out' : ''}`}
        />
        <button
          type="button"
          data-key="all"
          aria-pressed={selection.group === null}
          onClick={() => onChange(ALL)}
          className={`${itemBase} ${selection.group === null ? active : idle}`}
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
            className={`${itemBase} ${selection.group === g.id ? active : idle}`}
          >
            <span className="truncate">{g.label}</span>
            <span className="ml-auto text-xs tabular-nums opacity-50">{g.count}</span>
          </button>
        ))}
      </div>

      <div
        ref={second.containerRef}
        className={`relative flex w-36 shrink-0 flex-col gap-1 border-l pl-3 motion-safe:transition-colors motion-safe:duration-300 ${
          secondLevel ? 'border-gray-200 dark:border-gray-800' : 'border-transparent'
        }`}
      >
        {secondLevel && (
          // Keyed by group so moving between groups replays the fade.
          <div key={secondLevel.id} className="flex flex-col gap-1 motion-safe:animate-fade-slide">
            <span
              aria-hidden
              style={second.style}
              className={`${highlight} left-3 ${second.animate ? 'motion-safe:transition-[transform,height] motion-safe:duration-300 motion-safe:ease-out' : ''}`}
            />
            <button
              type="button"
              data-key="__group__"
              aria-pressed={selection.category === null}
              onClick={() => onChange({ group: secondLevel.id, category: null })}
              className={`${itemBase} ${selection.category === null ? active : idle}`}
            >
              <span className="truncate">{labels.allIn(secondLevel.label)}</span>
              <span className="ml-auto text-xs tabular-nums opacity-50">{secondLevel.count}</span>
            </button>
            {secondLevel.categories.map(category => (
              <button
                key={category.id}
                type="button"
                data-key={category.id}
                aria-pressed={selection.category === category.id}
                onClick={() => onChange({ group: secondLevel.id, category: category.id })}
                className={`${itemBase} ${selection.category === category.id ? active : idle}`}
              >
                <span className="truncate">{category.label}</span>
                <span className="ml-auto text-xs tabular-nums opacity-50">{category.count}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </nav>
  )
}
