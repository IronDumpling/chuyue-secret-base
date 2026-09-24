# Discoverability Implementation Plan (RSS, structured data, analytics)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

> **Status (2026-09-23): built.** This plan predates plan 08 and the taxonomy restructure; what was built follows them instead of the code below:
> - One feed per language at `app/[lang]/feed.xml/route.ts`, i.e. `/en/feed.xml` and `/zh/feed.xml`, not a single `/feed.xml`.
> - JSON-LD takes the page language, and rated reviews become `BlogPosting` + `Review`, with `itemReviewed` taken from the title.
> - Analytics lives in `app/[lang]/layout.tsx` only; the legacy layout just redirects.
> - Owner steps are in the README under "Feeds and optional services".

**Goal:** Add an RSS feed for the blog, schema.org structured data on posts and projects, and an optional privacy-friendly visitor counter, so the site can be found and its traffic measured.

**Architecture:** The feed is a static route handler (`app/feed.xml/route.ts`, `force-static`) that turns `getAllPosts()` into RSS 2.0 through a pure, tested builder. Structured data is a pure object builder plus a tiny server component that prints it as JSON-LD. Analytics is a Cloudflare Web Analytics script that is rendered only when a token environment variable is set, so nothing changes until you opt in. The sitemap and robots files already exist and are not touched apart from the earlier URL refactor.

**Tech Stack:** Next.js 14 route handlers and `next/script`, vitest.

**Spec:** `docs/superpowers/plans/2026-09-20-00-priorities-and-roadmap.md`

## Global Constraints

- Requires plan 07 (vitest) and plan 02 (`lib/site.ts`, `lib/share-paths.ts`, `lib/seo.ts`).
- Feed URL is `<site>/feed.xml`. Static export requires `export const dynamic = 'force-static'` on the route.
- Escape all text in XML. Never interpolate raw frontmatter into XML or JSON-LD.
- JSON-LD must escape `<` as `<` so a post title cannot close the script tag.
- Analytics token is not a secret (it is visible in page source) but is kept in a GitHub Actions variable, not hard-coded. With no token set, no third-party script is loaded.
- Production build command (Git Bash): `MSYS_NO_PATHCONV=1 NEXT_PUBLIC_BASE_PATH=/chuyue-secret-base npm run build`

## File Structure

- Create `lib/feed.ts`, `lib/feed.test.ts`: `escapeXml`, `buildRss`.
- Create `app/feed.xml/route.ts`.
- Modify `lib/seo.ts`, `lib/seo.test.ts`, `app/layout.tsx`: advertise the feed.
- Create `lib/jsonld.ts`, `lib/jsonld.test.ts`, `components/shared/JsonLd.tsx`.
- Modify blog and portfolio detail pages: render JSON-LD.
- Create `components/shared/Analytics.tsx`; modify `app/layout.tsx`, `.github/workflows/deploy.yml`.

---

### Task 1: RSS feed

**Files:**
- Create: `lib/feed.ts`, `app/feed.xml/route.ts`
- Test: `lib/feed.test.ts`
- Modify: `lib/seo.ts`, `lib/seo.test.ts`, `app/layout.tsx`

**Interfaces:**
- Consumes: `absoluteUrl`, `SITE_NAME` (`lib/site.ts`), `pagePath`, `shareImagePath` (`lib/share-paths.ts`), `summarize` (`lib/seo.ts`), `getAllPosts` (`lib/blog.ts`).
- Produces:
  - `escapeXml(text: string): string`
  - `interface FeedItem { title: string; link: string; description: string; pubDate: Date }`
  - `buildRss(channel: { title: string; link: string; description: string; feedUrl: string }, items: FeedItem[]): string`
  - `RSS_ALTERNATE: { 'application/rss+xml': string }` exported from `lib/seo.ts` (value from `absoluteUrl('/feed.xml')`, evaluated by a function `rssAlternate()` so env is read at call time)

