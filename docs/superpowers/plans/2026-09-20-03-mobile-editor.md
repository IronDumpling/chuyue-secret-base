# Mobile Editor (Sveltia CMS) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Let the owner write and publish blog posts from a phone browser at `<site>/admin/`, with photos compressed on the phone before upload, and the post live 1-3 minutes later through the existing deploy workflow.

**Architecture:** Sveltia CMS is a static single-page app that talks to the GitHub API directly from the browser with a personal access token, so no server is needed. It edits the separate `chuyue-content` repository (plan 07) and commits to that repo's `main`, whose "Notify site" workflow triggers the site's `deploy.yml`. The admin page itself is still served by the site at `/admin/`; only its `backend.repo` points at the content repo, so the phone token never has access to site code. The CMS config is generated at build time from `lib/blog-utils.ts` (`categoryMap`, `typeMap`) so the form always matches the folders the site reads. A small loader fix makes unquoted YAML dates safe.

**Tech Stack:** Sveltia CMS (`@sveltia/cms` npm package, self-hosted), `yaml`, vitest, tsx.

**Spec:** `docs/superpowers/plans/2026-09-20-00-priorities-and-roadmap.md`

## Global Constraints

- Requires plan 07 (vitest and tsx installed; content lives in the public repo `IronDumpling/chuyue-content`, cloned at `content/` in the site repo).
- Blog collections only in this plan. Portfolio is excluded because `github`/`demo` fields are sometimes a string and sometimes a list of `{url,label}`, which a form cannot round-trip safely.
- The GitHub token is entered by the owner on the login screen and stored in that browser's local storage. It must never be committed, written into config, or added to CI.
- Use a fine-grained personal access token restricted to the `chuyue-content` repository only, with only "Contents: Read and write". It must not have access to the site repo.
- Paths inside the content repo (paths are relative to that repo's root): posts at `blog/{category}/{type}/{slug}.mdx`, images at `images/blog/{category}/{type}/`, referenced in frontmatter as `/images/blog/{category}/{type}/file.webp` (no base path; `SafeImage` adds it). The site's sync step copies `images/` to `public/images/`.
- Frontmatter `date` stays a `YYYY-MM-DD` string in the runtime data.
- Repo for the CMS backend defaults to `IronDumpling/chuyue-content`. Override with env `CMS_REPO`.
- Production build command (Git Bash): `MSYS_NO_PATHCONV=1 NEXT_PUBLIC_BASE_PATH=/chuyue-secret-base npm run build`

## File Structure

- Create `lib/frontmatter.ts`, `lib/frontmatter.test.ts`: `normalizeFrontMatter`.
- Modify `lib/mdx.ts`: use it.
- Create `scripts/lib/cms-config.ts`, `scripts/lib/cms-config.test.ts`: pure `buildCmsConfig`.
- Create `scripts/generate-cms-config.ts`: writes `public/admin/config.yml`, `public/admin/index.html`, copies the CMS bundle.
- Modify `package.json` (deps, scripts), `.gitignore`, `app/robots.ts`, `README.md`.

---

### Task 1: Make unquoted dates safe

Why: every existing post quotes its date (`date: "2026-01-04"`), but the CMS may write `date: 2026-01-04` unquoted. `gray-matter` parses an unquoted date into a JavaScript `Date`, while `BlogPost`/`PortfolioProject` declare `date: string` and `BlogList` (a client component) receives the whole post from a server component. Whether a `Date` survives that boundary was not tested; normalizing at load time removes the question.

**Files:**
- Create: `lib/frontmatter.ts`
- Test: `lib/frontmatter.test.ts`
- Modify: `lib/mdx.ts`

**Interfaces:**
- Produces: `normalizeFrontMatter(data: Record<string, unknown>): Record<string, unknown>` (top-level `Date` values become `YYYY-MM-DD` strings; everything else untouched).

- [ ] **Step 1: Write the failing test**

Create `lib/frontmatter.test.ts`:
```ts
import { describe, it, expect } from 'vitest'
import { normalizeFrontMatter } from './frontmatter'

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
```

- [ ] **Step 2: Run to verify it fails**

Run: `npx vitest run lib/frontmatter.test.ts`
Expected: FAIL, module not found.

- [ ] **Step 3: Implement**

Create `lib/frontmatter.ts`:
```ts
export function normalizeFrontMatter(data: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(data)) {
    out[key] = value instanceof Date ? value.toISOString().slice(0, 10) : value
  }
  return out
}
```

- [ ] **Step 4: Use it in the loader**

In `lib/mdx.ts`, add `import { normalizeFrontMatter } from './frontmatter'` and change the return in `getMDXFile` from `frontMatter: data,` to `frontMatter: normalizeFrontMatter(data),`.

- [ ] **Step 5: Verify**

Run: `npx vitest run lib/frontmatter.test.ts` (PASS, 2 tests), then the production build command (76 pages, no errors).

- [ ] **Step 6: Commit**

```bash
git add lib/frontmatter.ts lib/frontmatter.test.ts lib/mdx.ts
git commit -m "fix: normalize unquoted yaml dates in frontmatter"
```

---

### Task 2: CMS config builder

**Files:**
- Create: `scripts/lib/cms-config.ts`
- Test: `scripts/lib/cms-config.test.ts`
- Modify: `package.json` (dependency)

**Interfaces:**
- Consumes: `categoryMap`, `typeMap` from `lib/blog-utils.ts`.
- Produces:
  - `interface CmsOptions { repo: string; branch: string }`
  - `buildCmsConfig(options: CmsOptions): Record<string, unknown>` with one collection per category x type, named `blog-{category}-{type}`.

- [ ] **Step 1: Install `yaml`**

Run: `npm install --save-dev yaml`

- [ ] **Step 2: Write the failing test**

Create `scripts/lib/cms-config.test.ts`:
```ts
import { describe, it, expect } from 'vitest'
import { buildCmsConfig } from './cms-config'
import { categoryMap, typeMap } from '../../lib/blog-utils'

const config = buildCmsConfig({ repo: 'me/site', branch: 'main' }) as any

describe('buildCmsConfig', () => {
  it('uses the GitHub backend with token login', () => {
    expect(config.backend).toEqual({ name: 'github', repo: 'me/site', branch: 'main', auth_methods: ['token'] })
  })

  it('creates one collection per category and type with unique names', () => {
    const expected = Object.keys(categoryMap).length * Object.keys(typeMap).length
    expect(config.collections).toHaveLength(expected)
    const names = config.collections.map((c: any) => c.name)
    expect(new Set(names).size).toBe(expected)
  })

  it('points each collection at the folder and image paths the site reads', () => {
    const c = config.collections.find((x: any) => x.name === 'blog-music-review')
    expect(c).toMatchObject({
      label: 'Music · Review',
      folder: 'blog/music/review',
      extension: 'mdx',
      format: 'frontmatter',
      create: true,
      media_folder: '/images/blog/music/review',
      public_folder: '/images/blog/music/review',
    })
  })

  it('only offers a rating field on reviews', () => {
    const fieldNames = (name: string) => config.collections.find((x: any) => x.name === name).fields.map((f: any) => f.name)
    expect(fieldNames('blog-music-review')).toContain('rating')
    expect(fieldNames('blog-music-casual')).not.toContain('rating')
  })

  it('has the fields the site frontmatter uses, with the body last', () => {
    const fields = config.collections[0].fields.map((f: any) => f.name)
    expect(fields).toEqual(expect.arrayContaining(['title', 'date', 'tags', 'description', 'images', 'website', 'body']))
    expect(fields[fields.length - 1]).toBe('body')
  })

  it('compresses uploaded images to webp, max 2048px', () => {
    expect(config.media_libraries.all.transformations.raster_image).toMatchObject({
      format: 'webp',
      quality: 82,
      width: 2048,
      height: 2048,
    })
  })
})
```

- [ ] **Step 3: Run to verify it fails**

Run: `npx vitest run scripts/lib/cms-config.test.ts`
Expected: FAIL, module not found.

- [ ] **Step 4: Implement**

Create `scripts/lib/cms-config.ts`:
```ts
import { categoryMap, typeMap } from '../../lib/blog-utils'

export interface CmsOptions {
  repo: string
  branch: string
}

function blogFields(type: string) {
  const fields: Record<string, unknown>[] = [
    { name: 'title', label: 'Title', widget: 'string' },
    { name: 'date', label: 'Date', widget: 'datetime', format: 'YYYY-MM-DD', date_format: 'YYYY-MM-DD', time_format: false },
    { name: 'tags', label: 'Tags', widget: 'list', required: false },
    { name: 'description', label: 'One-line summary', widget: 'text', required: false },
    { name: 'images', label: 'Images (first one is the cover)', widget: 'image', multiple: true, required: false },
  ]
  if (type === 'review') {
    fields.push({ name: 'rating', label: 'Rating (1-10)', widget: 'number', value_type: 'int', min: 1, max: 10, required: false })
  }
  fields.push({
    name: 'website',
    label: 'External link (e.g. more photos on Shutterstock)',
    widget: 'object',
    required: false,
    fields: [
      { name: 'url', label: 'URL', widget: 'string' },
      { name: 'label', label: 'Button text', widget: 'string' },
    ],
  })
  fields.push({ name: 'body', label: 'Body', widget: 'markdown' })
  return fields
}

export function buildCmsConfig({ repo, branch }: CmsOptions): Record<string, unknown> {
  const collections = Object.entries(categoryMap).flatMap(([category, categoryLabel]) =>
    Object.entries(typeMap).map(([type, typeLabel]) => ({
      name: `blog-${category}-${type}`,
      label: `${categoryLabel} · ${typeLabel}`,
      folder: `blog/${category}/${type}`,
      extension: 'mdx',
      format: 'frontmatter',
      create: true,
      slug: '{{slug}}',
      media_folder: `/images/blog/${category}/${type}`,
      public_folder: `/images/blog/${category}/${type}`,
      fields: blogFields(type),
    }))
  )

  return {
    backend: { name: 'github', repo, branch, auth_methods: ['token'] },
    media_libraries: {
      all: {
        transformations: {
          raster_image: { format: 'webp', quality: 82, width: 2048, height: 2048 },
        },
      },
    },
    collections,
  }
}
```

- [ ] **Step 5: Run to verify it passes**

Run: `npx vitest run scripts/lib/cms-config.test.ts`
Expected: PASS, 6 tests.

- [ ] **Step 6: Commit**

```bash
git add package.json package-lock.json scripts/lib/cms-config.ts scripts/lib/cms-config.test.ts
git commit -m "feat: sveltia cms config builder for blog collections"
```

---

### Task 3: Generate the admin page and serve it

**Files:**
- Create: `scripts/generate-cms-config.ts`
- Modify: `package.json`, `.gitignore`, `app/robots.ts`

**Interfaces:**
- Consumes: `buildCmsConfig` (Task 2).
- Produces: `public/admin/config.yml`, `public/admin/index.html`, `public/admin/sveltia-cms.js` (all generated, git-ignored). `npm run generate:cms`.

- [ ] **Step 1: Install the CMS bundle and check its layout**

Run:
```bash
npm install --save-dev @sveltia/cms
ls node_modules/@sveltia/cms/dist
```
Expected: the listing contains `sveltia-cms.js`. If the file is named differently, use that name in Step 2 (`BUNDLE`) and in the generated HTML.

- [ ] **Step 2: Write the generator**

Create `scripts/generate-cms-config.ts`:
```ts
import fs from 'fs'
import path from 'path'
import { stringify } from 'yaml'
import { buildCmsConfig } from './lib/cms-config'

const ADMIN_DIR = path.join(process.cwd(), 'public', 'admin')
const BUNDLE = path.join(process.cwd(), 'node_modules', '@sveltia', 'cms', 'dist', 'sveltia-cms.js')

const INDEX_HTML = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="robots" content="noindex" />
    <title>Content Manager</title>
    <link href="config.yml" type="text/yaml" rel="cms-config-url" />
  </head>
  <body>
    <script src="sveltia-cms.js"></script>
  </body>
</html>
`

function main() {
  const repo = process.env.CMS_REPO || 'IronDumpling/chuyue-content'
  const branch = process.env.CMS_BRANCH || 'main'

  fs.mkdirSync(ADMIN_DIR, { recursive: true })
  fs.writeFileSync(path.join(ADMIN_DIR, 'config.yml'), stringify(buildCmsConfig({ repo, branch })))
  fs.writeFileSync(path.join(ADMIN_DIR, 'index.html'), INDEX_HTML)
  fs.copyFileSync(BUNDLE, path.join(ADMIN_DIR, 'sveltia-cms.js'))

  console.log(`[cms] wrote public/admin for ${repo}@${branch}`)
}

main()
```

- [ ] **Step 3: Wire scripts and ignore rules**

In `package.json` `"scripts"`, add:
```json
    "generate:cms": "tsx scripts/generate-cms-config.ts"
```
and append `npm run generate:cms` to the end of the existing `predev` and `prebuild` chains (plan 07 created both as `npm run sync:content`; plan 02 may have added `npm run generate:share` to `prebuild`). Result, for example: `"predev": "npm run sync:content && npm run generate:cms"` and `"prebuild": "npm run sync:content && npm run generate:share && npm run generate:cms"`. Keep `sync:content` first.

Append to `.gitignore`:
```
# generated at build time
/public/admin/
```

In `app/robots.ts`, change `allow: '/'` to `allow: '/',` followed by `disallow: '/admin/',`.

- [ ] **Step 4: Generate and inspect**

Run: `npm run generate:cms`
Expected: `[cms] wrote public/admin for IronDumpling/chuyue-content@main`. Open `public/admin/config.yml` and check it starts with `backend:` and lists 12 collections.

- [ ] **Step 5: Production build**

Run the production build command. Expected: 76 pages; `out/admin/index.html`, `out/admin/config.yml` and `out/admin/sveltia-cms.js` exist (`ls out/admin`).

- [ ] **Step 6: Commit**

```bash
git add package.json package-lock.json scripts/generate-cms-config.ts .gitignore app/robots.ts
git commit -m "feat: serve sveltia cms at /admin"
```

---

### Task 4: Verify with the real CMS (round-trip and upload)

**Files:** none changed unless a check fails.

This task is manual because it needs a browser. It answers the two risks a config test cannot: (a) does saving an existing post rewrite it destructively, and (b) does the image transform key in the config work.

- [ ] **Step 1: Check config keys against the current docs**

Open `https://sveltiacms.app/en/docs/media` and `https://sveltiacms.app/en/docs/fields/datetime`. Confirm: the `media_libraries.all.transformations.raster_image` key path, the `datetime` options `format`/`date_format`/`time_format`, and that the image widget accepts `multiple: true`. If a key differs, fix it in `scripts/lib/cms-config.ts`, update the matching assertion in `cms-config.test.ts`, and rerun the tests.

- [ ] **Step 2: Round-trip an existing post locally**

Run `npm run dev`. In Chrome or Edge on desktop open `http://localhost:3000/admin/`. Choose "Work with Local Repository" and select the `content/` folder (the clone of `chuyue-content`, which is the repository the CMS edits). Open Films & Shows · Review, then "Her Review", change nothing, and save. Then run `git -C content diff blog/films-shows/review/her-review.mdx`.
Expected acceptable diff: none, or formatting-only changes (quote style, date quoting). Unacceptable: lost frontmatter keys, changed body text, mangled Chinese text, changed heading levels or image markdown. If unacceptable, note exactly what changed, revert with `git -C content checkout -- .`, and stop: the fix is to switch the `body` widget to a plain-text/`code` editor for MDX bodies, not to accept the corruption.

- [ ] **Step 3: Create a test post with a big photo**

In the same local session create a Photography · Casual post titled `cms-test`, add a photo larger than 3 MB from your phone or computer, save. Then check the result:
```bash
git -C content status --short
ls -la content/images/blog/photography/casual/
```
Expected: a new `content/blog/photography/casual/cms-test.mdx` whose `images:` entry starts with `/images/blog/photography/casual/` and ends `.webp`, and an image file well under 1 MB, at most 2048 px. Restart `npm run dev` (its `predev` step syncs the new image into `public/images`), open `http://localhost:3000/blog/photography/casual/cms-test/` and confirm the photo renders. Then remove the test data: `git -C content checkout -- . && git -C content clean -fd`, and rerun `npm run sync:content`.

- [ ] **Step 4: Phone check after deploy**

Push the branch to the site repo's `main` (or merge) and wait for the deploy workflow, so `/admin/` is live. Create a fine-grained token at GitHub Settings > Developer settings > Personal access tokens > Fine-grained tokens: the `chuyue-content` repository only, Repository permissions > Contents: Read and write. On the phone open `<site>/admin/`, choose "Sign in with token", paste the token, create a short real or test post with a photo, and save. Expected: a commit appears on the content repo's `main`, its "Notify site" workflow runs, the site's deploy workflow starts (trigger `repository_dispatch`), and the post is live within 1-3 minutes. Add the admin page to the phone home screen. If you created a test post, delete it through the CMS afterwards.

- [ ] **Step 5: Document usage in the README**

Add this under `## Adding Content` in `README.md`:
```md
### Writing from a phone (Sveltia CMS)

Open `<site>/admin/` and sign in with a GitHub fine-grained token (the `chuyue-content` repo only, Contents: read and write). Posts and photos are committed straight to that repo's `main`, which rebuilds the site; photos are converted to WebP at 2048 px on the device before upload. The admin files under `public/admin/` are generated by `npm run generate:cms` from the categories in `lib/blog-utils.ts`.
```

- [ ] **Step 6: Commit**

```bash
git add README.md
git commit -m "docs: how to publish from the cms"
```

## Self-Review

- **Spec coverage:** phone editor with per-type fields (Task 2), image compression on upload (Task 2 config, verified in Task 4), no server (Task 3), 1-3 minute publish through existing workflow (Task 4 step 4), unquoted-date hazard (Task 1).
- **Placeholders:** none. `<site>` in verification steps is the confirmed live URL.
- **Type consistency:** `buildCmsConfig`, `CmsOptions`, `normalizeFrontMatter` names match across tasks and tests.
- **Known limits and risks:** Sveltia CMS is young software; Task 4 step 1 and 2 exist because its options and markdown round-tripping should be checked, not assumed. Portfolio entries are out of scope until link fields are unified. Existing photography posts keep per-post image subfolders; new CMS uploads go into the flat `public/images/blog/{category}/{type}/` folder.
