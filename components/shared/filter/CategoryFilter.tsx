'use client'

import type { FilterGroup, Selection } from '@/lib/filter-model'
import SelectFilter from './SelectFilter'
import SidebarFilter from './SidebarFilter'
import TopBarFilter from './TopBarFilter'

export interface FilterLabels {
  ariaLabel: string
  all: string
  // 'All Reviews' / '全部评测'
  allIn: (name: string) => string
}

interface CategoryFilterProps {
  // 'sidebar': two columns on the left from `lg` up (the blog).
  // 'topbar': two rows above the content from `md` up (the portfolio).
  // Below those widths both turn into the same single <select>.
  variant: 'sidebar' | 'topbar'
  model: FilterGroup[]
  selection: Selection
  onChange: (selection: Selection) => void
  labels: FilterLabels
}

export default function CategoryFilter({ variant, ...props }: CategoryFilterProps) {
  if (variant === 'sidebar') {
    return (
      <>
        <SelectFilter {...props} className="lg:hidden" />
        <SidebarFilter {...props} className="hidden lg:flex" />
      </>
    )
  }
  return (
    <>
      <SelectFilter {...props} className="md:hidden" />
      <TopBarFilter {...props} className="hidden md:block" />
    </>
  )
}
