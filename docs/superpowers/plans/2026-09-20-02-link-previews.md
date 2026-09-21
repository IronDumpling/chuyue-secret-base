# Link Previews Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make every blog post, portfolio project and the site itself produce a proper link preview (title, description, 1200x630 image) when shared in Instagram DMs, chat apps and social networks.

**Architecture:** One `lib/site.ts` module owns the absolute site URL. A build-time script (`prebuild`) renders one 1200x630 JPEG card per page into `public/share/og/...` using `satori` + `@resvg/resvg-js` + `sharp`, with the post cover as background and the title on top. Pages emit `openGraph`/`twitter`/`canonical` metadata through `generateMetadata`, pointing at those files. Cards are real `.jpg` files rather than Next `opengraph-image` routes, because static export may emit extensionless image routes that GitHub Pages serves with the wrong content type. The renderer is written so plan 04 (poster) reuses it.

**Tech Stack:** Next.js 14 App Router (static export), satori, @resvg/resvg-js, sharp, gray-matter, vitest, tsx.

**Spec:** `docs/superpowers/plans/2026-09-20-00-priorities-and-roadmap.md`

## Global Constraints

- Requires plan 07 (content is a clone of `chuyue-content` at `content/`; blog and portfolio images are synced into `public/images` before each build; vitest and tsx are installed and `npm test` works). `sharp` is installed in Task 4 of this plan.
- Live site URL is confirmed: `https://irondumpling.github.io/chuyue-secret-base/` (site repo `IronDumpling/chuyue-secret-base`). `siteOrigin()` defaults to `https://irondumpling.github.io`.
- Existing URLs must not change. Canonical URLs use the current paths: `/blog/{category}/{type}/{slug}/` and `/portfolio/{category}/{slug}/` with trailing slash.
- All absolute URLs include the base path (`/chuyue-secret-base` in production) via `getBasePath()` from `lib/utils.ts`.
- Generated images go to `public/share/` and `.cache/`, both git-ignored. They are rebuilt on every `npm run build`.
- Card size 1200x630, JPEG quality 86.
- Build must not fail when Google Fonts is unreachable: fall back to the Latin font bundled inside `next`.
- Production build command (Git Bash): `MSYS_NO_PATHCONV=1 NEXT_PUBLIC_BASE_PATH=/chuyue-secret-base npm run build`

## File Structure

- Create `lib/site.ts`, `lib/site.test.ts`: site URL helpers.
- Create `lib/share-paths.ts`, `lib/share-paths.test.ts`: page path and share-image path from one definition.
- Create `lib/seo.ts`, `lib/seo.test.ts`: `summarize`, `buildPageMetadata`.
- Create `scripts/lib/content-index.ts`, `scripts/lib/content-index.test.ts`: list all content entries.
- Create `scripts/lib/fonts.ts`: font loading with fallback.
- Create `scripts/lib/card.ts`, `scripts/lib/card.test.ts`: tree builder and JPEG renderer.
- Create `scripts/generate-share-images.ts`: orchestrator.
- Modify `app/layout.tsx`, `app/sitemap.ts`, `app/robots.ts`, `app/blog/[category]/[type]/[slug]/page.tsx`, `app/portfolio/[category]/[slug]/page.tsx`, `package.json`, `.gitignore`.

---

### Task 1: Site URL module

**Files:**
- Create: `lib/site.ts`
- Test: `lib/site.test.ts`
- Modify: `app/sitemap.ts`, `app/robots.ts`

**Interfaces:**
- Produces:
  - `SITE_NAME: string` (`'Chuyue'`)
  - `siteOrigin(): string` (env `NEXT_PUBLIC_SITE_ORIGIN`, default `https://irondumpling.github.io`)
  - `siteUrl(): string` (origin + base path, no trailing slash)
  - `absoluteUrl(sitePath: string): string`

- [ ] **Step 1: Write the failing test**

Create `lib/site.test.ts`:
```ts
import { describe, it, expect, afterEach, vi } from 'vitest'
import { absoluteUrl, siteUrl, siteOrigin } from './site'

describe('site url helpers', () => {
  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it('joins origin, base path and page path', () => {
    vi.stubEnv('NEXT_PUBLIC_BASE_PATH', '/chuyue-secret-base')
    expect(siteUrl()).toBe('https://irondumpling.github.io/chuyue-secret-base')
    expect(absoluteUrl('/blog/x/')).toBe('https://irondumpling.github.io/chuyue-secret-base/blog/x/')
  })

  it('works without a base path and tolerates a missing leading slash', () => {
    vi.stubEnv('NEXT_PUBLIC_BASE_PATH', '')
    expect(absoluteUrl('feed.xml')).toBe('https://irondumpling.github.io/feed.xml')
  })

  it('honours a custom origin', () => {
    vi.stubEnv('NEXT_PUBLIC_SITE_ORIGIN', 'https://example.com')
    vi.stubEnv('NEXT_PUBLIC_BASE_PATH', '')
    expect(siteOrigin()).toBe('https://example.com')
  })
})
```

