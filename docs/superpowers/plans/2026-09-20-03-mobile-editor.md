# Mobile Editor (Sveltia CMS) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Let the owner write and publish Blog posts and Portfolio projects from a phone browser at `<site>/admin/`, with photos compressed on the phone before upload, and the change live 1-3 minutes later through the existing deploy workflow.

**Architecture:** Sveltia CMS is a static single-page app that talks to the GitHub API directly from the browser with a personal access token, so no server is needed. It edits the separate `chuyue-content` repository and commits to that repo's `main`, whose "Notify site" workflow triggers the site's `deploy.yml`. The admin page itself is still served by the site at `/admin/`; only its `backend.repo` points at the content repo, so the phone token never has access to site code. The CMS config is generated at build time from `lib/taxonomy.ts` (`getGroups`, `getCategories`) so the form always matches the folders the site reads — adding a category later is one line in the taxonomy, not a config edit. A small loader fix makes unquoted YAML dates safe, and the mixed link-field shapes in Portfolio frontmatter (`github`/`demo`/`website` as string, single object, or list) are normalized to one shape so the form can round-trip them safely.

**Tech Stack:** Sveltia CMS (`@sveltia/cms` npm package, self-hosted, currently `0.217.0`), `yaml`, vitest, tsx.

**Spec:** `docs/superpowers/plans/2026-09-20-00-priorities-and-roadmap.md`, [ADR 0001](../../adr/0001-taxonomy-leaf-is-folder-and-url.md)

## Why this replaces the original version of this plan

The original version of this file (written 2026-09-20, before the taxonomy restructure) does not match the repo anymore:
- It generated 12 collections from `categoryMap` x `typeMap` in `lib/blog-utils.ts`, at paths `blog/{category}/{type}/`. Both maps and the `type` folder level are gone; categories now come from `lib/taxonomy.ts` and live at `blog/{category}/` directly (ADR 0001).
- It assumed an un-suffixed `.mdx` file is English. Every content file now carries `.en.mdx` or `.zh.mdx` (bilingual plan 08), and the site's build validates the language of each (`scripts/lib/content-language.ts`).
- It excluded Portfolio because `github`/`demo` were sometimes a string and sometimes a list. That is fixed in Task 1 below (a `normalizeLinks` helper + a content-repo migration), so Portfolio is now in scope alongside Blog — 12 collections total (6 Blog categories + 6 Portfolio categories), owner decision 2026-09-21.

Fixed along the way: the taxonomy restructure moved 6 illustration posts from Blog (whose detail page renders an object-shaped `website` field) to Portfolio (whose detail page did not handle that shape), so their "View More" button stopped rendering. Task 1's link normalization fixes this as a side effect.

## Global Constraints

