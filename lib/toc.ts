import type { TocHeading } from './rehype-collect-headings'

// Fewer headings than this and the page gets no table of contents.
export const TOC_MIN_HEADINGS = 2
// Up to this many entries the whole tree starts expanded; longer ones start folded.
export const TOC_EXPAND_ALL_MAX = 15
// A heading becomes "current" once its top passes this many px from the viewport top.
export const ACTIVE_LINE_PX = 120

export interface TocNode {
  id: string
  text: string
  level: 1 | 2 | 3
  children: TocNode[]
}

// Levels are relative to the page: a post that only uses ## and ### shows them as levels 1
// and 2. A skipped level (# then ###) nests one step under its parent instead of leaving an
// empty level in between.
export function buildTocTree(headings: TocHeading[]): TocNode[] {
  const roots: TocNode[] = []
  const stack: { node: TocNode; depth: number }[] = []

  for (const heading of headings) {
    while (stack.length > 0 && stack[stack.length - 1].depth >= heading.depth) stack.pop()
    const parent = stack[stack.length - 1]?.node
    const node: TocNode = {
      id: heading.id,
      text: heading.text,
      level: parent ? (Math.min(parent.level + 1, 3) as TocNode['level']) : 1,
      children: [],
    }
    ;(parent ? parent.children : roots).push(node)
    stack.push({ node, depth: heading.depth })
  }

  return roots
}

export function flattenToc(tree: TocNode[]): TocNode[] {
  return tree.flatMap(node => [node, ...flattenToc(node.children)])
}

// Root-first ids of the nodes above `id`; [] when `id` is a root or not in the tree.
export function ancestorIds(tree: TocNode[], id: string): string[] {
  for (const node of tree) {
    if (node.id === id) return []
    const below = ancestorIds(node.children, id)
    if (below.length > 0 || node.children.some(child => child.id === id)) return [node.id, ...below]
  }
  return []
}

// Ids of the nodes whose children start out visible.
export function defaultExpanded(tree: TocNode[], activeId: string | null): Set<string> {
  const all = flattenToc(tree)
  if (all.length <= TOC_EXPAND_ALL_MAX) {
    return new Set(all.filter(node => node.children.length > 0).map(node => node.id))
  }
  const expanded = new Set(tree.filter(node => node.children.length > 0).map(node => node.id))
  if (activeId) ancestorIds(tree, activeId).forEach(id => expanded.add(id))
  return expanded
}

// `top` is each heading's getBoundingClientRect().top, in document order. At the bottom of
// the page the last heading wins even if it never reached the line (short final sections).
export function pickActiveId(
  positions: { id: string; top: number }[],
  atBottom: boolean,
  line: number = ACTIVE_LINE_PX
): string | null {
  if (positions.length === 0) return null
  if (atBottom) return positions[positions.length - 1].id
  let active: string | null = null
  for (const { id, top } of positions) {
    if (top > line) break
    active = id
  }
  return active
}