- [ ] **Step 2: Run to verify it fails**

Run: `npx vitest run lib/site.test.ts`
Expected: FAIL, cannot find `./site`.

- [ ] **Step 3: Implement**

Create `lib/site.ts`:
```ts
import { getBasePath } from './utils'

export const SITE_NAME = 'Chuyue'

export function siteOrigin(): string {
  return process.env.NEXT_PUBLIC_SITE_ORIGIN || 'https://irondumpling.github.io'
}

export function siteUrl(): string {
  return `${siteOrigin()}${getBasePath()}`
}

export function absoluteUrl(sitePath: string): string {
  const path = sitePath.startsWith('/') ? sitePath : `/${sitePath}`
  return `${siteUrl()}${path}`
}
```

- [ ] **Step 4: Run to verify it passes**

Run: `npx vitest run lib/site.test.ts`
Expected: PASS, 3 tests.

- [ ] **Step 5: Use it in the sitemap and robots files**

In `app/sitemap.ts`: add `import { siteUrl } from '@/lib/site'` and replace the line `const baseUrl = 'https://irondumpling.github.io/chuyue-secret-base'` with `const baseUrl = siteUrl()`.

In `app/robots.ts`: add `import { absoluteUrl } from '@/lib/site'` and replace the `sitemap:` value with `absoluteUrl('/sitemap.xml')`.

- [ ] **Step 6: Build check and commit**

Run the production build command. Expected: 76 pages, no errors. Then `grep -o "<loc>[^<]*" out/sitemap.xml | head -3` shows URLs starting `https://irondumpling.github.io/chuyue-secret-base/`.
```bash
git add lib/site.ts lib/site.test.ts app/sitemap.ts app/robots.ts
git commit -m "refactor: single source of truth for the site URL"
```

---

### Task 2: Share paths and page metadata

**Files:**
- Create: `lib/share-paths.ts`, `lib/share-paths.test.ts`, `lib/seo.ts`, `lib/seo.test.ts`

**Interfaces:**
- Consumes: `absoluteUrl`, `SITE_NAME` from Task 1.
- Produces:
  - `type ShareKind = 'blog' | 'portfolio'`
  - `interface ShareTarget { kind: ShareKind; category: string; type?: string; slug: string }`
  - `pagePath(t: ShareTarget): string` e.g. `/blog/music/review/laufey-bewitched/`
  - `shareImagePath(t: ShareTarget, variant: 'og' | 'poster'): string` e.g. `/share/og/blog/music/review/laufey-bewitched.jpg`
  - `SITE_OG_PATH = '/share/og/site.jpg'`
  - `summarize(description: string | undefined, body: string, max?: number): string`
  - `buildPageMetadata(t: ShareTarget, o: { title: string; description?: string; body: string; date?: string }): Metadata`

- [ ] **Step 1: Write the failing tests**

Create `lib/share-paths.test.ts`:
```ts
import { describe, it, expect } from 'vitest'
import { pagePath, shareImagePath, SITE_OG_PATH } from './share-paths'

describe('share paths', () => {
  it('builds blog page and image paths', () => {
    const t = { kind: 'blog', category: 'music', type: 'review', slug: 'laufey-bewitched' } as const
    expect(pagePath(t)).toBe('/blog/music/review/laufey-bewitched/')
    expect(shareImagePath(t, 'og')).toBe('/share/og/blog/music/review/laufey-bewitched.jpg')
    expect(shareImagePath(t, 'poster')).toBe('/share/poster/blog/music/review/laufey-bewitched.jpg')
  })

  it('builds portfolio page and image paths (no type segment)', () => {
    const t = { kind: 'portfolio', category: 'applications', slug: 'pact' } as const
    expect(pagePath(t)).toBe('/portfolio/applications/pact/')
    expect(shareImagePath(t, 'og')).toBe('/share/og/portfolio/applications/pact.jpg')
  })

  it('exposes the site card path', () => {
    expect(SITE_OG_PATH).toBe('/share/og/site.jpg')
  })
})
```

