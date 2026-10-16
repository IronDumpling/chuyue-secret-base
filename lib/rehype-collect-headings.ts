// A rehype plugin that records the body's h1–h3 headings for the table of contents. It runs
// right after rehype-slug in the same pipeline, so the ids it reads are exactly the ids the
// rendered headings carry (duplicates already suffixed -1, -2, …).

export interface TocHeading {
  depth: 1 | 2 | 3
  id: string
  text: string
}

// Just the shape of a HAST node this plugin looks at; avoids depending on @types/hast.
interface HastNode {
  type: string
  tagName?: string
  value?: string
  properties?: Record<string, unknown>
  children?: HastNode[]
}

const HEADING_DEPTH: Record<string, TocHeading['depth']> = { h1: 1, h2: 2, h3: 3 }

function textOf(node: HastNode): string {
  if (node.type === 'text') return node.value ?? ''
  return (node.children ?? []).map(textOf).join('')
}

export function rehypeCollectHeadings(out: TocHeading[]) {
  return (tree: HastNode) => {
    const walk = (node: HastNode) => {
      const depth = node.type === 'element' && node.tagName ? HEADING_DEPTH[node.tagName] : undefined
      const id = node.properties?.id
      if (depth && typeof id === 'string' && id) {
        out.push({ depth, id, text: textOf(node).replace(/\s+/g, ' ').trim() })
        return
      }
      node.children?.forEach(walk)
    }
    walk(tree)
  }
}
