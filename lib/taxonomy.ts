// The one place that says which categories exist and how they are grouped.
//
// A category is a leaf: its id is the content folder name and the URL segment
// (content/blog/films/her-review.mdx -> /blog/films/her-review/). A group only shapes the
// filter menu; it never appears in a folder or a URL, so regrouping categories, or turning
// a group into its own section, changes no files and no links.
//
// Display names are not here. They live in the dictionaries (lib/i18n/dictionaries), one
// per language, under `categories` and `groups`.
//
// Client-safe: no fs.

export const TAXONOMY = {
  blog: {
    groups: [
      // A group with one category has no second menu level.
      { id: 'moments', categories: ['moments'] },
      { id: 'reviews', categories: ['films', 'shows', 'music', 'video-games', 'books'] },
    ],
  },
  portfolio: {
    groups: [
      { id: 'computing', categories: ['applications', 'games', 'systems', 'ai'] },
      { id: 'art', categories: ['photography', 'illustration'] },
    ],
  },
} as const

export type Section = keyof typeof TAXONOMY

type GroupsOf<S extends Section> = (typeof TAXONOMY)[S]['groups'][number]
export type GroupId<S extends Section> = GroupsOf<S>['id']
export type CategoryId<S extends Section> = GroupsOf<S>['categories'][number]

export type BlogCategory = CategoryId<'blog'>
export type BlogGroup = GroupId<'blog'>
export type PortfolioCategory = CategoryId<'portfolio'>
export type PortfolioGroup = GroupId<'portfolio'>

export interface Group<S extends Section = Section> {
  id: GroupId<S>
  categories: readonly CategoryId<S>[]
}

export function getGroups<S extends Section>(section: S): readonly Group<S>[] {
  return TAXONOMY[section].groups as unknown as readonly Group<S>[]
}

// Every category of a section, in display order.
export function getCategories<S extends Section>(section: S): CategoryId<S>[] {
  return getGroups(section).flatMap(group => [...group.categories]) as CategoryId<S>[]
}

export function isValidCategory<S extends Section>(section: S, id: string): id is CategoryId<S> {
  return (getCategories(section) as string[]).includes(id)
}

export function getGroupOf<S extends Section>(section: S, category: CategoryId<S>): GroupId<S> {
  const group = getGroups(section).find(g => (g.categories as readonly string[]).includes(category))
  // Unreachable for a typed category; a bad folder name is caught at build time.
  if (!group) throw new Error(`Unknown ${section} category: ${category}`)
  return group.id
}

// A group only gets a second menu level when it holds more than one category.
export function hasSubcategories(group: Group): boolean {
  return group.categories.length > 1
}