Create `lib/seo.test.ts`:
```ts
import { describe, it, expect, vi, afterEach } from 'vitest'
import { summarize, buildPageMetadata } from './seo'

afterEach(() => vi.unstubAllEnvs())

describe('summarize', () => {
  it('prefers the frontmatter description', () => {
    expect(summarize('Short blurb', '# Title\n\nbody text')).toBe('Short blurb')
  })

  it('strips markdown from the body when there is no description', () => {
    const body = '# Her\n\n![alt](/images/a.jpg)\n\nSome **bold** text with a [link](https://x.com) and `code`.'
    expect(summarize(undefined, body)).toBe('Her Some bold text with a link and code.')
  })

  it('truncates long bodies with an ellipsis', () => {
    const out = summarize(undefined, 'word '.repeat(200), 50)
    expect(out.length).toBeLessThanOrEqual(50)
    expect(out.endsWith('…')).toBe(true)
  })
})

describe('buildPageMetadata', () => {
  it('produces canonical, open graph and twitter data with absolute urls', () => {
    vi.stubEnv('NEXT_PUBLIC_BASE_PATH', '/chuyue-secret-base')
    const meta = buildPageMetadata(
      { kind: 'blog', category: 'films-shows', type: 'review', slug: 'her-review' },
      { title: 'Her Review', description: 'The most underrated sci-fi film', body: '', date: '2026-01-04' }
    )
    const base = 'https://irondumpling.github.io/chuyue-secret-base'
    expect(meta.title).toBe('Her Review')
    expect(meta.alternates?.canonical).toBe(`${base}/blog/films-shows/review/her-review/`)
    expect(meta.openGraph).toMatchObject({
      url: `${base}/blog/films-shows/review/her-review/`,
      siteName: 'Chuyue',
      publishedTime: '2026-01-04T00:00:00.000Z',
      images: [{ url: `${base}/share/og/blog/films-shows/review/her-review.jpg`, width: 1200, height: 630, alt: 'Her Review' }],
    })
    expect(meta.twitter).toMatchObject({ card: 'summary_large_image' })
  })

  it('omits publishedTime for an invalid date', () => {
    const meta = buildPageMetadata(
      { kind: 'portfolio', category: 'applications', slug: 'pact' },
      { title: 'PA:CT', body: 'x', date: 'not a date' }
    )
    expect((meta.openGraph as any).publishedTime).toBeUndefined()
  })
})
```

- [ ] **Step 2: Run to verify they fail**

Run: `npx vitest run lib/share-paths.test.ts lib/seo.test.ts`
Expected: FAIL, modules not found.

- [ ] **Step 3: Implement `lib/share-paths.ts`**

```ts
export type ShareKind = 'blog' | 'portfolio'

export interface ShareTarget {
  kind: ShareKind
  category: string
  type?: string // blog only
  slug: string
}

export const SITE_OG_PATH = '/share/og/site.jpg'

function segments(t: ShareTarget): string[] {
  return t.kind === 'blog' ? [t.kind, t.category, t.type ?? '', t.slug] : [t.kind, t.category, t.slug]
}

export function pagePath(t: ShareTarget): string {
  return `/${segments(t).join('/')}/`
}

export function shareImagePath(t: ShareTarget, variant: 'og' | 'poster'): string {
  return `/share/${variant}/${segments(t).join('/')}.jpg`
}
```

- [ ] **Step 4: Implement `lib/seo.ts`**

```ts
import type { Metadata } from 'next'
import { absoluteUrl, SITE_NAME } from './site'
import { pagePath, shareImagePath, type ShareTarget } from './share-paths'

export function summarize(description: string | undefined, body: string, max = 160): string {
  if (description && description.trim()) return description.trim()

  const text = body
    .replace(/!\[[^\]]*\]\([^)]*\)/g, '') // images
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1') // links -> text
    .replace(/<[^>]+>/g, ' ') // html / jsx tags
    .replace(/^#{1,6}\s*/gm, '') // heading markers
    .replace(/[*_`>~]/g, '') // emphasis, code, quote
    .replace(/\s+/g, ' ')
    .trim()

  return text.length <= max ? text : `${text.slice(0, max - 1).trimEnd()}…`
}

interface PageMetaInput {
  title: string
  description?: string
  body: string
  date?: string
}

export function buildPageMetadata(t: ShareTarget, o: PageMetaInput): Metadata {
  const url = absoluteUrl(pagePath(t))
  const image = absoluteUrl(shareImagePath(t, 'og'))
  const description = summarize(o.description, o.body)
  const published = o.date ? new Date(o.date) : undefined
  const publishedTime =
    published && !Number.isNaN(published.getTime()) ? published.toISOString() : undefined

  return {
    title: o.title,
    description,
    alternates: { canonical: url },
    openGraph: {
      type: 'article',
      url,
      title: o.title,
      description,
      siteName: SITE_NAME,
      images: [{ url: image, width: 1200, height: 630, alt: o.title }],
      ...(publishedTime ? { publishedTime } : {}),
    },
    twitter: {
      card: 'summary_large_image',
      title: o.title,
      description,
      images: [image],
    },
  }
}
```

- [ ] **Step 5: Run to verify they pass**

Run: `npx vitest run lib/share-paths.test.ts lib/seo.test.ts`
Expected: PASS. If the `summarize` markdown test fails on spacing, adjust the regex order rather than the expectation: the heading `# Her` followed by two newlines must collapse to `Her Some ...` (single space).

- [ ] **Step 6: Commit**

```bash
git add lib/share-paths.ts lib/share-paths.test.ts lib/seo.ts lib/seo.test.ts
git commit -m "feat: share path and page metadata builders"
```

---

### Task 3: Content index for the build script

**Files:**
- Create: `scripts/lib/content-index.ts`
- Test: `scripts/lib/content-index.test.ts`

