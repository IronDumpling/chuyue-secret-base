# Share Poster and Share Buttons Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Every blog post and portfolio project gets a build-time-generated portrait poster (1080x1920 JPEG, one per post per language) with cover image, category/rating badge, title, summary, brand line and a QR code to the canonical page, plus a client-side `ShareBar` (Copy Link, Save Poster, native Web Share) rendered on both detail pages.

**Architecture:** Reuses the dimension-agnostic renderer from the OG-card plan (`scripts/lib/card.ts`: `h`, `renderJpeg`, `coverDataUri`, now also `clip`). A new sibling `scripts/lib/poster.ts` holds the portrait-specific tree (`buildPosterTree`) and QR generation (`qrDataUri`, via the new `qrcode` dependency). `scripts/generate-share-images.ts` is extended (not duplicated) to also write one poster per `(entry, lang)` pair, reusing the same content collection and CJK font load it already does for OG cards, to `shareImagePath(entry, 'poster', lang)`. On the client, `lib/share.ts` is a pure, browser-free helper that builds the canonical URL, poster path and download filename for a given target/locale; `components/shared/ShareBar.tsx` is a `'use client'` component that only reads those props and touches `navigator.clipboard`/`navigator.share` — it does no image work in the browser, so behavior is identical on every device.

**Tech Stack:** satori, @resvg/resvg-js, sharp, qrcode (new), React client component, vitest.

**Spec:** `docs/superpowers/plans/2026-09-20-00-priorities-and-roadmap.md`

## Why this replaces the original version of this plan

The version of this file written 2026-09-20 predates the taxonomy restructure and the i18n plan and no longer matches the repo:
- It targeted `app/blog/[category]/[type]/[slug]/page.tsx` and `app/portfolio/[category]/[slug]/page.tsx` (no `[lang]` segment, and a `type` folder level that no longer exists). Both detail pages now live under `app/[lang]/blog/[category]/[slug]/page.tsx` and `app/[lang]/portfolio/[category]/[slug]/page.tsx`.
- Its example category `films-shows` doesn't exist; categories are flat (`films`, `shows`, `music`, `video-games`, `books`, ...), per `lib/taxonomy.ts`.
- `pagePath`/`shareImagePath` now take a `lang` parameter and posters are per-locale — the old plan generated one poster per entry, not one per entry per language.
- `getShareProps`'s old signature (`target`, `title`) couldn't express "which language's poster/URL", which this repo's bilingual model requires.
- `ShareTarget` construction at the call sites (`{ kind, category: post.frontMatter.category, slug: post.slug }`) already matches `buildPageMetadata`'s usage one-for-one; the old plan invented a different shape (`type` field).

## Global Constraints

