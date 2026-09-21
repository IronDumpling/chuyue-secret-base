# Content Repository Split Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Move all blog and portfolio content (MDX and its images) into a new public repository `IronDumpling/chuyue-content`, so a phone-held token can only touch content, while the site repo keeps deploying to GitHub Pages through GitHub Actions and rebuilds within minutes of a content change.

**Architecture:** The site repo stays the only place that builds and deploys. Its `deploy.yml` checks out `chuyue-content` into `content/` before building, so the existing loaders (`lib/mdx.ts` reads `content/blog/...` and `content/portfolio/...`) keep working unchanged. Content-repo images live in `images/blog` and `images/portfolio`; a sync script copies them into `public/images` before every build/dev run (so the URLs `/images/blog/...` and `/images/portfolio/...` do not change). A workflow in the content repo sends a `repository_dispatch` event to the site repo on each push to trigger a rebuild. The build fails loudly if content is missing, instead of deploying an empty site.

**Tech Stack:** GitHub Actions (`actions/checkout`, `repository_dispatch`), Node/tsx, vitest.

**Spec:** `docs/superpowers/plans/2026-09-20-00-priorities-and-roadmap.md` (owner decision on 2026-09-20: split, content repo public).

## Global Constraints

- This is the first plan to execute. Images are migrated as they are (a separate image-compression plan was considered and dropped on 2026-09-20; new photos are compressed by the CMS in plan 03).
- Run before plans 02-06, which assume the split layout and use the test tools installed here.
- `chuyue-content` is public. No token is needed to check it out in CI.
- Existing URLs do not change: pages stay at `/blog/...` and `/portfolio/...`, images stay at `/images/blog/...` and `/images/portfolio/...`.
- Content repo layout (root of the repo): `blog/{category}/{type}/{slug}.mdx`, `portfolio/{category}/{slug}.mdx`, `images/blog/...`, `images/portfolio/...`, `README.md`, `.github/workflows/notify-site.yml`.
- Site-chrome images stay in the site repo: `public/images/about`, `home`, `logo`, `placeholder`. Also `public/pdf`.
- `components/sections/PortfolioSection.tsx` hard-codes eight `/images/portfolio/...` paths, so portfolio images must be present in `public/images/portfolio` at build time (the sync script guarantees it).
- The site repo's default branch is `main`. `repository_dispatch` workflows only run from the default branch, so `deploy.yml` must be merged to `main` before dispatch works.
- Tokens (both created by the owner, never committed):
  - `SITE_DISPATCH_TOKEN`: fine-grained PAT, only the site repo, Repository permission "Contents: Read and write". Stored as an Actions secret in `chuyue-content`.
  - The phone/CMS token is created in plan 03 and is scoped to `chuyue-content` only.
- The site repository is `IronDumpling/chuyue-secret-base` (confirmed by the owner). The local `origin` was still the old name `chuyue.github.io`; Step 0 of execution runs `git remote set-url origin https://github.com/IronDumpling/chuyue-secret-base.git`.
- The owner already cloned the content repo (empty, no commits, branch `main`) to `C:\Users\irond\Documents\self_project\chuyue-content`, a sibling of the site repo. Task 1 uses that clone.
- Production build command (Git Bash): `MSYS_NO_PATHCONV=1 NEXT_PUBLIC_BASE_PATH=/chuyue-secret-base npm run build`
- Shell is Git Bash on Windows. `gh` is not installed; create repos and secrets in the GitHub web UI.
- Do not run this plan on a machine that has uncommitted work in the site repo; Task 2 step 8 deletes tracked directories.

## File Structure

Site repo:
- Create `scripts/lib/sync-content.ts`, `scripts/lib/sync-content.test.ts`: `assertContentPresent`, `syncContentImages`.
- Create `scripts/sync-content.ts`: CLI wrapper.
- Create `vitest.config.ts`.
- Modify `package.json`, `.gitignore`, `.github/workflows/deploy.yml`, `README.md`.
- Remove from git: `content/`, `public/images/blog/`, `public/images/portfolio/`.

Content repo (new): `README.md`, `.github/workflows/notify-site.yml`, plus the imported content.

---

### Task 1: Create and populate `chuyue-content`

**Files:** none in the site repo. Work happens in a sibling folder `../chuyue-content`.

- [ ] **Step 1: Check the existing clone**

Run: `git -C ../chuyue-content status -sb && git -C ../chuyue-content remote -v && ls -A ../chuyue-content`
Expected: branch `main` with no commits yet, `origin` = `https://github.com/IronDumpling/chuyue-content.git`, and only `.git` in the folder. If the folder already contains files, stop and ask the owner.

