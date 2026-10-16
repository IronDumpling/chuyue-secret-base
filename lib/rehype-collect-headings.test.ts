import { describe, it, expect } from 'vitest'
import rehypeSlug from 'rehype-slug'
import { rehypeCollectHeadings, type TocHeading } from './rehype-collect-headings'

const text = (value: string) => ({ type: 'text', value })
const el = (tagName: string, children: any[], properties: Record<string, unknown> = {}) => ({
  type: 'element',
  tagName,
  properties,
  children,
})
const root = (...children: any[]) => ({ type: 'root', children })

function collect(tree: any): TocHeading[] {
  const out: TocHeading[] = []
  rehypeCollectHeadings(out)(tree)
  return out
}

describe('rehypeCollectHeadings', () => {
  it('collects h1-h3 with ids in document order', () => {
    const tree = root(
      el('h1', [text('A')], { id: 'a' }),
      el('p', [text('x')]),
      el('h2', [text('B')], { id: 'b' }),
      el('h4', [text('D')], { id: 'd' }),
      el('div', [el('h3', [text('C')], { id: 'c' })])
    )
    expect(collect(tree)).toEqual([
      { depth: 1, id: 'a', text: 'A' },
      { depth: 2, id: 'b', text: 'B' },
      { depth: 3, id: 'c', text: 'C' },
    ])
  })

  it('collects plain text from nested inline elements', () => {
    const tree = root(
      el('h2', [text('The '), el('strong', [text('real')]), text(' '), el('code', [text('truth')])], { id: 't' })
    )
    expect(collect(tree)[0].text).toBe('The real truth')
  })

  it("keeps rehype-slug's deduplicated ids", () => {
    const tree = root(el('h3', [text('第一场 小黑屋')]), el('h3', [text('第一场 小黑屋')]))
    ;(rehypeSlug() as any)(tree)
    expect(collect(tree).map(h => h.id)).toEqual(['第一场-小黑屋', '第一场-小黑屋-1'])
  })

  it('skips headings without an id and collapses whitespace', () => {
    const tree = root(el('h2', [text('no id')]), el('h2', [text('  a \n  b ')], { id: 'ab' }))
    expect(collect(tree)).toEqual([{ depth: 2, id: 'ab', text: 'a b' }])
  })
})