- Requires the OG-card plan already implemented (`lib/site.ts`, `lib/share-paths.ts`, `scripts/lib/card.ts`, `scripts/lib/fonts.ts`, `scripts/lib/card-texts.ts`, `scripts/lib/content-index.ts`, `scripts/generate-share-images.ts` all exist) and the i18n plan (`lib/i18n/*`, `LocaleProvider`).
- Poster size 1080x1920, JPEG. Generated into `public/share/poster/<lang>/<kind>/<category>/<slug>.jpg` (path already decided by `shareImagePath`, unchanged). `.gitignore` already covers `/public/share/` — no change needed there.
- One poster per **(content entry, language)** pair — every post/project × `en` and `zh`, same fallback semantics as OG cards (a post without a Chinese `.mdx` still gets a `/zh/...` poster, rendered with the English text, because `collectContent(contentDir, 'zh')` already returns the English entry marked `isFallback: true`).
- The QR code encodes `absoluteUrl(pagePath(entry, lang))` — the canonical URL for *that* language's page, with base path and trailing slash.
- No component test infrastructure exists for `.tsx` files in this repo (`vitest.config.ts` only covers `lib/**`/`scripts/**`, node environment, no jsdom/RTL). `ShareBar.tsx` therefore gets no automated unit test, matching every other client component here (`ListBackLink`, `SocialLinkItem`, `FallbackNotice`). All new *logic* (poster tree builder, QR data URI, URL/filename builder, dictionary shape) is pure and does get vitest coverage.
- Do not add any runtime dependency to the client bundle — `qrcode` and `@types/qrcode` are devDependencies only, used exclusively by the build script.
- Share bar labels come from the dictionary (this repo's convention — no hardcoded English UI strings).
- Production build command (Git Bash): `MSYS_NO_PATHCONV=1 NEXT_PUBLIC_BASE_PATH=/chuyue-secret-base npm run build`
- Work on branch `feat/share-poster`, off `main`.

## File Structure

- Modify `scripts/lib/card.ts`: export the existing `clip` helper (currently private) for reuse by the poster tree.
- Create `scripts/lib/poster.ts`, `scripts/lib/poster.test.ts`: `buildPosterTree`, `qrDataUri`, `PosterInput`.
- Modify `scripts/generate-share-images.ts`: also write one poster per entry × locale.
- Modify `lib/i18n/dictionaries/en.ts`, `lib/i18n/dictionaries/zh.ts`: add a `share` section.
- Create `lib/share.ts`, `lib/share.test.ts`: `getShareProps`.
- Create `components/shared/ShareBar.tsx`.
- Modify `app/[lang]/blog/[category]/[slug]/page.tsx`, `app/[lang]/portfolio/[category]/[slug]/page.tsx`: render the bar.
- Modify `package.json`, `package-lock.json` (new devDependencies `qrcode`, `@types/qrcode`).
- Modify `docs/superpowers/plans/2026-09-20-04-share-poster.md` (this file — Task 0).

---

### Task 0: Replace the stale plan doc

**Files:**
- Modify: `docs/superpowers/plans/2026-09-20-04-share-poster.md`

- [ ] **Step 1: Overwrite the file**

Replace the entire contents of this file with this plan document (already done as part of writing it).

- [ ] **Step 2: Commit**

```bash
git add docs/superpowers/plans/2026-09-20-04-share-poster.md
git commit -m "docs: rewrite stale share-poster plan for i18n and taxonomy restructure"
```

---

### Task 1: Poster renderer with a QR code

**Files:**
- Modify: `scripts/lib/card.ts`
- Create: `scripts/lib/poster.ts`
- Test: `scripts/lib/poster.test.ts`
- Modify: `package.json`, `package-lock.json`

**Interfaces:**
- Consumes: `h`, `Node`, `renderJpeg`, `coverDataUri`, `clip` from `./card`.
- Produces:
  - `interface PosterInput { title: string; badge?: string; description?: string; coverDataUri?: string; qrDataUri: string; brand: string; scanLine: string }`
  - `buildPosterTree(input: PosterInput): Node`
  - `qrDataUri(url: string): Promise<string>` (PNG data URI)

`brand`/`scanLine` are passed in fully localized (e.g. `"Chuyue · System Designer"` / `"楚岳 · 系统设计师"` and `"Scan to read · irondumpling.github.io"` / `"扫码阅读 · irondumpling.github.io"`) rather than hardcoded in the renderer, so `poster.ts` stays free of `getDictionary` and i18n concerns — the caller (Task 2) resolves the text per language.

- [ ] **Step 1: Install QR dependencies**

Run: `npm install --save-dev qrcode @types/qrcode`

- [ ] **Step 2: Write the failing tests**

Create `scripts/lib/poster.test.ts`:
```ts
import { describe, it, expect } from 'vitest'
import fs from 'fs'
import os from 'os'
import path from 'path'
import sharp from 'sharp'
import { renderJpeg, coverDataUri } from './card'
import { loadLatinFallback } from './fonts'
import { buildPosterTree, qrDataUri } from './poster'

const BRAND = 'Chuyue · System Designer'
const SCAN_LINE = 'Scan to read · irondumpling.github.io'

describe('poster renderer', () => {
  it('makes a scannable-size QR data uri', async () => {
    const uri = await qrDataUri('https://irondumpling.github.io/chuyue-secret-base/en/blog/films/her-review/')
    expect(uri).toMatch(/^data:image\/png;base64,/)
    const meta = await sharp(Buffer.from(uri.split(',')[1], 'base64')).metadata()
    expect(meta.width).toBeGreaterThanOrEqual(400)
  })

  it('renders a 1080x1920 portrait jpeg without a cover', async () => {
    const qr = await qrDataUri('https://example.com/en/blog/films/her-review/')
    const tree = buildPosterTree({
      title: 'Her Review',
      badge: 'Reviews · Films · 8/10',
      description: 'The most underrated sci-fi film of the decade',
      qrDataUri: qr,
      brand: BRAND,
      scanLine: SCAN_LINE,
    })
    const jpeg = await renderJpeg(tree, 1080, 1920, [loadLatinFallback()])
    const meta = await sharp(jpeg).metadata()
    expect(meta.format).toBe('jpeg')
    expect(meta.width).toBe(1080)
    expect(meta.height).toBe(1920)
  })

  it('renders with a cover image behind the top square', async () => {
    const cover = await sharp({ create: { width: 1600, height: 1600, channels: 3, background: '#cc6633' } })
      .jpeg()
      .toBuffer()
    const file = path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'poster-cover-')), 'cover.jpg')
    fs.writeFileSync(file, cover)

    const uri = await coverDataUri(file, 1080, 1080)
    const qr = await qrDataUri('https://example.com/en/blog/films/her-review/')
    const jpeg = await renderJpeg(
      buildPosterTree({ title: 'With cover', qrDataUri: qr, coverDataUri: uri, brand: BRAND, scanLine: SCAN_LINE }),
      1080,
      1920,
      [loadLatinFallback()]
    )
    const meta = await sharp(jpeg).metadata()
    expect(meta.width).toBe(1080)
    expect(meta.height).toBe(1920)
  })
})
```

- [ ] **Step 3: Run to verify it fails**

Run: `npx vitest run scripts/lib/poster.test.ts`
Expected: FAIL — `Cannot find module './poster'`.

- [ ] **Step 4: Implement**

In `scripts/lib/card.ts`, change `function clip(text: string, max: number): string {` to `export function clip(text: string, max: number): string {` (only that one line changes; nothing else in the file changes, and `card.test.ts` still passes since it never imported `clip` directly).

Create `scripts/lib/poster.ts`:
```ts
import QRCode from 'qrcode'
import { h, clip, type Node } from './card'

export interface PosterInput {
  title: string
  badge?: string
  description?: string
  coverDataUri?: string
  qrDataUri: string
  brand: string
  scanLine: string
}

const WIDTH = 1080
const HEIGHT = 1920
const COVER = 1080

export async function qrDataUri(url: string): Promise<string> {
  return QRCode.toDataURL(url, { margin: 1, width: 440, color: { dark: '#0f172a', light: '#ffffff' } })
}

export function buildPosterTree(input: PosterInput): Node {
  const cover = input.coverDataUri
    ? h('img', { src: input.coverDataUri, width: WIDTH, height: COVER, style: { width: WIDTH, height: COVER } })
    : h('div', {
        style: {
          display: 'flex',
          width: WIDTH,
          height: COVER,
          backgroundImage: 'linear-gradient(135deg, #1e3a8a, #0f172a)',
        },
      })

  return h(
    'div',
    {
      style: {
        display: 'flex',
        flexDirection: 'column',
        width: WIDTH,
        height: HEIGHT,
        backgroundColor: '#0f172a',
        color: 'white',
      },
    },
    cover,
    h(
      'div',
      { style: { display: 'flex', flexDirection: 'column', flexGrow: 1, padding: '56px 72px 64px 72px' } },
      input.badge
        ? h('div', { style: { display: 'flex', fontSize: 32, opacity: 0.85, marginBottom: 20 } }, input.badge)
        : null,
      h('div', { style: { display: 'flex', fontSize: 68, fontWeight: 700, lineHeight: 1.25 } }, clip(input.title, 36)),
      input.description
        ? h(
            'div',
            { style: { display: 'flex', fontSize: 32, lineHeight: 1.5, opacity: 0.75, marginTop: 24 } },
            clip(input.description, 90)
          )
        : null,
      h('div', { style: { display: 'flex', flexGrow: 1 } }),
      h(
        'div',
        { style: { display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' } },
        h(
          'div',
          { style: { display: 'flex', flexDirection: 'column' } },
          h('div', { style: { display: 'flex', fontSize: 36, fontWeight: 700 } }, input.brand),
          h('div', { style: { display: 'flex', fontSize: 26, opacity: 0.7, marginTop: 10 } }, input.scanLine)
        ),
        h(
          'div',
          { style: { display: 'flex', padding: 12, backgroundColor: 'white', borderRadius: 16 } },
          h('img', { src: input.qrDataUri, width: 200, height: 200, style: { width: 200, height: 200 } })
        )
      )
    )
  )
}
```
The `clip(title, 36)` / `clip(description, 90)` character caps are a starting point tuned for the ~936px content width (1080 minus 72px side padding) at these font sizes — eyeball and adjust in Task 2 Step 2 (no test asserts exact text length, only image dimensions, so this is safe to retune without touching tests).

- [ ] **Step 5: Run to verify it passes**

Run: `npx vitest run scripts/lib/poster.test.ts scripts/lib/card.test.ts`
Expected: PASS, 3 + 3 tests.

- [ ] **Step 6: Commit**

```bash
git add package.json package-lock.json scripts/lib/card.ts scripts/lib/poster.ts scripts/lib/poster.test.ts
git commit -m "feat: poster renderer with qr code"
```

---

### Task 2: Generate posters at build time, per language

**Files:**
- Modify: `scripts/generate-share-images.ts`

**Interfaces:**
- Consumes: `buildPosterTree`, `qrDataUri` (Task 1), `absoluteUrl`, `siteOrigin` from `lib/site.ts`, `pagePath`, `shareImagePath` from `lib/share-paths.ts`, `summarize` from `lib/seo.ts`, `getDictionary`.
- Produces: `public/share/poster/<lang>/<kind>/<category>/<slug>.jpg` for every content entry × every locale.

- [ ] **Step 1: Extend the generator (do Task 3 first so `share.scanToRead` exists)**

In `scripts/generate-share-images.ts`:

Update the import from `../lib/share-paths` to add `pagePath`:
```ts
import { pagePath, shareImagePath, siteOgPath } from '../lib/share-paths'
```
Add new imports:
```ts
import { buildPosterTree, qrDataUri } from './lib/poster'
import { absoluteUrl, siteOrigin } from '../lib/site'
import { summarize } from '../lib/seo'
import type { ContentEntry } from './lib/content-index'
```

Add a helper above `main`:
```ts
function posterDescription(entry: ContentEntry): string {
  return summarize(entry.description, entry.body, 90)
}
```

Include poster-only text (the localized "scan to read" line) in the font subset. Change the `allText` block to:
```ts
  const allText = perLang
    .flatMap(({ lang, entries }) => [
      ...Object.values(siteTexts(lang)),
      getDictionary(lang).share.scanToRead,
      ...entries.flatMap(entry => [...Object.values(entryTexts(entry, lang)), posterDescription(entry)]),
    ])
    .join('')
```

Clear the poster directory alongside the og one:
```ts
  fs.rmSync(path.join(PUBLIC_DIR, 'share', 'og'), { recursive: true, force: true })
  fs.rmSync(path.join(PUBLIC_DIR, 'share', 'poster'), { recursive: true, force: true })
```

Compute the display host once, before the loop:
```ts
  const host = new URL(siteOrigin()).host
```

Inside the `for (const entry of entries)` loop, after the existing og-card `writeCard` call, add:
```ts
      const posterCover = await coverDataUri(coverFile(entry.images), 1080, 1080)
      const qr = await qrDataUri(absoluteUrl(pagePath(entry, lang)))
      const poster = buildPosterTree({
        title,
        badge,
        description: posterDescription(entry),
        coverDataUri: posterCover,
        qrDataUri: qr,
        brand: siteTexts(lang).footer,
        scanLine: `${getDictionary(lang).share.scanToRead} · ${host}`,
      })
      writeTo(shareImagePath(entry, 'poster', lang), await renderJpeg(poster, 1080, 1920, fonts))
      written += 1
```

Update the final log line to report both og cards and posters written.

- [ ] **Step 2: Generate and inspect**

Run: `MSYS_NO_PATHCONV=1 NEXT_PUBLIC_BASE_PATH=/chuyue-secret-base npm run generate:share`
Expected: log line reporting entries × 2 locales × 2 (og + poster), plus 2 site cards. Confirm the entry count first with `find content/blog content/portfolio -iname "*.mdx" | sed -E 's/\.(en|zh)\.mdx$//' | sort -u | wc -l`.

View a generated poster with the Read tool, e.g. `public/share/poster/en/blog/films/her-review.jpg`: cover on top, badge, title, description, brand line + "Scan to read · irondumpling.github.io" bottom-left, white QR box bottom-right. Check one Chinese poster too, e.g. `public/share/poster/zh/blog/films/her-review.jpg` (if no `.zh.mdx` exists, it renders from the English fallback content — confirm it still reads sensibly rather than mixing scripts). Check a post/project with no `images` frontmatter to confirm the gradient fallback renders instead of a broken image.

Decode a QR to confirm it encodes the right per-language URL:
```bash
npx tsx -e "
import { absoluteUrl } from './lib/site'
import { pagePath } from './lib/share-paths'
console.log(absoluteUrl(pagePath({ kind: 'blog', category: 'films', slug: 'her-review' }, 'en')))
console.log(absoluteUrl(pagePath({ kind: 'blog', category: 'films', slug: 'her-review' }, 'zh')))
"
```
Expected: `https://irondumpling.github.io/chuyue-secret-base/en/blog/films/her-review/` and the `/zh/` equivalent. Scan the two posters' QR codes with a phone camera and confirm the address shown matches (the site need not be deployed yet — just confirm the decoded URL text).

- [ ] **Step 3: Check total output size**

Run: `du -sh public/share/poster public/share/og`
Expected: posters roughly 150-400 KB each; total poster directory in the tens of MB. Git-ignored generated output, only affects the deployed `out/` artifact size — no meaningful concern at this scale.

- [ ] **Step 4: Commit**

```bash
git add scripts/generate-share-images.ts
git commit -m "feat: generate per-language share posters with qr codes"
```

---

### Task 3: Dictionary additions (`share` section)

**Files:**
- Modify: `lib/i18n/dictionaries/en.ts`, `lib/i18n/dictionaries/zh.ts`

**Interfaces:**
- Produces: `Dictionary['share'] = { copyLink: string; copied: string; savePoster: string; shareButton: string; scanToRead: string }`

`scanToRead` is used only by the build script (Task 2, poster's bottom-left second line); the other four are used by `ShareBar.tsx` (Task 5).

- [ ] **Step 1: Add to `en.ts`**

```ts
  share: {
    copyLink: 'Copy Link',
    copied: 'Copied!',
    savePoster: 'Save Poster',
    shareButton: 'Share',
    scanToRead: 'Scan to read',
  },
```

- [ ] **Step 2: Add the matching Chinese shape to `zh.ts`**

```ts
  share: {
    copyLink: '复制链接',
    copied: '已复制！',
    savePoster: '保存海报',
    shareButton: '分享',
    scanToRead: '扫码阅读',
  },
```

- [ ] **Step 3: Verify**

Run: `npx vitest run lib/i18n/dictionaries.test.ts`
Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add lib/i18n/dictionaries/en.ts lib/i18n/dictionaries/zh.ts
git commit -m "feat: add share dictionary section"
```

---

### Task 4: `lib/share.ts` — URL/filename helper

**Files:**
- Create: `lib/share.ts`
- Test: `lib/share.test.ts`

**Interfaces:**
- Consumes: `absoluteUrl` from `./site`, `pagePath`, `shareImagePath`, `ShareTarget` from `./share-paths`, `Locale` from `./i18n/config`.
- Produces: `getShareProps(target: ShareTarget, lang: Locale, title: string, description?: string): { title: string; description?: string; url: string; posterPath: string; filename: string }` (`posterPath` is site-relative, no base path — `ShareBar` applies `withBasePath` itself, matching `SafeImage`'s convention).

- [ ] **Step 1: Write the failing test**

Create `lib/share.test.ts`:
```ts
import { describe, it, expect, afterEach, vi } from 'vitest'
import { getShareProps } from './share'

afterEach(() => vi.unstubAllEnvs())

describe('getShareProps', () => {
  it('builds the canonical url, poster path and a download filename for a locale', () => {
    vi.stubEnv('NEXT_PUBLIC_BASE_PATH', '/chuyue-secret-base')
    const props = getShareProps(
      { kind: 'blog', category: 'films', slug: 'her-review' },
      'en',
      'Her Review',
      'A quiet, devastating sci-fi romance.'
    )
    expect(props).toEqual({
      title: 'Her Review',
      description: 'A quiet, devastating sci-fi romance.',
      url: 'https://irondumpling.github.io/chuyue-secret-base/en/blog/films/her-review/',
      posterPath: '/share/poster/en/blog/films/her-review.jpg',
      filename: 'her-review-en-poster.jpg',
    })
  })

  it('keys the poster path, url and filename by locale, and tolerates no description', () => {
    vi.stubEnv('NEXT_PUBLIC_BASE_PATH', '/chuyue-secret-base')
    const props = getShareProps({ kind: 'portfolio', category: 'applications', slug: 'pact' }, 'zh', 'PACT')
    expect(props.url).toBe('https://irondumpling.github.io/chuyue-secret-base/zh/portfolio/applications/pact/')
    expect(props.posterPath).toBe('/share/poster/zh/portfolio/applications/pact.jpg')
    expect(props.filename).toBe('pact-zh-poster.jpg')
    expect(props.description).toBeUndefined()
  })
})
```
(Adjust the portfolio category/slug in the second test to a real one if `applications`/`pact` don't exist — check `content/portfolio/` first.)

- [ ] **Step 2: Run to verify it fails**

Run: `npx vitest run lib/share.test.ts`
Expected: FAIL — `Cannot find module './share'`.

- [ ] **Step 3: Implement**

Create `lib/share.ts`:
```ts
import type { Locale } from './i18n/config'
import { absoluteUrl } from './site'
import { pagePath, shareImagePath, type ShareTarget } from './share-paths'

export interface ShareProps {
  title: string
  description?: string
  url: string
  posterPath: string
  filename: string
}

export function getShareProps(
  target: ShareTarget,
  lang: Locale,
  title: string,
  description?: string
): ShareProps {
  return {
    title,
    description,
    url: absoluteUrl(pagePath(target, lang)),
    posterPath: shareImagePath(target, 'poster', lang),
    filename: `${target.slug}-${lang}-poster.jpg`,
  }
}
```

- [ ] **Step 4: Run to verify it passes**

Run: `npx vitest run lib/share.test.ts`
Expected: PASS, 2 tests.

- [ ] **Step 5: Commit**

```bash
git add lib/share.ts lib/share.test.ts
git commit -m "feat: share url and poster-path helper"
```

---

### Task 5: `ShareBar` client component

**Files:**
- Create: `components/shared/ShareBar.tsx`

No test file — see Global Constraints (no component test infra in this repo). Verified by Task 7 (build + manual/dev-server check).

- [ ] **Step 1: Implement**

Create `components/shared/ShareBar.tsx`:
```tsx
'use client'

import { useEffect, useState } from 'react'
import { useT } from '@/components/shared/LocaleProvider'
import { withBasePath } from '@/lib/utils'

interface ShareBarProps {
  title: string
  description?: string
  url: string
  posterPath: string
  filename: string
}

const buttonClass = 'button-secondary inline-flex items-center gap-2 text-sm'

function LinkIcon() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.19 8.69a4.5 4.5 0 011.24 7.24l-4.5 4.5a4.5 4.5 0 01-6.37-6.36l1.76-1.76M10.81 15.31a4.5 4.5 0 01-1.24-7.24l4.5-4.5a4.5 4.5 0 016.37 6.36l-1.76 1.76" />
    </svg>
  )
}