- [ ] **Step 1: Write the failing test**

Create `lib/feed.test.ts`:
```ts
import { describe, it, expect } from 'vitest'
import { buildRss, escapeXml } from './feed'

describe('escapeXml', () => {
  it('escapes the five xml special characters', () => {
    expect(escapeXml(`<a href="x">Tom & 'Jerry'</a>`)).toBe(
      '&lt;a href=&quot;x&quot;&gt;Tom &amp; &apos;Jerry&apos;&lt;/a&gt;'
    )
  })
})

describe('buildRss', () => {
  const channel = {
    title: 'Chuyue',
    link: 'https://example.com/site',
    description: 'Blog',
    feedUrl: 'https://example.com/site/feed.xml',
  }

  it('builds a valid rss 2.0 document with escaped items', () => {
    const xml = buildRss(channel, [
      {
        title: 'Q & A <draft>',
        link: 'https://example.com/site/blog/a/b/c/',
        description: 'Line "one"',
        pubDate: new Date('2026-01-04T00:00:00.000Z'),
      },
    ])
    expect(xml.startsWith('<?xml version="1.0" encoding="UTF-8"?>')).toBe(true)
    expect(xml).toContain('<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">')
    expect(xml).toContain('<atom:link href="https://example.com/site/feed.xml" rel="self" type="application/rss+xml" />')
    expect(xml).toContain('<title>Q &amp; A &lt;draft&gt;</title>')
    expect(xml).toContain('<guid isPermaLink="true">https://example.com/site/blog/a/b/c/</guid>')
    expect(xml).toContain('<pubDate>Sun, 04 Jan 2026 00:00:00 GMT</pubDate>')
    expect(xml).toContain('<description>Line &quot;one&quot;</description>')
  })

  it('handles an empty item list', () => {
    expect(buildRss(channel, [])).toContain('</channel>')
  })
})
```

- [ ] **Step 2: Run to verify it fails**

Run: `npx vitest run lib/feed.test.ts`
Expected: FAIL, module not found.

- [ ] **Step 3: Implement `lib/feed.ts`**

```ts
export function escapeXml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

export interface FeedItem {
  title: string
  link: string
  description: string
  pubDate: Date
}

interface FeedChannel {
  title: string
  link: string
  description: string
  feedUrl: string
}

export function buildRss(channel: FeedChannel, items: FeedItem[]): string {
  const itemXml = items
    .map(
      item => `    <item>
      <title>${escapeXml(item.title)}</title>
      <link>${escapeXml(item.link)}</link>
      <guid isPermaLink="true">${escapeXml(item.link)}</guid>
      <pubDate>${item.pubDate.toUTCString()}</pubDate>
      <description>${escapeXml(item.description)}</description>
    </item>`
    )
    .join('\n')

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(channel.title)}</title>
    <link>${escapeXml(channel.link)}</link>
    <description>${escapeXml(channel.description)}</description>
    <atom:link href="${escapeXml(channel.feedUrl)}" rel="self" type="application/rss+xml" />
${itemXml}
  </channel>
</rss>
`
}
```

- [ ] **Step 4: Run to verify it passes**

Run: `npx vitest run lib/feed.test.ts`
Expected: PASS, 3 tests.

- [ ] **Step 5: Create the route**

Create `app/feed.xml/route.ts`:
```ts
import { getAllPosts } from '@/lib/blog'
import { buildRss } from '@/lib/feed'
import { SITE_NAME, absoluteUrl } from '@/lib/site'
import { pagePath } from '@/lib/share-paths'
import { summarize } from '@/lib/seo'

export const dynamic = 'force-static'

