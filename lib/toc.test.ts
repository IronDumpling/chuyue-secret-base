import { describe, it, expect } from 'vitest'
import type { TocHeading } from './rehype-collect-headings'
import { ancestorIds, buildTocTree, defaultExpanded, flattenToc, pickActiveId, type TocNode } from './toc'

const h = (depth: 1 | 2 | 3, id: string): TocHeading => ({ depth, id, text: id.toUpperCase() })
// [id, level, children] — compact view of a tree for assertions.
const shape = (nodes: TocNode[]): unknown[] => nodes.map(n => [n.id, n.level, shape(n.children)])

describe('buildTocTree', () => {
  it('treats the shallowest depth as level 1', () => {
    expect(shape(buildTocTree([h(2, 'a'), h(3, 'b'), h(2, 'c')]))).toEqual([
      ['a', 1, [['b', 2, []]]],
      ['c', 1, []],
    ])
  })

  it('attaches a skipped level to the nearest shallower ancestor', () => {
    expect(shape(buildTocTree([h(1, 'a'), h(3, 'b'), h(2, 'c')]))).toEqual([
      ['a', 1, [['b', 2, []], ['c', 2, []]]],
    ])
  })

  it('nests three levels and starts a new root on a shallower heading', () => {
    expect(shape(buildTocTree([h(1, 'a'), h(2, 'b'), h(3, 'c'), h(1, 'd')]))).toEqual([
      ['a', 1, [['b', 2, [['c', 3, []]]]]],
      ['d', 1, []],
    ])
  })

  it('makes a heading shallower than the first one a root too', () => {
    expect(shape(buildTocTree([h(3, 'a'), h(2, 'b'), h(3, 'c')]))).toEqual([
      ['a', 1, []],
      ['b', 1, [['c', 2, []]]],
    ])
  })

  it('returns [] for no headings', () => {
    expect(buildTocTree([])).toEqual([])
  })

  it('keeps the heading text', () => {
    expect(buildTocTree([h(1, 'a')])[0].text).toBe('A')
  })
})

describe('flattenToc / ancestorIds', () => {
  const tree = buildTocTree([h(1, 'a'), h(2, 'b'), h(3, 'c'), h(1, 'd')])

  it('flattens in document order', () => {
    expect(flattenToc(tree).map(n => n.id)).toEqual(['a', 'b', 'c', 'd'])
  })

  it('lists ancestors root-first', () => {
    expect(ancestorIds(tree, 'c')).toEqual(['a', 'b'])
    expect(ancestorIds(tree, 'd')).toEqual([])
    expect(ancestorIds(tree, 'missing')).toEqual([])
  })
})

describe('defaultExpanded', () => {
  it('expands every parent when there are at most 15 entries', () => {
    const tree = buildTocTree([h(1, 'a'), h(2, 'b'), h(3, 'c'), h(1, 'd'), h(2, 'e')])
    expect([...defaultExpanded(tree, null)].sort()).toEqual(['a', 'b', 'd'])
  })

  it('expands only level-1 parents plus the active branch above 15 entries', () => {
    const headings: TocHeading[] = []
    for (const p of ['p1', 'p2']) {
      headings.push(h(1, p))
      for (let i = 0; i < 4; i++) {
        headings.push(h(2, `${p}-s${i}`))
        headings.push(h(3, `${p}-s${i}-x`))
      }
    }
    const tree = buildTocTree(headings) // 18 entries
    expect([...defaultExpanded(tree, 'p2-s1-x')].sort()).toEqual(['p1', 'p2', 'p2-s1'])
    expect([...defaultExpanded(tree, null)].sort()).toEqual(['p1', 'p2'])
  })
})

describe('pickActiveId', () => {
  const at = (...tops: number[]) => tops.map((top, i) => ({ id: `h${i}`, top }))

  it('returns null before the first heading reaches the line', () => {
    expect(pickActiveId(at(300, 900), false)).toBeNull()
  })

  it('returns the last heading above the line', () => {
    expect(pickActiveId(at(-500, 100, 400), false)).toBe('h1')
  })

  it('picks the last heading at the bottom of the page', () => {
    expect(pickActiveId(at(-500, 400, 700), true)).toBe('h2')
  })

  it('returns null for no headings', () => {
    expect(pickActiveId([], true)).toBeNull()
  })
})
