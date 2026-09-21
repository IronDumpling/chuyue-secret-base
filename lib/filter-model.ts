// The data behind the category filter of the blog and the portfolio. Pure, so both the
// sidebar, the top bar and the mobile <select> render the same model, and it is testable
// without a browser. Client-safe: no fs.

import { getGroups, hasSubcategories, type Section } from './taxonomy'

export interface FilterCategory {
  id: string
  label: string
  count: number
}

export interface FilterGroup {
  id: string
  label: string
  count: number
  // The second menu level. Empty when the group has nothing to choose between.
  categories: FilterCategory[]
}

// group null = everything; category null = the whole group.
export interface Selection {
  group: string | null
  category: string | null
}

export const ALL: Selection = { group: null, category: null }

interface Labels {
  group: (id: string) => string
  category: (id: string) => string
}

// Groups and categories with nothing in them are left out, so a category shows up in the
// menu the day its first post is added and never before. A second level is only offered
// when at least two of the group's categories have something in them.
export function buildFilterModel(
  section: Section,
  items: readonly { category: string }[],
  labels: Labels
): FilterGroup[] {
  const counts = new Map<string, number>()
  for (const item of items) counts.set(item.category, (counts.get(item.category) ?? 0) + 1)

  const result: FilterGroup[] = []
  for (const group of getGroups(section)) {
    const filled: FilterCategory[] = (group.categories as readonly string[])
      .filter(id => (counts.get(id) ?? 0) > 0)
      .map(id => ({ id, label: labels.category(id), count: counts.get(id) ?? 0 }))
    const count = filled.reduce((sum, category) => sum + category.count, 0)
    if (count === 0) continue

    result.push({
      id: group.id,
      label: labels.group(group.id),
      count,
      categories: hasSubcategories(group) && filled.length > 1 ? filled : [],
    })
  }
  return result
}

export function matchesSelection(item: { category: string; group: string }, selection: Selection): boolean {
  if (selection.group !== null && item.group !== selection.group) return false
  if (selection.category !== null && item.category !== selection.category) return false
  return true
}

// A stable key for the current selection ('all', 'reviews', 'reviews/films'), used to
// replay the list animation and to find the active menu item.
export function selectionKey(selection: Selection): string {
  if (selection.group === null) return 'all'
  return selection.category === null ? selection.group : `${selection.group}/${selection.category}`
}

// The <select> carries one string per option.
export function selectionToValue(selection: Selection): string {
  return selection.group === null ? 'all' : selection.category === null ? `g:${selection.group}` : `c:${selection.category}`
}

export function valueToSelection(value: string, model: readonly FilterGroup[]): Selection {
  if (value.startsWith('g:')) {
    const group = model.find(g => g.id === value.slice(2))
    return group ? { group: group.id, category: null } : ALL
  }
  if (value.startsWith('c:')) {
    const id = value.slice(2)
    const group = model.find(g => g.categories.some(c => c.id === id))
    return group ? { group: group.id, category: id } : ALL
  }
  return ALL
}

// A selection whose group or category has disappeared from the model (the language changed
// and a category is empty there) falls back to everything.
export function normalizeSelection(selection: Selection, model: readonly FilterGroup[]): Selection {
  if (selection.group === null) return ALL
  const group = model.find(g => g.id === selection.group)
  if (!group) return ALL
  if (selection.category === null) return selection
  return group.categories.some(c => c.id === selection.category) ? selection : { group: group.id, category: null }
}

// The chosen filter lives in the address ('?group=reviews&category=films') rather than in
// component state alone, so going back from a post returns to the same filtered list. Reading
// it needs no validation here: normalizeSelection() drops whatever the model does not have.
export function selectionFromParams(params: URLSearchParams): Selection {
  const group = params.get('group')
  if (!group) return ALL
  return { group, category: params.get('category') }
}

export function applySelectionToParams(params: URLSearchParams, selection: Selection): void {
  params.delete('group')
  params.delete('category')
  if (selection.group === null) return
  params.set('group', selection.group)
  if (selection.category !== null) params.set('category', selection.category)
}