function DownloadIcon() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5 5-5M12 15V3" />
    </svg>
  )
}

function ShareIcon() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.68 13.34a3 3 0 100-2.68m0 2.68l6.64 3.32m-6.64-6l6.64-3.32m0 0a3 3 0 105.37-2.68 3 3 0 00-5.37 2.68zm0 8a3 3 0 105.37 2.68 3 3 0 00-5.37-2.68z" />
    </svg>
  )
}

// Copy Link, Save Poster (a pre-generated static jpg — no client-side rendering) and
// native Web Share (feature-detected; not every browser has it, mainly desktop).
export default function ShareBar({ title, description, url, posterPath, filename }: ShareBarProps) {
  const t = useT()
  const [copied, setCopied] = useState(false)
  const [canShare, setCanShare] = useState(false)

  // navigator.share only exists on some browsers; decide after mount so the server-rendered
  // and first client-rendered HTML stay identical.
  useEffect(() => {
    setCanShare(typeof navigator !== 'undefined' && typeof navigator.share === 'function')
  }, [])

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      window.prompt(t.share.copyLink, url)
    }
  }

  const systemShare = async () => {
    try {
      await navigator.share({ title, text: description, url })
    } catch {
      // user cancelled the share sheet, or the call was rejected; nothing to do
    }
  }

  return (
    <div className="flex flex-wrap gap-3 mb-8" aria-label={t.share.shareButton}>
      <button type="button" onClick={copyLink} className={buttonClass}>
        <LinkIcon />
        {copied ? t.share.copied : t.share.copyLink}
      </button>
      {/* Same-origin static asset, so `download` works on desktop and Android. iOS Safari
          ignores the download attribute and opens the image in a new tab instead, where a
          long press saves it — that's why this also opens in a new tab everywhere. */}
      <a
        href={withBasePath(posterPath)}
        download={filename}
        target="_blank"
        rel="noopener noreferrer"
        className={buttonClass}
      >
        <DownloadIcon />
        {t.share.savePoster}
      </a>
      {canShare && (
        <button type="button" onClick={systemShare} className={buttonClass}>
          <ShareIcon />
          {t.share.shareButton}
        </button>
      )}
    </div>
  )
}
```
Icon paths above are illustrative placeholders in the repo's existing `w-5 h-5` stroke-SVG convention (see `LinkButtons` in the portfolio detail page) — swap for any consistent icon set during implementation; nothing depends on their exact geometry.

- [ ] **Step 2: Type-check**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add components/shared/ShareBar.tsx
git commit -m "feat: share bar with copy link, save poster and web share"
```