export function GET() {
  const items = getAllPosts().map(post => ({
    title: post.frontMatter.title,
    link: absoluteUrl(
      pagePath({ kind: 'blog', category: post.frontMatter.category, type: post.frontMatter.type, slug: post.slug })
    ),
    description: summarize(post.frontMatter.description, post.content),
    pubDate: new Date(post.frontMatter.date),
  }))

  const xml = buildRss(
    {
      title: `${SITE_NAME} - Blog`,
      link: absoluteUrl('/blog/'),
      description: 'Reviews, photography and notes by Chuyue Zhang',
      feedUrl: absoluteUrl('/feed.xml'),
    },
    items
  )

  return new Response(xml, { headers: { 'Content-Type': 'application/rss+xml; charset=utf-8' } })
}
```

- [ ] **Step 6: Advertise the feed in page metadata (test first)**

Add to `lib/seo.test.ts` inside `describe('buildPageMetadata', ...)`:
```ts
  it('keeps the rss link on post pages', () => {
    vi.stubEnv('NEXT_PUBLIC_BASE_PATH', '/chuyue-secret-base')
    const meta = buildPageMetadata({ kind: 'blog', category: 'music', type: 'review', slug: 'x' }, { title: 'X', body: 'y' })
    expect(meta.alternates?.types).toEqual({
      'application/rss+xml': 'https://irondumpling.github.io/chuyue-secret-base/feed.xml',
    })
  })
```
Run `npx vitest run lib/seo.test.ts` and expect that one test to FAIL. Then in `lib/seo.ts` add
```ts
export function rssAlternate() {
  return { 'application/rss+xml': absoluteUrl('/feed.xml') }
}
```
and change `alternates: { canonical: url },` to `alternates: { canonical: url, types: rssAlternate() },`. Rerun: PASS. In `app/layout.tsx` add to the `metadata` object `alternates: { types: rssAlternate() },` and import `rssAlternate` from `@/lib/seo`.

- [ ] **Step 7: Build and validate**

Run the production build command. Expected: 76 pages plus the feed. Check:
```bash
head -c 700 out/feed.xml
grep -c "<item>" out/feed.xml
grep -o 'rel="alternate" type="application/rss+xml"[^>]*' out/index.html
```
Expected: valid XML header, 20 items (the number of blog posts on 2026-09-20), and the alternate link present. Paste the deployed feed URL into an RSS validator (`validator.w3.org/feed/`) after deploy; expected: valid.

- [ ] **Step 8: Commit**

```bash
git add lib/feed.ts lib/feed.test.ts lib/seo.ts lib/seo.test.ts app/feed.xml/route.ts app/layout.tsx
git commit -m "feat: rss feed for the blog"
```

---

### Task 2: Structured data

**Files:**
- Create: `lib/jsonld.ts`, `components/shared/JsonLd.tsx`
- Test: `lib/jsonld.test.ts`
- Modify: blog and portfolio detail pages

**Interfaces:**
- Consumes: `absoluteUrl`, `pagePath`, `shareImagePath`, `summarize`.
- Produces:
  - `buildJsonLd(target: ShareTarget, o: { title: string; description?: string; body: string; date?: string }): Record<string, unknown>` (`BlogPosting` for blog, `CreativeWork` for portfolio)
  - `serializeJsonLd(data: unknown): string` (escapes `<`)
  - `<JsonLd data={...} />`

- [ ] **Step 1: Write the failing test**

Create `lib/jsonld.test.ts`:
```ts
import { describe, it, expect, vi, afterEach } from 'vitest'
import { buildJsonLd, serializeJsonLd } from './jsonld'

afterEach(() => vi.unstubAllEnvs())