**Interfaces:**
- Consumes: `ShareTarget` from Task 2.
- Produces:
  - `interface ContentEntry extends ShareTarget { title: string; description?: string; rating?: number; images: string[]; body: string }`
  - `collectContent(contentDir: string): ContentEntry[]`
- Layout read: `<contentDir>/blog/<category>/<type>/<slug>.mdx` and `<contentDir>/portfolio/<category>/<slug>.mdx` (`.md` also accepted).

- [ ] **Step 1: Write the failing test**

Create `scripts/lib/content-index.test.ts`:
```ts
import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import fs from 'fs'
import os from 'os'
import path from 'path'
import { collectContent } from './content-index'

let dir: string
function write(rel: string, text: string) {
  const full = path.join(dir, rel)
  fs.mkdirSync(path.dirname(full), { recursive: true })
  fs.writeFileSync(full, text)
}

beforeEach(() => {
  dir = fs.mkdtempSync(path.join(os.tmpdir(), 'content-'))
})
afterEach(() => fs.rmSync(dir, { recursive: true, force: true }))

describe('collectContent', () => {
  it('finds blog and portfolio entries with fields from the folder layout', () => {
    write(
      'blog/films-shows/review/her-review.mdx',
      '---\ntitle: "Her Review"\nrating: 8\ndescription: "Underrated"\nimages:\n  - "/images/her.jpg"\n---\n\nBody text'
    )
    write('portfolio/applications/pact.mdx', '---\ntitle: "PA:CT"\n---\n\nPact body')

    const entries = collectContent(dir)
    const her = entries.find(e => e.slug === 'her-review')!
    expect(her).toMatchObject({
      kind: 'blog',
      category: 'films-shows',
      type: 'review',
      title: 'Her Review',
      rating: 8,
      description: 'Underrated',
      images: ['/images/her.jpg'],
    })
    expect(her.body.trim()).toBe('Body text')

    const pact = entries.find(e => e.slug === 'pact')!
    expect(pact).toMatchObject({ kind: 'portfolio', category: 'applications', title: 'PA:CT', images: [] })
    expect(pact.type).toBeUndefined()
  })

  it('ignores non-markdown files and returns [] for a missing directory', () => {
    write('blog/music/casual/notes.txt', 'nope')
    expect(collectContent(dir)).toEqual([])
    expect(collectContent(path.join(dir, 'missing'))).toEqual([])
  })
})
```

- [ ] **Step 2: Run to verify it fails**

Run: `npx vitest run scripts/lib/content-index.test.ts`
Expected: FAIL, module not found.

- [ ] **Step 3: Implement**

Create `scripts/lib/content-index.ts`:
```ts
import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import type { ShareTarget } from '../../lib/share-paths'

export interface ContentEntry extends ShareTarget {
  title: string
  description?: string
  rating?: number
  images: string[]
  body: string
}

function dirs(parent: string): string[] {
  if (!fs.existsSync(parent)) return []
  return fs.readdirSync(parent, { withFileTypes: true }).filter(e => e.isDirectory()).map(e => e.name)
}

function markdownFiles(parent: string): string[] {
  if (!fs.existsSync(parent)) return []
  return fs
    .readdirSync(parent, { withFileTypes: true })
    .filter(e => e.isFile() && /\.mdx?$/.test(e.name))
    .map(e => e.name)
}

function read(file: string, target: ShareTarget): ContentEntry {
  const { data, content } = matter(fs.readFileSync(file, 'utf8'))
  return {
    ...target,
    title: String(data.title ?? target.slug),
    description: typeof data.description === 'string' ? data.description : undefined,
    rating: typeof data.rating === 'number' ? data.rating : undefined,
    images: Array.isArray(data.images) ? data.images.filter((i: unknown): i is string => typeof i === 'string') : [],
    body: content,
  }
}

export function collectContent(contentDir: string): ContentEntry[] {
  const entries: ContentEntry[] = []

  const blogRoot = path.join(contentDir, 'blog')
  for (const category of dirs(blogRoot)) {
    for (const type of dirs(path.join(blogRoot, category))) {
      const folder = path.join(blogRoot, category, type)
      for (const name of markdownFiles(folder)) {
        const slug = path.basename(name, path.extname(name))
        entries.push(read(path.join(folder, name), { kind: 'blog', category, type, slug }))
      }
    }
  }

  const portfolioRoot = path.join(contentDir, 'portfolio')
  for (const category of dirs(portfolioRoot)) {
    const folder = path.join(portfolioRoot, category)
    for (const name of markdownFiles(folder)) {
      const slug = path.basename(name, path.extname(name))
      entries.push(read(path.join(folder, name), { kind: 'portfolio', category, slug }))
    }
  }

  return entries
}
```

- [ ] **Step 4: Run to verify it passes**

Run: `npx vitest run scripts/lib/content-index.test.ts`
Expected: PASS, 2 tests.

- [ ] **Step 5: Commit**

```bash
git add scripts/lib/content-index.ts scripts/lib/content-index.test.ts
git commit -m "feat: build-time content index"
```

---

### Task 4: Card renderer