- [ ] **Step 2: Copy content and images into the clone**

From the site repo root, in Git Bash:
```bash
cp -r content/blog ../chuyue-content/blog
cp -r content/portfolio ../chuyue-content/portfolio
mkdir -p ../chuyue-content/images
cp -r public/images/blog ../chuyue-content/images/blog
cp -r public/images/portfolio ../chuyue-content/images/portfolio
```

- [ ] **Step 3: Verify the copy is complete**

Run:
```bash
find content -type f | wc -l ; find ../chuyue-content/blog ../chuyue-content/portfolio -type f | wc -l
find public/images/blog public/images/portfolio -type f | wc -l ; find ../chuyue-content/images -type f | wc -l
```
Expected: the two pairs of counts are equal (46 content files; the image counts match each other).

- [ ] **Step 4: Add a README**

Create `../chuyue-content/README.md`:
```md
# chuyue-content

Blog posts, portfolio projects and their images for the Chuyue site. The site repository builds and deploys this content; this repository has no build of its own.

## Layout

- `blog/{category}/{type}/{slug}.mdx`
- `portfolio/{category}/{slug}.mdx`
- `images/blog/...`, `images/portfolio/...` (referenced from MDX as `/images/blog/...`, `/images/portfolio/...`)

Every push to `main` triggers a rebuild of the site.
```

- [ ] **Step 5: Commit and push**

```bash
cd ../chuyue-content
git add .
git commit -m "Import content from the site repository"
git push -u origin main
cd ../chuyue-secret-base
```
Expected: push succeeds. Open the repo on GitHub and confirm `blog/`, `portfolio/`, `images/` exist. (Content history stays in the site repo; the new repo starts fresh.)

---

### Task 2: Sync script and content guard in the site repo

**Files:**
- Create: `scripts/lib/sync-content.ts`, `scripts/sync-content.ts`
- Test: `scripts/lib/sync-content.test.ts`
- Create: `vitest.config.ts`
- Modify: `package.json`, `.gitignore`
- Remove from git: `content/`, `public/images/blog/`, `public/images/portfolio/`

**Interfaces:**
- Produces:
  - `assertContentPresent(contentDir: string): void` throws `Error` with a message containing `content repo` when `blog/` or `portfolio/` has no `.mdx`/`.md` files (searched recursively).
  - `syncContentImages(contentDir: string, publicDir: string): string[]` copies each directory in `<contentDir>/images/` to `<publicDir>/images/<name>`, replacing any existing copy, and returns the copied directory names. Throws if `<contentDir>/images` does not exist.
  - `npm run sync:content`.

- [ ] **Step 1: Record a baseline build from the untouched site**

On a clean `main` (before any change in this task):
```bash
MSYS_NO_PATHCONV=1 NEXT_PUBLIC_BASE_PATH=/chuyue-secret-base npm run build
rm -rf ../out-baseline && cp -r out ../out-baseline
```
Expected: 76 pages. This is what the split site must reproduce.

- [ ] **Step 2: Install the test tools**