describe('buildJsonLd', () => {
  it('describes a blog post as BlogPosting', () => {
    vi.stubEnv('NEXT_PUBLIC_BASE_PATH', '/chuyue-secret-base')
    const data = buildJsonLd(
      { kind: 'blog', category: 'music', type: 'review', slug: 'laufey-bewitched' },
      { title: 'Bewitched', description: 'Album review', body: '', date: '2026-01-04' }
    )
    expect(data).toMatchObject({
      '@context': 'https://schema.org',
      '@type': 'BlogPosting',
      headline: 'Bewitched',
      description: 'Album review',
      datePublished: '2026-01-04T00:00:00.000Z',
      mainEntityOfPage: 'https://irondumpling.github.io/chuyue-secret-base/blog/music/review/laufey-bewitched/',
      image: 'https://irondumpling.github.io/chuyue-secret-base/share/og/blog/music/review/laufey-bewitched.jpg',
      author: { '@type': 'Person', name: 'Chuyue Zhang' },
    })
  })

  it('describes a portfolio project as CreativeWork', () => {
    const data = buildJsonLd({ kind: 'portfolio', category: 'applications', slug: 'pact' }, { title: 'PA:CT', body: 'x' })
    expect(data['@type']).toBe('CreativeWork')
    expect(data.name).toBe('PA:CT')
    expect(data.datePublished).toBeUndefined()
  })
})

describe('serializeJsonLd', () => {
  it('escapes < so a title cannot close the script tag', () => {
    const out = serializeJsonLd({ headline: '</script><script>alert(1)</script>' })
    expect(out).not.toContain('<')
    expect(JSON.parse(out).headline).toBe('</script><script>alert(1)</script>')
  })
})
```

- [ ] **Step 2: Run to verify it fails**

Run: `npx vitest run lib/jsonld.test.ts`
Expected: FAIL, module not found.

- [ ] **Step 3: Implement `lib/jsonld.ts`**

```ts
import { absoluteUrl } from './site'
import { pagePath, shareImagePath, type ShareTarget } from './share-paths'
import { summarize } from './seo'

interface JsonLdInput {
  title: string
  description?: string
  body: string
  date?: string
}

export function buildJsonLd(target: ShareTarget, o: JsonLdInput): Record<string, any> {
  const url = absoluteUrl(pagePath(target))
  const published = o.date ? new Date(o.date) : undefined
  const datePublished = published && !Number.isNaN(published.getTime()) ? published.toISOString() : undefined
  const isBlog = target.kind === 'blog'

  return {
    '@context': 'https://schema.org',
    '@type': isBlog ? 'BlogPosting' : 'CreativeWork',
    ...(isBlog ? { headline: o.title } : { name: o.title }),
    description: summarize(o.description, o.body),
    image: absoluteUrl(shareImagePath(target, 'og')),
    mainEntityOfPage: url,
    url,
    ...(datePublished ? { datePublished } : {}),
    author: { '@type': 'Person', name: 'Chuyue Zhang' },
  }
}

export function serializeJsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, '\\u003c')
}
```

- [ ] **Step 4: Run to verify it passes**

Run: `npx vitest run lib/jsonld.test.ts`
Expected: PASS, 3 tests.

- [ ] **Step 5: Create the component and use it**

Create `components/shared/JsonLd.tsx`:
```tsx
import { serializeJsonLd } from '@/lib/jsonld'

export default function JsonLd({ data }: { data: unknown }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(data) }} />
}
```
In `app/blog/[category]/[type]/[slug]/page.tsx` add imports `JsonLd` and `buildJsonLd`, and render as the first child of `<article ...>`:
```tsx
      <JsonLd
        data={buildJsonLd(
          { kind: 'blog', category: post.frontMatter.category, type: post.frontMatter.type, slug: post.slug },
          { title: post.frontMatter.title, description: post.frontMatter.description, body: post.content, date: String(post.frontMatter.date) }
        )}
      />
