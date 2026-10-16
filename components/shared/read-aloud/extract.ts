// What the reader reads: the page title and the article body, one entry per paragraph-like
// block. Everything else on the page (header, footer, links, tags, share) is outside the two
// containers and never looked at.

export const TITLE_ID = 'read-aloud-title'
export const CONTENT_ID = 'read-aloud-content'

export interface ReadBlock {
  el: HTMLElement
  text: string
  // Set on headings: the text shown as the current chapter in the player.
  heading?: string
}

const BLOCKS = 'h1, h2, h3, h4, h5, h6, p, li, blockquote'
// Not read: code, tables, media and anything an author or component marks as skipped (the
// image captions in MDXContentImage).
const SKIP = 'pre, table, img, svg, video, audio, iframe, figure, button, script, style, [data-read-aloud-skip]'

function isBlock(el: Element): boolean {
  return el.matches(BLOCKS)
}

// The element's own text: nested blocks (a <p> inside an <li>, a nested list) are read as
// their own entries, so they are left out here.
function ownText(el: Element): string {
  let text = ''
  for (const node of Array.from(el.childNodes)) {
    if (node.nodeType === Node.TEXT_NODE) text += node.textContent ?? ''
    else if (node instanceof Element) {
      if (node.matches(SKIP) || isBlock(node)) continue
      if (node.tagName === 'BR') text += ' '
      else text += ownText(node)
    }
  }
  return text.replace(/\s+/g, ' ').trim()
}

export function extractBlocks(): ReadBlock[] {
  const blocks: ReadBlock[] = []
  const title = document.getElementById(TITLE_ID)
  if (title) {
    const text = ownText(title)
    if (text) blocks.push({ el: title, text })
  }
  const content = document.getElementById(CONTENT_ID)
  if (!content) return blocks
  for (const el of Array.from(content.querySelectorAll<HTMLElement>(BLOCKS))) {
    if (el.closest(SKIP)) continue
    const text = ownText(el)
    if (!text) continue
    blocks.push({ el, text, heading: /^H[1-6]$/.test(el.tagName) ? text : undefined })
  }
  return blocks
}