**Files:**
- Create: `scripts/lib/fonts.ts`, `scripts/lib/card.ts`
- Test: `scripts/lib/card.test.ts`
- Modify: `package.json` (dependencies)

**Interfaces:**
- Produces (from `fonts.ts`):
  - `interface FontData { name: string; data: Buffer; weight: 400 | 700; style: 'normal' }`
  - `loadCjkFont(text: string): Promise<FontData | null>` (Google Fonts subset, cached in `.cache/fonts`, `null` on any failure)
  - `loadLatinFallback(): FontData`
- Produces (from `card.ts`):
  - `h(type: string, props: Record<string, unknown>, ...children: unknown[]): Node`
  - `interface CardInput { title: string; badge?: string; coverDataUri?: string }`
  - `buildCardTree(input: CardInput): Node`
  - `renderJpeg(tree: Node, width: number, height: number, fonts: FontData[]): Promise<Buffer>`
  - `coverDataUri(filePath: string | null, width: number, height: number): Promise<string | undefined>`

- [ ] **Step 1: Install render dependencies**

Run:
```bash
npm install --save-dev satori @resvg/resvg-js sharp
```
Expected: installs cleanly on Windows (prebuilt binaries).

- [ ] **Step 2: Write the failing test**

Create `scripts/lib/card.test.ts`:
```ts
import { describe, it, expect } from 'vitest'
import sharp from 'sharp'
import { buildCardTree, renderJpeg, coverDataUri } from './card'
import { loadLatinFallback } from './fonts'

describe('card renderer', () => {
  it('renders a 1200x630 jpeg without a cover', async () => {
    const tree = buildCardTree({ title: 'Her Review', badge: 'Films & Shows · Review' })
    const jpeg = await renderJpeg(tree, 1200, 630, [loadLatinFallback()])
    const meta = await sharp(jpeg).metadata()
    expect(meta.format).toBe('jpeg')
    expect(meta.width).toBe(1200)
    expect(meta.height).toBe(630)
  })

  it('renders with a cover image behind the title', async () => {
    const cover = await sharp({ create: { width: 1600, height: 900, channels: 3, background: '#cc6633' } })
      .jpeg()
      .toBuffer()
    const fs = await import('fs')
    const os = await import('os')
    const path = await import('path')
    const file = path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'cover-')), 'cover.jpg')
    fs.writeFileSync(file, cover)

    const uri = await coverDataUri(file, 1200, 630)
    expect(uri).toMatch(/^data:image\/jpeg;base64,/)

    const jpeg = await renderJpeg(buildCardTree({ title: 'With cover', coverDataUri: uri }), 1200, 630, [loadLatinFallback()])
    const meta = await sharp(jpeg).metadata()
    expect(meta.width).toBe(1200)
  })

  it('returns undefined for a missing cover file', async () => {
    expect(await coverDataUri('/no/such/file.jpg', 1200, 630)).toBeUndefined()
    expect(await coverDataUri(null, 1200, 630)).toBeUndefined()
  })
})
```

- [ ] **Step 3: Run to verify it fails**

Run: `npx vitest run scripts/lib/card.test.ts`
Expected: FAIL, modules not found.

- [ ] **Step 4: Implement `scripts/lib/fonts.ts`**

```ts
import fs from 'fs'
import path from 'path'
import crypto from 'crypto'

export interface FontData {
  name: string
  data: Buffer
  weight: 400 | 700
  style: 'normal'
}

const CACHE_DIR = path.join(process.cwd(), '.cache', 'fonts')

// One request for the exact characters we draw. Google's css2 API returns a TrueType
// file when no browser user-agent is sent, and `text=` keeps it to a few KB.
export async function loadCjkFont(text: string): Promise<FontData | null> {
  const unique = Array.from(new Set(text)).join('')
  const key = crypto.createHash('sha1').update(unique).digest('hex').slice(0, 16)
  const cached = path.join(CACHE_DIR, `${key}.ttf`)
  const font = (data: Buffer): FontData => ({ name: 'Noto Sans SC', data, weight: 700, style: 'normal' })

  if (fs.existsSync(cached)) return font(fs.readFileSync(cached))

  try {
    const cssUrl = `https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@700&text=${encodeURIComponent(unique)}`
    const cssRes = await fetch(cssUrl)
    if (!cssRes.ok) throw new Error(`css ${cssRes.status}`)
    const match = (await cssRes.text()).match(/src: url\((.+?)\) format\('(opentype|truetype)'\)/)
    if (!match) throw new Error('no font url in css response')

    const fontRes = await fetch(match[1])
    if (!fontRes.ok) throw new Error(`font ${fontRes.status}`)
    const data = Buffer.from(await fontRes.arrayBuffer())

    fs.mkdirSync(CACHE_DIR, { recursive: true })
    fs.writeFileSync(cached, data)
    return font(data)
  } catch (error) {
    console.warn(`[share-images] could not load CJK font, falling back to Latin only: ${(error as Error).message}`)
    return null
  }
}

export function loadLatinFallback(): FontData {
  const file = path.join(
    process.cwd(),
    'node_modules/next/dist/compiled/@vercel/og/noto-sans-v27-latin-regular.ttf'
  )
  return { name: 'Noto Sans', data: fs.readFileSync(file), weight: 400, style: 'normal' }
}
```