Run: `npm install --save-dev vitest@^3 tsx` (vitest 5 requires `@types/node` 22+, which conflicts with this repo's `@types/node` 20, so pin the 3.x line)
In `package.json` `"scripts"` add `"test": "vitest run"`. Create `vitest.config.ts`:
```ts
import { defineConfig } from 'vitest/config'
import path from 'path'

export default defineConfig({
  resolve: {
    alias: { '@': path.resolve(__dirname) },
  },
  test: {
    environment: 'node',
    include: ['lib/**/*.test.ts', 'scripts/**/*.test.ts'],
  },
})
```

- [ ] **Step 3: Write the failing tests**

Create `scripts/lib/sync-content.test.ts`:
```ts
import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import fs from 'fs'
import os from 'os'
import path from 'path'
import { assertContentPresent, syncContentImages } from './sync-content'

let root: string
let contentDir: string
let publicDir: string

function write(file: string, text = 'x') {
  fs.mkdirSync(path.dirname(file), { recursive: true })
  fs.writeFileSync(file, text)
}

beforeEach(() => {
  root = fs.mkdtempSync(path.join(os.tmpdir(), 'sync-'))
  contentDir = path.join(root, 'content')
  publicDir = path.join(root, 'public')
  fs.mkdirSync(contentDir, { recursive: true })
  fs.mkdirSync(publicDir, { recursive: true })
})
afterEach(() => fs.rmSync(root, { recursive: true, force: true }))

describe('assertContentPresent', () => {
  it('passes when blog and portfolio both have markdown files', () => {
    write(path.join(contentDir, 'blog/music/review/a.mdx'))
    write(path.join(contentDir, 'portfolio/applications/b.mdx'))
    expect(() => assertContentPresent(contentDir)).not.toThrow()
  })

  it('fails with a clear message when the content repo is missing or empty', () => {
    expect(() => assertContentPresent(contentDir)).toThrow(/content repo/)
    write(path.join(contentDir, 'blog/music/review/a.mdx'))
    expect(() => assertContentPresent(contentDir)).toThrow(/portfolio/)
  })
})

describe('syncContentImages', () => {
  it('copies image folders into public/images and returns their names', () => {
    write(path.join(contentDir, 'images/blog/music/cover.jpg'), 'new')
    write(path.join(contentDir, 'images/portfolio/pact/1.png'), 'p')

    const copied = syncContentImages(contentDir, publicDir)

    expect(copied.sort()).toEqual(['blog', 'portfolio'])
    expect(fs.readFileSync(path.join(publicDir, 'images/blog/music/cover.jpg'), 'utf8')).toBe('new')
    expect(fs.existsSync(path.join(publicDir, 'images/portfolio/pact/1.png'))).toBe(true)
  })

  it('removes files that were deleted from the content repo', () => {
    write(path.join(publicDir, 'images/blog/old.jpg'))
    write(path.join(contentDir, 'images/blog/new.jpg'))

    syncContentImages(contentDir, publicDir)

    expect(fs.existsSync(path.join(publicDir, 'images/blog/old.jpg'))).toBe(false)
    expect(fs.existsSync(path.join(publicDir, 'images/blog/new.jpg'))).toBe(true)
  })

  it('does not touch site-owned image folders', () => {
    write(path.join(publicDir, 'images/about/me.jpg'), 'keep')
    write(path.join(contentDir, 'images/blog/a.jpg'))

    syncContentImages(contentDir, publicDir)

    expect(fs.readFileSync(path.join(publicDir, 'images/about/me.jpg'), 'utf8')).toBe('keep')
  })

  it('throws when the content repo has no images folder', () => {
    expect(() => syncContentImages(contentDir, publicDir)).toThrow(/images/)
  })
})
```

- [ ] **Step 4: Run to verify they fail**

Run: `npx vitest run scripts/lib/sync-content.test.ts`
Expected: FAIL, module not found.

- [ ] **Step 5: Implement the library**

Create `scripts/lib/sync-content.ts`:
```ts
import fs from 'fs'
import path from 'path'

function hasMarkdown(dir: string): boolean {
  if (!fs.existsSync(dir)) return false
  return fs
    .readdirSync(dir, { withFileTypes: true })
    .some(entry => (entry.isDirectory() ? hasMarkdown(path.join(dir, entry.name)) : /\.mdx?$/.test(entry.name)))
}

// Without this guard a failed checkout would build and deploy a site with no posts.
export function assertContentPresent(contentDir: string): void {
  for (const section of ['blog', 'portfolio']) {
    if (!hasMarkdown(path.join(contentDir, section))) {
      throw new Error(
        `No markdown files found in ${path.join(contentDir, section)}. Is the content repo checked out at ${contentDir}? (git clone https://github.com/IronDumpling/chuyue-content.git content)`
      )
    }
  }
}