---

### Task 6: Wire `ShareBar` into both detail pages

**Files:**
- Modify: `app/[lang]/blog/[category]/[slug]/page.tsx`
- Modify: `app/[lang]/portfolio/[category]/[slug]/page.tsx`

Natural slot on both pages: right after the header block (back link + `h1` + date/category/rating row's closing `</div>`), before the `{/* Header Image */}` comment.

- [ ] **Step 1: Blog detail page**

Add imports:
```tsx
import ShareBar from '@/components/shared/ShareBar'
import { getShareProps } from '@/lib/share'
import { summarize } from '@/lib/seo'
```
Insert immediately before the `{/* Header Image */}` comment:
```tsx
        <ShareBar
          {...getShareProps(
            { kind: 'blog', category: post.frontMatter.category, slug: post.slug },
            params.lang,
            post.frontMatter.title,
            summarize(post.frontMatter.description, post.content)
          )}
        />
```

- [ ] **Step 2: Portfolio detail page**

Same two imports plus `summarize`, inserted before its `{/* Header Image */}` comment:
```tsx
        <ShareBar
          {...getShareProps(
            { kind: 'portfolio', category: project.frontMatter.category, slug: project.slug },
            params.lang,
            project.frontMatter.title,
            summarize(project.frontMatter.description, project.content)
          )}
        />
```
No special-casing needed for `art`-group categories (`photography`, `illustration`): the poster and `ShareBar` never render `github`/`demo`/`website` links (only cover, badge, title, description, QR) — that's a separate, untouched `LinkButtons` block further down the page.

- [ ] **Step 3: Type-check**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add "app/[lang]/blog/[category]/[slug]/page.tsx" "app/[lang]/portfolio/[category]/[slug]/page.tsx"
git commit -m "feat: render share bar on blog and portfolio detail pages"
```

---

### Task 7: Full verification

**Files:** none changed unless a check fails.

- [ ] **Step 1: Full test suite**

Run: `npx vitest run`
Expected: all pass, including the new `scripts/lib/poster.test.ts`, `lib/share.test.ts`, and unchanged `lib/i18n/dictionaries.test.ts`, `scripts/lib/card.test.ts`.

- [ ] **Step 2: Type-check**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Production build**

Run: `MSYS_NO_PATHCONV=1 NEXT_PUBLIC_BASE_PATH=/chuyue-secret-base npm run build`
Expected: `prebuild` runs `sync:content`, `generate:about`, `generate:share` (now producing posters too), `generate:cms`, then `next build` exports the static site. No page count regression vs. the pre-change build.

Then:
```bash
find out/share/poster -name '*.jpg' | wc -l
grep -o 'href="[^"]*poster[^"]*"' out/en/blog/films/her-review/index.html
grep -o 'href="[^"]*poster[^"]*"' out/zh/blog/films/her-review/index.html
ls out/share/poster/en/blog/films/
```
Expected: the poster count matches `entries × 2 locales`; the two `grep -o` calls each print an `href` containing `/chuyue-secret-base/share/poster/en/blog/films/her-review.jpg` and the `/zh/` equivalent (confirming the base path is correctly baked into the anchor and each language's page points at its own poster); the poster file exists on disk in `out/`.

- [ ] **Step 4: Visual check of a generated poster (automatable)**

Use the Read tool to view `out/share/poster/en/blog/films/her-review.jpg` and `out/share/poster/zh/blog/films/her-review.jpg` directly. Confirm: cover image (or gradient) fills the top ~56%, badge/title/description are legible and not obviously clipped mid-word, QR box is white and bottom-right, brand + scan line bottom-left, no CJK tofu glyphs on the zh poster.

- [ ] **Step 5: Manual browser check (human in the loop)**

Serve the `out/` export (or `npm run dev`, though `[lang]` pages there hit the unrelated pre-existing dev-mode `generateStaticParams` limitation noted in plan 03 — prefer serving the static export), open an `en` and a `zh` blog post and a portfolio project in a desktop browser and, if available, a phone:
- Copy Link: clicking puts the canonical `/en/...` or `/zh/...` URL on the clipboard, and the button label flips to "Copied!"/"已复制！" for ~2s.
- Save Poster: on desktop/Android, downloads the poster jpg with filename `<slug>-<lang>-poster.jpg`; on iOS Safari, opens the poster image in a new tab (long-press-to-save is the expected fallback there — a documented browser limitation, not a bug).
- Share button: present only on browsers/devices with `navigator.share` (typically hidden on desktop Chrome/Firefox, present on Android Chrome and Safari); tapping it opens the OS share sheet pre-filled with title, description (as `text`) and URL.
- Scan a poster's QR code with a phone camera: it opens the exact canonical URL for that language.

- [ ] **Step 6: Acceptance check after deploy (manual, later)**

After the branch is merged and deployed: save a poster from the live site to a phone, post it to a WeChat Moments draft or Xiaohongshu draft, scan its QR with WeChat's in-app scanner. Expected: opens the live post.

## Self-Review

- **Spec coverage:** portrait poster with cover/badge/title/description/QR at the approved layout (Task 1-2); Copy Link + Save Poster + Web Share, Web-Share feature-detected (Task 5); every post and project × every language (Task 2, keyed by `shareImagePath(entry, 'poster', lang)`); wired into both detail pages at the agreed slot (Task 6).
- **Type consistency:** `PosterInput`/`buildPosterTree` (Task 1) → consumed by `generate-share-images.ts` (Task 2) with matching field names. `ShareProps`/`getShareProps` (Task 4) → spread directly onto `ShareBarProps` (Task 5), same five field names both places. `Dictionary['share']` keys (Task 3) match exactly what `ShareBar.tsx` (Task 5) and the generator (Task 2, `scanToRead` only) read.
- **Known limits:** no automated test for `ShareBar.tsx` itself (repo has no component-test infra); iOS Safari's `download`-attribute limitation is a documented browser behavior, not a defect; poster description/title clip lengths (36/90 chars) are a starting visual tuning, adjustable without touching any test.

## Decisions (resolved during design, not re-opened during implementation)

1. **`download`-attribute under `basePath`.** The poster `<a>` uses `withBasePath(posterPath)` — a same-origin, root-relative path, not an absolute URL. `download` is honored by Chrome/Firefox/Edge/Android Chrome. iOS Safari ignores `download` regardless of origin; handled by also setting `target="_blank"` so it opens in a new tab (long-press-to-save) instead of replacing the article page. No fetch+blob forced-download workaround — it would be the first client-side network/blob logic in this repo's share flow, for a browser where "long-press saves the opened image" is already an acceptable, common pattern.
2. **`navigator.share()` payload.** `{ title, text: description, url }`, where `description` is `summarize(frontMatter.description, content, 160)`-shaped text (already summarized/clipped by the caller, not the raw frontmatter string) to avoid some share targets cramming an unclipped description against the URL with no separator.
3. **Portfolio "art" category (`photography`, `illustration`).** No special-casing needed — poster/`ShareBar` never read `github`/`demo`/`website`, only `title`, `badge`, `description`, `images[0]`, and the canonical URL.