- [ ] **Step 5: Implement `scripts/lib/card.ts`**

```ts
import fs from 'fs'
import satori from 'satori'
import { Resvg } from '@resvg/resvg-js'
import sharp from 'sharp'
import type { FontData } from './fonts'

export interface Node {
  type: string
  props: Record<string, unknown>
}

// satori accepts plain React-element-shaped objects, so no JSX or React import is needed.
export function h(type: string, props: Record<string, unknown>, ...children: unknown[]): Node {
  return {
    type,
    props: { ...props, children: children.length <= 1 ? children[0] : children },
  }
}

export interface CardInput {
  title: string
  badge?: string
  coverDataUri?: string
}

const WIDTH = 1200
const HEIGHT = 630

function clip(text: string, max: number): string {
  const chars = Array.from(text)
  return chars.length <= max ? text : `${chars.slice(0, max - 1).join('')}…`
}

export function buildCardTree(input: CardInput): Node {
  const background = input.coverDataUri
    ? h('img', {
        src: input.coverDataUri,
        width: WIDTH,
        height: HEIGHT,
        style: { position: 'absolute', top: 0, left: 0, width: WIDTH, height: HEIGHT },
      })
    : null

  return h(
    'div',
    {
      style: {
        display: 'flex',
        position: 'relative',
        width: WIDTH,
        height: HEIGHT,
        backgroundImage: 'linear-gradient(135deg, #1e3a8a, #0f172a)',
        color: 'white',
      },
    },
    background,
    h('div', {
      style: {
        position: 'absolute',
        top: 0,
        left: 0,
        width: WIDTH,
        height: HEIGHT,
        backgroundImage: 'linear-gradient(to top, rgba(0,0,0,0.85), rgba(0,0,0,0.05))',
      },
    }),
    h(
      'div',
      {
        style: {
          position: 'absolute',
          left: 64,
          right: 64,
          bottom: 56,
          display: 'flex',
          flexDirection: 'column',
        },
      },
      input.badge
        ? h('div', { style: { display: 'flex', fontSize: 28, opacity: 0.85, marginBottom: 16 } }, input.badge)
        : null,
      h('div', { style: { display: 'flex', fontSize: 68, fontWeight: 700, lineHeight: 1.2 } }, clip(input.title, 44)),
      h('div', { style: { display: 'flex', fontSize: 26, opacity: 0.7, marginTop: 24 } }, 'Chuyue · System Designer')
    )
  )
}

export async function renderJpeg(tree: Node, width: number, height: number, fonts: FontData[]): Promise<Buffer> {
  const svg = await satori(tree as never, { width, height, fonts: fonts as never })
  const png = new Resvg(svg, { fitTo: { mode: 'width', value: width } }).render().asPng()
  return sharp(png).jpeg({ quality: 86 }).toBuffer()
}

export async function coverDataUri(
  filePath: string | null,
  width: number,
  height: number
): Promise<string | undefined> {
  if (!filePath || !fs.existsSync(filePath)) return undefined
  try {
    const buffer = await sharp(filePath).rotate().resize(width, height, { fit: 'cover' }).jpeg({ quality: 80 }).toBuffer()
    return `data:image/jpeg;base64,${buffer.toString('base64')}`
  } catch {
    return undefined
  }
}
```

- [ ] **Step 6: Run to verify it passes**

Run: `npx vitest run scripts/lib/card.test.ts`
Expected: PASS, 3 tests. If satori throws `Expected <div> to have explicit "display: flex"`, add `display: 'flex'` to the div it names. Every satori div with more than one child needs it.

- [ ] **Step 7: Commit**

```bash
git add package.json package-lock.json scripts/lib/fonts.ts scripts/lib/card.ts scripts/lib/card.test.ts
git commit -m "feat: satori card renderer with font fallback"
```

---

### Task 5: Generate cards, wire into prebuild

**Files:**
- Create: `scripts/generate-share-images.ts`
- Modify: `package.json` (scripts), `.gitignore`

**Interfaces:**
- Consumes: `collectContent` (Task 3), `buildCardTree`, `renderJpeg`, `coverDataUri` (Task 4), `loadCjkFont`, `loadLatinFallback` (Task 4), `shareImagePath`, `SITE_OG_PATH` (Task 2), `categoryMap`, `typeMap` from `lib/blog-utils.ts`, `categoryMap` from `lib/portfolio-utils.ts`.
- Produces: `public/share/og/site.jpg` and `public/share/og/{blog|portfolio}/....jpg`. Exports `entryTexts(entry): { title: string; badge: string }` for plan 04.

- [ ] **Step 1: Write the generator**