export function syncContentImages(contentDir: string, publicDir: string): string[] {
  const source = path.join(contentDir, 'images')
  if (!fs.existsSync(source)) {
    throw new Error(`Missing ${source}: the content repo should contain an images/ folder.`)
  }

  const copied: string[] = []
  for (const entry of fs.readdirSync(source, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue
    const destination = path.join(publicDir, 'images', entry.name)
    fs.rmSync(destination, { recursive: true, force: true })
    fs.cpSync(path.join(source, entry.name), destination, { recursive: true })
    copied.push(entry.name)
  }
  return copied
}
```

- [ ] **Step 6: Run to verify they pass**

Run: `npx vitest run scripts/lib/sync-content.test.ts`
Expected: PASS, 6 tests.

- [ ] **Step 7: Add the CLI and scripts**

Create `scripts/sync-content.ts`:
```ts
import path from 'path'
import { assertContentPresent, syncContentImages } from './lib/sync-content'

function main() {
  const contentDir = path.join(process.cwd(), 'content')
  const publicDir = path.join(process.cwd(), 'public')
  assertContentPresent(contentDir)
  const copied = syncContentImages(contentDir, publicDir)
  console.log(`[content] synced images: ${copied.join(', ')}`)
}

try {
  main()
} catch (error) {
  console.error((error as Error).message)
  process.exit(1)
}
```
In `package.json` `"scripts"` add `"sync:content": "tsx scripts/sync-content.ts"`. Make the sync run first in `prebuild` and `predev`:
- if `prebuild` exists, prefix it: `"prebuild": "npm run sync:content && <existing>"`; otherwise `"prebuild": "npm run sync:content"`;
- same for `predev`.

- [ ] **Step 8: Remove content from the site repo and clone the content repo in its place**

```bash
git rm -r -q content public/images/blog public/images/portfolio
rm -rf content public/images/blog public/images/portfolio
git clone https://github.com/IronDumpling/chuyue-content.git content
```
Append to `.gitignore`:
```
# content lives in the chuyue-content repository (cloned to ./content, images synced to public/images)
/content/
/public/images/blog/
/public/images/portfolio/
```

- [ ] **Step 9: Build and compare against the baseline**

```bash
MSYS_NO_PATHCONV=1 NEXT_PUBLIC_BASE_PATH=/chuyue-secret-base npm run build
diff <(cd out && find . -type f -not -path './_next/*' | sort) <(cd ../out-baseline && find . -type f -not -path './_next/*' | sort)
diff -rq out/images ../out-baseline/images
```
Expected: build shows `Generating static pages (76/76)` and `[content] synced images: blog, portfolio` in the prebuild output; both `diff` commands print nothing (same set of files, byte-identical images). HTML files are not compared byte for byte because each Next build embeds a fresh build id, and `sitemap.xml` embeds the build time. Any "Only in" or "differ" line means a file did not make it across; fix the import before continuing. Then spot-check by eye: `grep -c "<article" out/blog/films-shows/review/her-review/index.html` is `1`, and `ls out/blog/photography/casual` lists the same four folders as the baseline.

- [ ] **Step 10: Prove the guard works**

```bash
mv content content-hidden
MSYS_NO_PATHCONV=1 NEXT_PUBLIC_BASE_PATH=/chuyue-secret-base npm run build
mv content-hidden content
```
Expected: the build stops at the prebuild step with `No markdown files found in ...content\blog`. If it proceeds, the guard is not wired into `prebuild`.

- [ ] **Step 11: Commit**

```bash
git add scripts package.json package-lock.json .gitignore
git commit -m "refactor: move content to the chuyue-content repository"
```
(The removals staged by `git rm` are included.)

---

### Task 3: Deploy workflow checks out the content repo

**Files:**
- Modify: `.github/workflows/deploy.yml`

- [ ] **Step 1: Add the dispatch trigger and the checkout step**

In `.github/workflows/deploy.yml` change the `on:` block to
```yaml
on:
  push:
    branches:
      - main
  workflow_dispatch:
  repository_dispatch:
    types: [content-updated]
```
and in the `build` job add, directly after the existing `Checkout` step and before `Setup Node.js`:
```yaml
      - name: Checkout content
        uses: actions/checkout@v4
        with:
          repository: IronDumpling/chuyue-content
          path: content
```
Keep everything else (Node setup, `npm ci`, the build step with `NEXT_PUBLIC_BASE_PATH`, Pages upload and deploy) as is. The build step runs `npm run build`, whose `prebuild` syncs images and refuses to build without content.

- [ ] **Step 2: Test the workflow on the branch before merging**

Push the branch. In GitHub > Actions > "Deploy to GitHub Pages" > Run workflow, choose your branch. Expected: the `build` job is green (it checked out both repos, printed `[content] synced images: blog, portfolio`, and built 76 pages). The `deploy` job may be refused by the `github-pages` environment's branch rule; that is expected and fine for this test. If the build job fails with "No markdown files found", the checkout `path` is wrong.

- [ ] **Step 3: Merge to `main` and confirm production**

Merge the branch to `main`. Expected: the push-triggered workflow builds and deploys. Open the live site and check a blog post and the portfolio section on the home page (which uses hard-coded portfolio image paths). Compare a few pages with how they looked before.

- [ ] **Step 4: Commit (if done directly on the branch)**

```bash
git add .github/workflows/deploy.yml
git commit -m "ci: check out the content repository before building"
```

---

### Task 4: Content repo triggers a site rebuild

**Files:**
- Create (in the content repo): `.github/workflows/notify-site.yml`

- [ ] **Step 1: Create the dispatch token (owner, GitHub web UI)**

GitHub > Settings > Developer settings > Personal access tokens > Fine-grained tokens > Generate new token. Resource owner: your account. Repository access: only the site repo (`IronDumpling/chuyue-secret-base`). Repository permissions: Contents: Read and write. Copy the token.

- [ ] **Step 2: Store it as a secret in the content repo (owner)**

`chuyue-content` > Settings > Secrets and variables > Actions > New repository secret. Name `SITE_DISPATCH_TOKEN`, value the token.

- [ ] **Step 3: Add the workflow to the content repo**

In `../chuyue-content` create `.github/workflows/notify-site.yml` (replace `IronDumpling/chuyue-secret-base` with the confirmed `owner/name`, for example `IronDumpling/chuyue.github.io`):
```yaml
name: Notify site

on:
  push:
    branches: [main]

jobs:
  dispatch:
    runs-on: ubuntu-latest
    steps:
      - name: Trigger site rebuild
        run: >
          curl --fail-with-body -X POST
          -H "Authorization: Bearer ${{ secrets.SITE_DISPATCH_TOKEN }}"
          -H "Accept: application/vnd.github+json"
          https://api.github.com/repos/IronDumpling/chuyue-secret-base/dispatches
          -d '{"event_type":"content-updated"}'
```
`--fail-with-body` makes the job fail visibly on a bad token or wrong repo name instead of silently doing nothing.

Commit and push from the content repo:
```bash
cd ../chuyue-content
git add .github/workflows/notify-site.yml
git commit -m "ci: rebuild the site when content changes"
git push
cd ../chuyue-secret-base
```

- [ ] **Step 4: Test the full loop**

In the content repo, edit one word in a post directly on GitHub (pencil icon on any `.mdx`) and commit to `main`. Expected, within about 3 minutes: (1) the content repo's "Notify site" run is green; (2) the site repo shows a new "Deploy to GitHub Pages" run whose trigger is `repository_dispatch`; (3) the live page shows the edited word. Revert the edit afterwards the same way.

If (1) fails with 401/403/404, the token or `IronDumpling/chuyue-secret-base` is wrong. If (1) is green but (2) never appears, `deploy.yml` with `repository_dispatch` has not reached the site's default branch.

- [ ] **Step 5: Test that bursts are safe**

Make two quick commits in a row in the content repo. Expected: two dispatch events, two site runs that queue one after the other (the existing `concurrency: pages` group with `cancel-in-progress: false`), and the final site matches the latest content.

---

### Task 5: Documentation

**Files:**
- Modify: `README.md` (site repo)

- [ ] **Step 1: Update the README**

In the site `README.md`: in "Installation" add a step after `npm install`:
```md
3. Clone the content repository into `content/`:
```bash
git clone https://github.com/IronDumpling/chuyue-content.git content
```
```
Replace the "Project Structure" `content/` line with `├── content/                # clone of the chuyue-content repository (git-ignored)`. Replace the "Adding Content" opening with a sentence saying posts, projects and their images live in the `chuyue-content` repository (`blog/`, `portfolio/`, `images/`), can be edited from a phone through `/admin/` (plan 03), and every push there rebuilds the site. Add a note that `npm run sync:content` runs automatically before `dev` and `build`.

- [ ] **Step 2: Commit**

```bash
git add README.md
git commit -m "docs: describe the two-repository setup"
```

## Rollback

If anything goes wrong after merging: `git revert` the merge commit in the site repo. The old `content/` and `public/images/{blog,portfolio}` come back from history, and the deploy workflow returns to its previous form. The content repo can stay; it is inert.

## Self-Review

- **Spec coverage:** separate public content repo (Task 1), Pages deploy still via Actions in the site repo (Task 3), automatic rebuild on content push through `repository_dispatch` with a token that is never on the phone (Task 4), unchanged URLs (Global Constraints and Task 2 step 9 diff), empty-site guard (Task 2 steps 5 and 10), documentation (Task 5).
- **Placeholders:** `IronDumpling/chuyue-secret-base` is the confirmed owner/name of the site repository (roadmap open question 1), supplied by the owner.
- **Type consistency:** `assertContentPresent` and `syncContentImages` have the same signatures in the tests, the library and the CLI.
- **Known limits:** the content repo starts with a fresh history and the site repo's history still contains the old content and images (`.git` size is unchanged). The `PortfolioSection` images depend on the sync step, so a build without `npm run prebuild` (for example running `next build` directly) will miss them.
