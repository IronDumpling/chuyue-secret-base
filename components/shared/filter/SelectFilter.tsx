'use client'

import { selectionToValue, valueToSelection, type FilterGroup, type Selection } from '@/lib/filter-model'
import type { FilterLabels } from './CategoryFilter'

interface SelectFilterProps {
  model: FilterGroup[]
  selection: Selection
  onChange: (selection: Selection) => void
  labels: FilterLabels
  className?: string
}

// The narrow-screen menu: one native <select>, with <optgroup> for the two levels. A native
// control opens the system picker on a phone, which is easier to use than any custom list.
export default function SelectFilter({ model, selection, onChange, labels, className = '' }: SelectFilterProps) {
  return (
    <div className={`relative ${className}`}>
      <select
        aria-label={labels.ariaLabel}
        value={selectionToValue(selection)}
        onChange={event => onChange(valueToSelection(event.target.value, model))}
        className="w-full appearance-none rounded-lg border border-gray-300 bg-white px-4 py-2.5 pr-10 text-sm text-gray-900 transition-colors duration-200 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/30 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
      >
        <option value="all">{labels.all}</option>
        {model.map(group =>
          group.categories.length > 0 ? (
            <optgroup key={group.id} label={group.label}>
              <option value={`g:${group.id}`}>
                {labels.allIn(group.label)} ({group.count})
              </option>
              {group.categories.map(category => (
                <option key={category.id} value={`c:${category.id}`}>
                  {category.label} ({category.count})
                </option>
              ))}
            </optgroup>
          ) : (
            <option key={group.id} value={`g:${group.id}`}>
              {group.label} ({group.count})
            </option>
          )
        )}
      </select>
      <svg
        aria-hidden
        className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500 dark:text-gray-400"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    </div>
  )
}