Create `scripts/generate-share-images.ts`:
```ts
import fs from 'fs'
import path from 'path'
import { collectContent, type ContentEntry } from './lib/content-index'
import { buildCardTree, coverDataUri, renderJpeg } from './lib/card'
import { loadCjkFont, loadLatinFallback } from './lib/fonts'
import { SITE_OG_PATH, shareImagePath } from '../lib/share-paths'
import { categoryMap as blogCategories, typeMap } from '../lib/blog-utils'
import { categoryMap as portfolioCategories } from '../lib/portfolio-utils'

const ROOT = process.cwd()
const PUBLIC_DIR = path.join(ROOT, 'public')
const SITE_TITLE = 'Chuyue'
const SITE_BADGE = 'Portfolio & Blog'

export function entryTexts(entry: ContentEntry): { title: string; badge: string } {
  if (entry.kind === 'blog') {
    const category = blogCategories[entry.category as keyof typeof blogCategories] ?? entry.category
    const type = typeMap[entry.type as keyof typeof typeMap] ?? entry.type
    const rating = entry.type === 'review' && entry.rating ? ` · ${entry.rating}/10` : ''
    return { title: entry.title, badge: `${category} · ${type}${rating}` }
  }
  const category = portfolioCategories[entry.category as keyof typeof portfolioCategories] ?? entry.category
  return { title: entry.title, badge: `Portfolio · ${category}` }
}

function writeTo(sitePath: string, data: Buffer) {
  const file = path.join(PUBLIC_DIR, sitePath)
  fs.mkdirSync(path.dirname(file), { recursive: true })
  fs.writeFileSync(file, data)
}

function coverFile(entry: ContentEntry): string | null {
  const first = entry.images[0]
  return first ? path.join(PUBLIC_DIR, first) : null
}

async function main() {
  const entries = collectContent(path.join(ROOT, 'content'))

  const allText = [SITE_TITLE, SITE_BADGE, 'Chuyue · System Designer', ...entries.flatMap(e => Object.values(entryTexts(e)))].join('')
  const cjk = await loadCjkFont(allText)
  const fonts = [cjk ?? loadLatinFallback()]

  fs.rmSync(path.join(PUBLIC_DIR, 'share', 'og'), { recursive: true, force: true })

  // The site card uses the gradient background only; no cover image.
  writeTo(SITE_OG_PATH, await renderJpeg(buildCardTree({ title: SITE_TITLE, badge: SITE_BADGE }), 1200, 630, fonts))

  for (const entry of entries) {
    const { title, badge } = entryTexts(entry)
    const cover = await coverDataUri(coverFile(entry), 1200, 630)
    writeTo(shareImagePath(entry, 'og'), await renderJpeg(buildCardTree({ title, badge, coverDataUri: cover }), 1200, 630, fonts))
  }

  console.log(`[share-images] wrote ${entries.length + 1} og cards to public/share/og`)
}

if (require.main === module) {
  main().catch(error => {
    console.error(error)
    process.exit(1)
  })
}
```

- [ ] **Step 2: Add scripts and ignore rules**

In `package.json` `"scripts"`, add:
```json
    "generate:share": "tsx scripts/generate-share-images.ts",
    "prebuild": "npm run generate:share"
```
If another plan has already added a `prebuild` (plan 07 adds `npm run sync:content`), chain instead: `"prebuild": "<existing> && npm run generate:share"`. `sync:content` must stay first, because cover images for the cards are copied into `public/images/blog` and `public/images/portfolio` by that step. The same applies to `generate:cms` from plan 03 (order among generators does not matter).

Append to `.gitignore`:
```
# generated at build time
/public/share/
/.cache/
```

- [ ] **Step 3: Run the generator and look at a card**

Run: `npm run generate:share`
Expected: `[share-images] wrote 47 og cards to public/share/og` (46 content entries plus the site card). Then use the Read tool on `public/share/og/blog/films-shows/review/her-review.jpg`. Expected: 1200x630, the Her cover darkened at the bottom, badge `Films & Shows · Review · 8/10`, title `Her Review`. Also open `public/share/og/blog/music/review/laufey-bewitched.jpg` to check a different cover. If the console printed a "could not load CJK font" warning, Chinese titles render as boxes; that is the fallback working, not a bug. Retry with network access before judging CJK.

- [ ] **Step 4: Commit**

```bash
git add package.json package-lock.json scripts/generate-share-images.ts .gitignore
git commit -m "feat: generate og cards at build time"
```

---

### Task 6: Emit metadata from the pages

**Files:**
- Modify: `app/layout.tsx`
- Modify: `app/blog/[category]/[type]/[slug]/page.tsx`
- Modify: `app/portfolio/[category]/[slug]/page.tsx`

**Interfaces:**
- Consumes: `buildPageMetadata` (Task 2), `siteOrigin`, `SITE_NAME`, `absoluteUrl` (Task 1), `SITE_OG_PATH` (Task 2).

- [ ] **Step 1: Site-wide defaults in the root layout**