```
Do the same in `app/portfolio/[category]/[slug]/page.tsx` with `kind: 'portfolio'` (read the file and use its variable names).

- [ ] **Step 4b: Build and check**

Run the production build command, then
```bash
grep -o '<script type="application/ld+json">[^<]*' out/blog/films-shows/review/her-review/index.html | head -c 600
```
Expected: a JSON object with `"@type":"BlogPosting"`. Paste one deployed URL into Google's Rich Results Test (`search.google.com/test/rich-results`) after deploy; expected: no errors on the BlogPosting item.

- [ ] **Step 5b: Commit**

```bash
git add lib/jsonld.ts lib/jsonld.test.ts components/shared/JsonLd.tsx "app/blog/[category]/[type]/[slug]/page.tsx" "app/portfolio/[category]/[slug]/page.tsx"
git commit -m "feat: json-ld structured data for posts and projects"
```

---

### Task 3: Analytics (opt-in)

**Files:**
- Create: `components/shared/Analytics.tsx`
- Modify: `app/layout.tsx`, `.github/workflows/deploy.yml`

**Interfaces:**
- Produces: `<Analytics />` renders nothing unless `NEXT_PUBLIC_CF_ANALYTICS_TOKEN` is set at build time.

- [ ] **Step 1: Create the component**

Create `components/shared/Analytics.tsx`:
```tsx
import Script from 'next/script'

export default function Analytics() {
  const token = process.env.NEXT_PUBLIC_CF_ANALYTICS_TOKEN
  if (!token) return null

  return (
    <Script
      src="https://static.cloudflareinsights.com/beacon.min.js"
      strategy="afterInteractive"
      data-cf-beacon={JSON.stringify({ token })}
    />
  )
}
```

- [ ] **Step 2: Add it to the layout**

In `app/layout.tsx` import `Analytics from '@/components/shared/Analytics'` and render `<Analytics />` as the last child inside `<body>`, after `<Footer />`.

- [ ] **Step 3: Pass the token in CI**

In `.github/workflows/deploy.yml`, under the Build step's `env:` block add:
```yaml
          NEXT_PUBLIC_CF_ANALYTICS_TOKEN: ${{ vars.CF_ANALYTICS_TOKEN }}
```
(An unset variable expands to an empty string, which the component treats as "off".)

- [ ] **Step 4: Verify both states**

Run the production build command with no token, then `grep -c cloudflareinsights out/index.html`. Expected: `0`. Rebuild with the token set:
```bash
MSYS_NO_PATHCONV=1 NEXT_PUBLIC_BASE_PATH=/chuyue-secret-base NEXT_PUBLIC_CF_ANALYTICS_TOKEN=test123 npm run build
grep -c cloudflareinsights out/index.html
```
Expected: `1` or more, and the page source contains `"token":"test123"`. Rebuild once more without the token so no test value stays in `out/`.

- [ ] **Step 5: Owner steps to switch it on (manual)**

1. In Cloudflare, create a free account and open Web Analytics, add a site, choose the JavaScript snippet option (the site is not hosted on Cloudflare), and copy the `token` value from the snippet.
2. In this repository on GitHub: Settings > Secrets and variables > Actions > Variables > New repository variable, name `CF_ANALYTICS_TOKEN`, value the token.
3. Re-run the "Deploy to GitHub Pages" workflow. Expected: visits appear in Cloudflare within a few minutes. If you prefer no Cloudflare account, GoatCounter is a drop-in alternative: replace the `Script` `src`/attributes with GoatCounter's snippet and rename the variable.

- [ ] **Step 6: Commit**

```bash
git add components/shared/Analytics.tsx app/layout.tsx .github/workflows/deploy.yml
git commit -m "feat: opt-in cloudflare web analytics"
```

## Self-Review

- **Spec coverage:** RSS (Task 1), structured data per post (Task 2), visit statistics (Task 3). Sitemap and robots already exist and were updated in plan 02; the external plan's "sync to Xiaohongshu/ins" step is manual and not built here.
- **Placeholders:** none. The token value is an owner input in Task 3 step 5.
- **Type consistency:** `FeedItem`, `buildRss`, `escapeXml`, `rssAlternate`, `buildJsonLd`, `serializeJsonLd` are named the same in tests, implementation and usage. `buildJsonLd` and `buildPageMetadata` take the same `{title, description, body, date}` input shape.
- **Ordering note:** Task 1 step 6 edits files created by plan 02; do plan 02 first.