- Requires plan 08 (bilingual content: `slug.en.mdx` / `slug.zh.mdx`, English default) and the taxonomy restructure (ADR 0001: category = folder = URL segment, no `type` level, groups are menu-only).
- Requires plan 07 (vitest and tsx installed; content lives in the public repo `IronDumpling/chuyue-content`, cloned at `content/` in the site repo).
- Both Blog (6 categories) and Portfolio (6 categories) are in scope — 12 collections, generated from `lib/taxonomy.ts` so a new category needs no config change.
- The GitHub token is entered by the owner on the login screen and stored in that browser's local storage. It must never be committed, written into config, or added to CI.
- Use a fine-grained personal access token restricted to the `chuyue-content` repository only, with only "Contents: Read and write". It must not have access to the site repo.
- Paths inside the content repo (relative to that repo's root): posts at `blog/{category}/{slug}.{locale}.mdx` or `portfolio/{category}/{slug}.{locale}.mdx`; images at `images/{section}/{category}/`, referenced in frontmatter as `/images/{section}/{category}/file.webp` (no base path; `SafeImage` adds it). The site's sync step copies `images/` to `public/images/`.
- Frontmatter `date` stays a `YYYY-MM-DD` string in the runtime data; Portfolio's `github`/`demo`/`website` stay a `Link[]` (`{ url, label? }`) after loading. Blog's `website` field (string or `{url,label}`) is intentionally left alone — it is not part of this normalization.
- Sveltia i18n: `structure: 'multiple_files'`, `locales: ['en', 'zh']`, `default_locale: 'en'`, `initial_locales: ['en']`, file name pattern `{{slug}}.{{locale}}.mdx` — this matches the existing `.en.mdx`/`.zh.mdx` naming with no renaming needed.
- Repo for the CMS backend defaults to `IronDumpling/chuyue-content`. Override with env `CMS_REPO`.
- Production build command (Git Bash): `MSYS_NO_PATHCONV=1 NEXT_PUBLIC_BASE_PATH=/chuyue-secret-base npm run build`
- Another actor may be committing to the shared `content/` working tree concurrently: never run a blanket `git -C content checkout . && git -C content clean -fd` without first checking `git -C content status` for changes that are not yours.

## File Structure

- Create `lib/frontmatter.ts`, `lib/frontmatter.test.ts`: `normalizeFrontMatter`, `normalizeLinks`.
- Modify `lib/mdx.ts`, `lib/portfolio.ts`, `lib/portfolio-types.ts`, `app/[lang]/portfolio/[category]/[slug]/page.tsx`.
- Create `scripts/lib/cms-config.ts`, `scripts/lib/cms-config.test.ts`: pure `buildCmsConfig`.
- Create `scripts/generate-cms-config.ts`: writes `public/admin/config.yml`, `public/admin/index.html`, copies the CMS bundle.
- Modify `package.json` (deps, scripts), `.gitignore`, `app/robots.ts`, `README.md`.
- Content repo: migrate `github`/`demo`/`website` frontmatter to list form across `portfolio/**/*.mdx`; update `README.md`.

---

### Task 1: Normalize frontmatter dates and portfolio link fields (site)

Why: every existing post quotes its date (`date: "2026-01-04"`), but the CMS may write `date: 2026-01-04` unquoted. `gray-matter` parses an unquoted date into a JavaScript `Date`, while `BlogPost`/`PortfolioProject` declare `date: string` and `BlogList`/`ProjectGrid` (client components) receive the whole post from a server component — whether a `Date` survives that boundary is untested, so normalize at load time. Separately, Portfolio's `github`/`demo`/`website` fields are written three different ways across content (`grep` found ~47 occurrences across ~30 files: plain string, a single `{url,label}` object, or a list of them) which a form-based editor cannot safely read and write; normalize them all to `Link[]` at load time, and simplify the page that renders them.

**Files:**
- Create: `lib/frontmatter.ts`
- Test: `lib/frontmatter.test.ts`
- Modify: `lib/mdx.ts`, `lib/portfolio.ts`, `lib/portfolio-types.ts`, `app/[lang]/portfolio/[category]/[slug]/page.tsx`

**Interfaces:**
- Produces: `normalizeFrontMatter(data: Record<string, unknown>): Record<string, unknown>` (top-level `Date` values become `YYYY-MM-DD` strings; everything else untouched).
- Produces: `normalizeLinks(value: unknown): Link[]` where `Link = { url: string; label?: string }` — `undefined`/`null`/`''` → `[]`; a string → `[{ url: value }]`; a single `{url, label?}` object → `[value]`; an array → each string item becomes `{url: item}`, each object item passes through.

- [ ] **Step 1: Write the failing tests**

Create `lib/frontmatter.test.ts`:
```ts
import { describe, it, expect } from 'vitest'
import { normalizeFrontMatter, normalizeLinks } from './frontmatter'

describe('normalizeFrontMatter', () => {
  it('turns Date values into YYYY-MM-DD strings', () => {
    const out = normalizeFrontMatter({ date: new Date('2026-01-04T00:00:00.000Z'), title: 'Her' })
    expect(out).toEqual({ date: '2026-01-04', title: 'Her' })
  })

  it('leaves strings, numbers, arrays and objects untouched', () => {
    const input = {
      date: '2026-01-04',
      rating: 8,
      tags: ['a', 'b'],
      website: { url: 'https://x.com', label: 'X' },
    }
    expect(normalizeFrontMatter(input)).toEqual(input)
  })
})

describe('normalizeLinks', () => {
  it('turns a missing value into an empty list', () => {
    expect(normalizeLinks(undefined)).toEqual([])
    expect(normalizeLinks(null)).toEqual([])
    expect(normalizeLinks('')).toEqual([])
  })

  it('turns a string into a one-item list', () => {
    expect(normalizeLinks('https://github.com/x/y')).toEqual([{ url: 'https://github.com/x/y' }])
  })

  it('wraps a single object in a list', () => {
    const link = { url: 'https://x.com', label: 'X' }
    expect(normalizeLinks(link)).toEqual([link])
  })

  it('passes a list through, coercing string items', () => {
    const input = ['https://a.com', { url: 'https://b.com', label: 'B' }]
    expect(normalizeLinks(input)).toEqual([{ url: 'https://a.com' }, { url: 'https://b.com', label: 'B' }])
  })
})
```

- [ ] **Step 2: Run to verify it fails**

Run: `npx.cmd vitest run lib/frontmatter.test.ts`
Expected: FAIL, module not found.

- [ ] **Step 3: Implement**

Create `lib/frontmatter.ts`:
```ts
export interface Link {
  url: string
  label?: string
}

export function normalizeFrontMatter(data: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(data)) {
    out[key] = value instanceof Date ? value.toISOString().slice(0, 10) : value
  }
  return out
}

export function normalizeLinks(value: unknown): Link[] {
  if (value === undefined || value === null || value === '') return []
  if (typeof value === 'string') return [{ url: value }]
  if (Array.isArray(value)) {
    return value.map(item => (typeof item === 'string' ? { url: item } : (item as Link)))
  }
  return [value as Link]
}
```

- [ ] **Step 4: Run to verify it passes**

Run: `npx.cmd vitest run lib/frontmatter.test.ts`
Expected: PASS, 6 tests.

- [ ] **Step 5: Wire into the loaders**

In `lib/mdx.ts`: import `normalizeFrontMatter` and change `getMDXFile`'s return from `frontMatter: data,` to `frontMatter: normalizeFrontMatter(data),`.

In `lib/portfolio-types.ts`: change `github?: string | Link[]`, `demo?: string | Link[]`, `website?: string | Link[]` to `github?: Link[]`, `demo?: Link[]`, `website?: Link[]`, importing `Link` from `./frontmatter` (or re-exporting it) with `label` optional.

In `lib/portfolio.ts`'s `toProject`: after spreading `file.frontMatter`, overwrite `github`, `demo`, `website` with `normalizeLinks(file.frontMatter.github)` etc.

- [ ] **Step 6: Simplify the portfolio detail page**

In `app/[lang]/portfolio/[category]/[slug]/page.tsx`, replace the duplicated `typeof x === 'string'` / `Array.isArray(x)` rendering blocks for `github`, `demo`, `website` with a single small `LinkButtons` component (or inline map) that only ever receives a normalized `Link[]` and applies the existing label-fallback rules: GitHub — one link → "View on GitHub", multiple → "GitHub Repo n" (`t.portfolio.githubRepo`); Demo — "View Demo"; Website — "Visit Website". This is also what fixes the illustration pages: their `website` field is now normalized to a one-item list instead of being an unhandled single object.

- [ ] **Step 7: Verify**

Run: `npx.cmd vitest run` (all pass), `npx.cmd tsc --noEmit` (no errors), then the production build command. Confirm the page count matches the pre-change build (no pages lost). With headless Edge against the static export, open an illustration project page and confirm the "View More" button now renders, and open `portfolio/games/battle-of-balls` (a project with two GitHub links) and confirm both "GitHub Repo 1"/"GitHub Repo 2" buttons and the Demo button still render.

- [ ] **Step 8: Commit**

```bash
git add lib/frontmatter.ts lib/frontmatter.test.ts lib/mdx.ts lib/portfolio.ts lib/portfolio-types.ts app/[lang]/portfolio/[category]/[slug]/page.tsx
git commit -m "fix: normalize frontmatter dates and portfolio link fields"
```

---

### Task 2: Content-repo link-field migration (content repo, branch `feat/editor-links`)

Why: the loader in Task 1 accepts old and new shapes at read time, but the CMS writes only the new shape, so existing content must be rewritten to match before the editor can safely round-trip it.

**Files (content repo):** `portfolio/**/*.mdx` (link fields), `README.md`.

- [ ] **Step 1: Branch**

In the content repo (`content/` in this worktree, or a separate clone), create `feat/editor-links` from `main`. Confirm `git -C content status` is clean (no in-progress edits from another actor) before starting.

- [ ] **Step 2: Write and run a temporary migration script**

Write a one-off script (in the session scratchpad, not committed) that, for every `portfolio/**/*.mdx` file, rewrites `github`, `demo`, `website` frontmatter fields into list form: a plain string becomes a one-item list (`github: "https://…"` → `github:\n  - url: "https://…"`); a single object becomes a one-item list; an existing list is left as-is; an empty/absent field is dropped. Keep `.en`/`.zh` pairs in sync — the site's language validation (`SHARED_FIELDS` in `scripts/lib/content-language.ts`) requires `github`/`demo` to match between the two language files of the same post.

Assert correctness with Task 1's `normalizeLinks`: for every file, `normalizeLinks(oldValue)` must deep-equal `normalizeLinks(newValue)` for each of the three fields, before writing.

- [ ] **Step 3: Update the content README**

Document the new link-field convention (always a list, `label` optional) and add a short note on the phone editor.

- [ ] **Step 4: Verify**

Point the site's `./content` at this branch and run the production build: page count unchanged, `assertContentLayout` and the language validation both pass.

- [ ] **Step 5: Commit (content repo)**

```bash
git -C content add <changed files>
git -C content commit -m "refactor: normalize portfolio link fields to list form"
```

Do not merge yet — content merges after the site branch (see "Merge order" below).

---

### Task 3: CMS config builder (site, TDD)

**Files:**
- Create: `scripts/lib/cms-config.ts`
- Test: `scripts/lib/cms-config.test.ts`
- Modify: `package.json` (dependency)

**Interfaces:**
- Consumes: `getGroups`, `getCategories` from `lib/taxonomy.ts`; `hasRating`, `getCategoryDisplayName`, `getGroupDisplayName` from `lib/blog-utils.ts`/`lib/portfolio-utils.ts`; the English dictionary for labels.
- Produces:
  - `interface CmsOptions { repo: string; branch: string }`
  - `buildCmsConfig(options: CmsOptions): Record<string, unknown>` with one collection per Blog category and one per Portfolio category (12 total), named `blog-{category}` / `portfolio-{category}`.

- [ ] **Step 1: Install `yaml`**

Run: `npm.cmd install --save-dev yaml`

- [ ] **Step 2: Write the failing test**

Create `scripts/lib/cms-config.test.ts` covering:
- `config.backend` equals `{ name: 'github', repo: 'me/site', branch: 'main', auth_methods: ['token'] }`.
- `config.i18n` equals `{ structure: 'multiple_files', locales: ['en', 'zh'], default_locale: 'en', initial_locales: ['en'] }`.
- `config.collections` has length 12 (6 Blog + 6 Portfolio categories from `lib/taxonomy.ts`), all names unique.
- A known collection (e.g. `blog-music`) has the right `folder`, `media_folder`, `public_folder`, `extension: mdx`, `format: frontmatter`, `create: true`, `i18n: true`.
- Only review-group Blog categories (`hasRating(group)`) have a `rating` field; a moments-group category does not.
- Portfolio's Art-group categories (illustration, photography) do not have `github`/`demo` fields; Computing-group categories do.
- Shared fields (`date`, `tags`, `images`, and whichever of `rating`/`github`/`demo`/`website` are present) are all `i18n: 'duplicate'`; `title`/`description`/`body` are `i18n: true`.
- `config.media_libraries.all.transformations.raster_image` matches `{ format: 'webp', quality: 82, width: 2048, height: 2048 }`.
- `body` is the last field in every collection and uses the `richtext` widget.

- [ ] **Step 3: Run to verify it fails**

Run: `npx.cmd vitest run scripts/lib/cms-config.test.ts`
Expected: FAIL, module not found.

- [ ] **Step 4: Implement**

Create `scripts/lib/cms-config.ts`. Sketch:
```ts
import { getGroups, getCategories, type BlogGroup, type PortfolioGroup } from '../../lib/taxonomy'
import { hasRating } from '../../lib/blog-utils'
import { en } from '../../lib/i18n/dictionaries/en'

export interface CmsOptions {
  repo: string
  branch: string
}

const SHARED_FIELD = (name: string, widget: Record<string, unknown>) => ({ name, i18n: 'duplicate', ...widget })
const LOCAL_FIELD = (name: string, widget: Record<string, unknown>) => ({ name, i18n: true, ...widget })

function dateField() {
  return SHARED_FIELD('date', { label: 'Date', widget: 'datetime', type: 'date' })
}

function imagesField() {
  return SHARED_FIELD('images', { label: 'Images (first one is the cover)', widget: 'image', multiple: true, required: false })
}

function linkListField(name: string, label: string) {
  return SHARED_FIELD(name, {
    label,
    widget: 'list',
    required: false,
    fields: [
      { name: 'url', label: 'URL', widget: 'string' },
      { name: 'label', label: 'Button text', widget: 'string', required: false },
    ],
  })
}

function blogFields(group: BlogGroup) {
  const fields = [
    LOCAL_FIELD('title', { label: 'Title', widget: 'string' }),
    LOCAL_FIELD('description', { label: 'One-line summary', widget: 'text', required: false }),
    dateField(),
    SHARED_FIELD('tags', { label: 'Tags', widget: 'list', required: false }),
    imagesField(),
  ]
  if (hasRating(group)) {
    fields.push(SHARED_FIELD('rating', { label: 'Rating (1-10)', widget: 'number', value_type: 'int', min: 1, max: 10, required: false }))
    fields.push(SHARED_FIELD('website', { label: 'External link', widget: 'object', required: false, fields: [
      { name: 'url', label: 'URL', widget: 'string' },
      { name: 'label', label: 'Button text', widget: 'string' },
    ] }))
  }
  fields.push(LOCAL_FIELD('body', { label: 'Body', widget: 'richtext' }))
  return fields
}

function portfolioFields(group: PortfolioGroup) {
  const fields = [
    LOCAL_FIELD('title', { label: 'Title', widget: 'string' }),
    LOCAL_FIELD('description', { label: 'One-line summary', widget: 'text', required: false }),
    dateField(),
    SHARED_FIELD('tags', { label: 'Tags', widget: 'list', required: false }),
    imagesField(),
    SHARED_FIELD('context', { label: 'Context', widget: 'select', required: false, options: ['course', 'research', 'work', 'personal'] }),
  ]
  if (group !== 'art') {
    fields.push(linkListField('github', 'GitHub links'))
    fields.push(linkListField('demo', 'Demo links'))
  }
  fields.push(linkListField('website', 'Website links'))
  fields.push(LOCAL_FIELD('body', { label: 'Body', widget: 'richtext' }))
  return fields
}

export function buildCmsConfig({ repo, branch }: CmsOptions): Record<string, unknown> {
  const blogCollections = getGroups('blog').flatMap(group =>
    getCategories('blog', group).map(category => ({
      name: `blog-${category}`,
      label: `Blog · ${en.blog.categories[category]}`,
      folder: `blog/${category}`,
      extension: 'mdx',
      format: 'frontmatter',
      create: true,
      i18n: true,
      media_folder: `/images/blog/${category}`,
      public_folder: `/images/blog/${category}`,
      fields: blogFields(group),
    }))
  )
  const portfolioCollections = getGroups('portfolio').flatMap(group =>
    getCategories('portfolio', group).map(category => ({
      name: `portfolio-${category}`,
      label: `Portfolio · ${en.portfolio.categories[category]}`,
      folder: `portfolio/${category}`,
      extension: 'mdx',
      format: 'frontmatter',
      create: true,
      i18n: true,
      media_folder: `/images/portfolio/${category}`,
      public_folder: `/images/portfolio/${category}`,
      fields: portfolioFields(group),
    }))
  )

  return {
    backend: { name: 'github', repo, branch, auth_methods: ['token'] },
    i18n: { structure: 'multiple_files', locales: ['en', 'zh'], default_locale: 'en', initial_locales: ['en'] },
    media_libraries: {
      all: { transformations: { raster_image: { format: 'webp', quality: 82, width: 2048, height: 2048 } } },
    },
    collections: [...blogCollections, ...portfolioCollections],
  }
}
```
(Adjust field/type names to match `lib/taxonomy.ts`'s actual exports — check them before writing this file.)

- [ ] **Step 5: Run to verify it passes**

Run: `npx.cmd vitest run scripts/lib/cms-config.test.ts`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add package.json package-lock.json scripts/lib/cms-config.ts scripts/lib/cms-config.test.ts
git commit -m "feat: sveltia cms config builder generated from lib/taxonomy"
```

---

### Task 4: Generate the admin page and serve it (site)

**Files:**
- Create: `scripts/generate-cms-config.ts`
- Modify: `package.json`, `.gitignore`, `app/robots.ts`

**Interfaces:**
- Consumes: `buildCmsConfig` (Task 3).
- Produces: `public/admin/config.yml`, `public/admin/index.html`, the CMS bundle file (all generated, git-ignored). `npm run generate:cms`.

- [ ] **Step 1: Install the CMS bundle and check its layout**

Run:
```bash
npm.cmd install --save-dev @sveltia/cms
ls node_modules/@sveltia/cms/dist
```
Expected: the listing contains the bundle JS file (check the exact name — do not assume `sveltia-cms.js`).

- [ ] **Step 2: Write the generator**

Create `scripts/generate-cms-config.ts` writing `public/admin/config.yml` (via `yaml`'s `stringify(buildCmsConfig(...))`), `public/admin/index.html` (with `<meta name="robots" content="noindex" />` and a `<link rel="cms-config-url" href="config.yml" type="text/yaml" />`), and copying the CMS bundle from `node_modules/@sveltia/cms/dist/` into `public/admin/`. `repo`/`branch` default to `IronDumpling/chuyue-content`/`main`, overridable via `CMS_REPO`/`CMS_BRANCH` env vars.

- [ ] **Step 3: Wire scripts and ignore rules**

In `package.json` `"scripts"`, add `"generate:cms": "tsx scripts/generate-cms-config.ts"` and append `npm run generate:cms` to the end of the existing `predev` and `prebuild` chains, keeping `sync:content` first.

Append to `.gitignore`: `/public/admin/`.

In `app/robots.ts`, add `disallow: '/admin/'` alongside the existing `allow: '/'`.

- [ ] **Step 4: Generate and inspect**

Run: `npm.cmd run generate:cms`. Open `public/admin/config.yml` and confirm 12 collections and the `i18n` block.

- [ ] **Step 5: Production build**

Run the production build command. Confirm `out/admin/` contains `index.html`, `config.yml`, and the bundle file.

- [ ] **Step 6: Commit**

```bash
git add package.json package-lock.json scripts/generate-cms-config.ts .gitignore app/robots.ts
git commit -m "feat: serve sveltia cms at /admin"
```

---

### Task 5: Verify with the real CMS (round-trip and upload)

**Files:** none changed unless a check fails.

This task is manual because it needs a browser and the owner's token. It answers what a config test cannot: does saving an existing post rewrite it destructively, does the image transform work, and does a Chinese-only slug work.

- [ ] **Step 1: Check config keys against the current installed docs**

With `@sveltia/cms` installed, confirm the `datetime` widget's `type: date` option, `i18n.initial_locales`, the `richtext` widget name, and `media_libraries.all.transformations.raster_image` against `https://sveltiacms.app/en/docs/` for the installed version. Fix `scripts/lib/cms-config.ts` and its test if anything differs.

- [ ] **Step 2: Round-trip an existing post locally**

Build the static export, then open `/admin/` in Chrome or Edge, choose "Work with Local Repository", and select the `content/` folder. Open an existing Blog post, change nothing, save. Run `git -C content diff` on that file.
Expected acceptable diff: none, or formatting-only (quote style). Unacceptable: lost frontmatter keys, changed body text, mangled Chinese text, changed heading levels or image markdown. If unacceptable: revert with `git -C content checkout -- .`, and switch the `body` widget to a plain `text` widget rather than accepting corruption.

- [ ] **Step 3: New post with a big photo, and a Chinese-only post**

Create a test Photography post with a photo larger than 3 MB. Check the generated `.en.mdx`: `images` entries start with `/images/portfolio/photography/` and end `.webp`, well under 1 MB, at most 2048px.

Create a second test post with only a Chinese title (no English). Confirm the generated filename/slug is usable; if not, add a required `slug` field to the affected collections as a fallback.

Clean up afterwards: `git -C content status` first (in case another actor has unrelated in-progress edits), then remove only the test files, not a blanket `checkout . && clean -fd`.

- [ ] **Step 4: Phone check after deploy**

After the site branch is merged and deployed, and the content branch is merged: create a fine-grained token (the `chuyue-content` repo only, Contents: read and write). On the phone open `<site>/admin/`, sign in with the token, create a short real or test post with a photo, save. Confirm a commit appears on `chuyue-content`'s `main`, "Notify site" and the site's deploy workflow both run, and the change is live within 1-3 minutes. Delete the test post afterwards if one was created.

---

### Task 6: Documentation and close-out

- [ ] **Step 1: Site README**

Add a "Writing from a phone (Sveltia CMS)" section under `## Adding Content`: `/admin/`, token scope, `npm run generate:cms`.

```bash
git add README.md
git commit -m "docs: how to publish from the cms"
```

- [ ] **Step 2: Finish the branches**

Use `superpowers:finishing-a-development-branch` — site branch first, then content branch. Do not merge or push without the owner's explicit choice from that skill's menu.

## Self-Review

- **Spec coverage:** phone editor with per-category fields for both sections (Task 3), image compression on upload (Task 3 config, verified Task 5), no server (Task 4), 1-3 minute publish through the existing workflow (Task 5 step 4), unquoted-date hazard (Task 1), mixed portfolio link shapes (Tasks 1-2), illustration "View More" regression (fixed as a side effect of Task 1).
- **Placeholders:** none. `<site>` in verification steps is the confirmed live URL.
- **Type consistency:** `buildCmsConfig`, `CmsOptions`, `normalizeFrontMatter`, `normalizeLinks`, `Link` names match across tasks and tests.
- **Known limits and risks:** Sveltia CMS is young software; Task 5 steps 1-3 exist because its options and richtext round-tripping and non-Latin slugs should be checked, not assumed. Blog's `website` field (string or `{url,label}`) is intentionally left in its current shape — only Portfolio's link fields are normalized. 8 pre-existing broken image references in content (clickhouse-he, easy-database, etc.) are out of scope.