Replace the `metadata` export in `app/layout.tsx` with:
```tsx
import { SITE_NAME, absoluteUrl, siteOrigin } from '@/lib/site'
import { SITE_OG_PATH } from '@/lib/share-paths'

const description = 'Portfolio and blog of Chuyue Zhang, a system designer graduate from University of Toronto'

export const metadata: Metadata = {
  metadataBase: new URL(siteOrigin()),
  title: { default: 'Chuyue - System Designer', template: `%s | ${SITE_NAME}` },
  description,
  openGraph: {
    type: 'website',
    siteName: SITE_NAME,
    title: 'Chuyue - System Designer',
    description,
    url: absoluteUrl('/'),
    images: [{ url: absoluteUrl(SITE_OG_PATH), width: 1200, height: 630 }],
  },
  twitter: { card: 'summary_large_image', images: [absoluteUrl(SITE_OG_PATH)] },
}
```
(Keep the existing `import type { Metadata } from 'next'` and other imports.)

- [ ] **Step 2: Blog post metadata**

In `app/blog/[category]/[type]/[slug]/page.tsx`, add imports:
```tsx
import type { Metadata } from 'next'
import { buildPageMetadata } from '@/lib/seo'
```
and add above `export default async function BlogPostPage`:
```tsx
export function generateMetadata({ params }: BlogPostPageProps): Metadata {
  const post = getPostBySlug(params.slug, params.category, params.type)
  if (!post) return {}
  return buildPageMetadata(
    { kind: 'blog', category: post.frontMatter.category, type: post.frontMatter.type, slug: post.slug },
    {
      title: post.frontMatter.title,
      description: post.frontMatter.description,
      body: post.content,
      date: String(post.frontMatter.date),
    }
  )
}
```

- [ ] **Step 3: Portfolio project metadata**

Read `app/portfolio/[category]/[slug]/page.tsx`, then add the same pattern. Use its existing `getProjectBySlug` and `params` names:
```tsx
import type { Metadata } from 'next'
import { buildPageMetadata } from '@/lib/seo'

export function generateMetadata({ params }: { params: { category: string; slug: string } }): Metadata {
  const project = getProjectBySlug(params.slug, params.category)
  if (!project) return {}
  return buildPageMetadata(
    { kind: 'portfolio', category: project.frontMatter.category, slug: project.slug },
    {
      title: project.frontMatter.title,
      description: project.frontMatter.description,
      body: project.content,
      date: String(project.frontMatter.date),
    }
  )
}
```
If the file's params interface or import names differ, keep the file's names and only add the function.

- [ ] **Step 4: Build and inspect the HTML**

Run the production build command (it runs `prebuild` first). Expected: 76 pages, no errors. Then:
```bash
grep -o '<meta property="og:image" content="[^"]*"' out/blog/films-shows/review/her-review/index.html
grep -o '<link rel="canonical" href="[^"]*"' out/blog/films-shows/review/her-review/index.html
ls out/share/og/blog/films-shows/review/
```
Expected: `og:image` is `https://irondumpling.github.io/chuyue-secret-base/share/og/blog/films-shows/review/her-review.jpg` (with your confirmed origin), canonical ends in `/her-review/`, and the `.jpg` file exists in `out/`. Repeat the first grep for `out/portfolio/applications/pact/index.html` and `out/index.html` (site card). If the og URL lacks `/chuyue-secret-base`, the base path was not set for the build; rerun with the env var from the build command.

- [ ] **Step 5: Run all tests and commit**

Run: `npm test`. Expected: all pass.
```bash
git add app/layout.tsx "app/blog/[category]/[type]/[slug]/page.tsx" "app/portfolio/[category]/[slug]/page.tsx"
git commit -m "feat: open graph and twitter metadata for posts and projects"
```

- [ ] **Step 6: After deploy, verify with real crawlers (manual)**

After pushing to `main` and the workflow finishes, paste a post URL into: (a) Facebook Sharing Debugger (`developers.facebook.com/tools/debug/`, also what Instagram link cards read), (b) any og-preview tool such as opengraph.xyz, (c) an Instagram DM to yourself. Expected: the card shows cover, title and description. Crawlers cache; use the debugger's "Scrape again" if the first result is stale. WeChat does not show link cards for third-party sites; that case is covered by the poster in plan 04.

## Self-Review

- **Spec coverage:** site URL single source (Task 1), per-page metadata (Tasks 2, 6), build-time 1200x630 cards (Tasks 3-5), real-file output (Task 5), font fallback (Task 4), crawler verification (Task 6 step 6).
- **Placeholders:** none. The confirmed live origin is an input from Global Constraints.
- **Type consistency:** `ShareTarget`, `shareImagePath`, `SITE_OG_PATH`, `ContentEntry`, `entryTexts`, `buildCardTree`, `renderJpeg`, `coverDataUri`, `FontData` are named the same wherever they are used. `entryTexts` is exported for plan 04.
- **Known risks:** `require.main === module` works because `tsx` runs this file as CommonJS (the package has no `"type": "module"`); if that ever changes, replace that guard with a direct `main()` call. Google Fonts availability affects CJK titles only.
