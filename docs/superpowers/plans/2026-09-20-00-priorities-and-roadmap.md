# Roadmap and Priorities (based on the actual repo)

Written 2026-09-20. This ranks the workstreams from the external "chuyue-content + editor + sharing" plan against what this repo actually contains. Each numbered workstream has its own implementation plan in this folder.

## What the repo looks like today (verified 2026-09-20)

| Fact | Evidence | Why it matters |
|---|---|---|
| Next.js 14 static export, deployed to GitHub Pages on every push to `main` | `next.config.js` (`output: 'export'`, `trailingSlash: true`), `.github/workflows/deploy.yml` | The "no server, Actions publishes" architecture already exists. Nothing to build here. |
| Text is tiny, images are huge | `content/` = 209 KB (46 MDX files). `public/` = 187 MB (blog 96 MB, portfolio 59 MB, about 24 MB). 49 files >1 MB, 16 files >3 MB, largest is a 16 MB PNG. Built `out/` = 192 MB. `.git` = 337 MB. | The weight problem is images, not MDX. Decision 2026-09-20: no separate compression plan; images are migrated as they are and new uploads are compressed by the CMS (plan 03). |
| `images.unoptimized: true`, plain `<img>` tags | `next.config.js`, `components/shared/SafeImage.tsx` | Visitors download the full-size originals. A phone upload of a 5 MB photo goes straight to production. |
| Site has no link-preview metadata | `app/layout.tsx` sets only `title`/`description`. No `openGraph`, no `metadataBase`, no per-page `generateMetadata`. | Sharing a link to Instagram DM or a chat app today shows a bare link. |
| Site URL hard-coded twice | `app/sitemap.ts`, `app/robots.ts` both hard-code `https://irondumpling.github.io/chuyue-secret-base` | Needs one source of truth before any absolute URL (og image, QR code, RSS) is generated. |
| Repo name vs. URL (resolved) | Local `origin` still pointed at the old name `IronDumpling/chuyue.github.io`; the repo is now `IronDumpling/chuyue-secret-base`, matching `NEXT_PUBLIC_BASE_PATH=/chuyue-secret-base` | Live URL is `https://irondumpling.github.io/chuyue-secret-base/`. Absolute URLs in plans 02-05 use it. |
| UI and most content are English | 41 of 46 content files contain no Chinese. Header, buttons, section titles are hard-coded English strings. | Bilingual routing would mean translating the whole UI and moving every route, for 5 files of Chinese content. |
| Content is loaded by filename, not folder-per-post | `lib/mdx.ts`, `lib/blog.ts`: `slug = basename(file)`, path `blog/{category}/{type}/{slug}.mdx` | The proposed `film-review/her/zh.mdx` layout would need every loader and route rewritten. |
| Category/type come from the directory, not frontmatter | `lib/blog.ts` overrides `category`/`type` | A CMS can write into these folders directly. |
| Frontmatter has mixed shapes | Blog `website:` is an object; portfolio `github`/`demo` are string OR list of `{url,label}` | A form-based editor cannot round-trip portfolio links safely yet. Blog only for now. |
| Photography posts already hold 6 curated images each | `content/blog/photography/casual/*.mdx` | The "3-6 curated photos + Shutterstock link" first version already exists. The blog page already renders a `website: {url,label}` button; no photography post uses it yet. |
| No tests, no lint config, no CI checks | `package.json` has no test script | Plan 07 installs `vitest` and `tsx` once; later plans reuse them. |
| Baseline build passes | `next build` generated 76 static pages on 2026-09-20 | Every plan ends with the same build as its regression check. |

## Verdicts on the external plan

| External plan item | Verdict | Reason |
|---|---|---|
| Phase 1: separate `chuyue-content` repo | **Do (owner decision, public repo)** — [plan 07](2026-09-20-07-content-repo-split.md) | "Easier phone editing" alone is not a reason (the editor works on any repo). The real reasons are: the phone token can then only touch content, not site code and deploy config; and uploaded photos stop growing the code repo's history. Cost: a checkout step, a dispatch workflow with one cross-repo token, and an image sync step. Deploy stays in the site repo through GitHub Actions. |
| Phase 4: mobile editor (Sveltia CMS) | **Do, pointed at the content repo** | Highest daily-use value. Config only, no server. Needs a frontmatter date fix, and compresses new photos on the phone before upload (see plan 03). |
| Phase 3: og image + poster + share button | **Do, split in two** | Link cards first (plan 02), poster + share buttons second (plan 04). Generated at build time as real `.jpg` files, because static export may serve extensionless generated image routes with a wrong content type. |
| Phase 2: `/zh` `/en` routes | **Defer, but keep one rule** | See "Internationalization" below. |
| Phase 6: RSS, structured data, analytics | **Do, small** | Sitemap and robots already exist. Plan 05. |
| Phase 5: Shutterstock auto-read | **Spike only** | The manual button already works. The API is buyer-oriented and the terms are unverified. Plan 06 is a time-boxed probe with a written go/no-go. |
| Portfolio uses the same editor | **Later** | Link fields are mixed-shape (see above). Add after the blog editor round-trips cleanly. |

## Priority order

| # | Plan | Effort | Depends on | Why this position |
|---|---|---|---|---|
| 1 | [07 Content repo split](2026-09-20-07-content-repo-split.md) | M | none | Must come first: the other plans read `content/` and write to the content repo. Also installs `vitest` and `tsx` for all later plans. |
| 2 | [02 Link previews](2026-09-20-02-link-previews.md) | M | 07 | Zero preview metadata today, so this is the most visible payoff. Also creates the single site-URL module and the build-time image renderer plan 04 reuses. |
| 3 | [03 Mobile editor](2026-09-20-03-mobile-editor.md) | M | 07 | Removes the friction of publishing from a phone; its token can only write the content repo. Can swap places with 02 if you would rather post first and polish sharing after. |
| 4 | [04 Poster and share buttons](2026-09-20-04-share-poster.md) | M | 02 | Poster with QR code for chat apps and stories, plus copy / save / system-share buttons. |
| 5 | [05 Discoverability](2026-09-20-05-discoverability.md) | S | 02 (one small edit) | RSS, structured data, analytics. |
| 6 | [06 Shutterstock spike](2026-09-20-06-shutterstock-spike.md) | S | 07 (for where the files live) | Only produces a decision. The manual button task inside it needs one URL from you. |

The plan file numbers are creation order, not execution order; follow the table. (A former plan 01, image compression, was dropped on 2026-09-20, so there is no `01` file.)

Dependency sketch: `07 -> 02 -> 04`, `07 -> 03`, `02 -> 05`. Plans 03 and 05 are otherwise independent of each other.

## Internationalization (deferred, with a rule to keep it cheap)

Do not start `/zh` `/en` routing yet. Reasons: `output: 'export'` has no middleware, so "pick language on first visit" becomes a client-side redirect. Every page under `app/` would have to move under `app/[lang]/`. All hard-coded UI strings need translating. Only 5 of 46 content files are Chinese.

The external plan says routing must come before sharing, or shared links break. That only holds if existing URLs move. **Rule: existing URLs never change.** Plans 02-05 all emit the current unprefixed URLs as canonical. When bilingual support is wanted, the cheap route is: keep today's URLs as the default locale, add a sibling `slug.zh.mdx` for translated posts, and add a `/zh/...` subtree that only exists for those posts. That makes bilingual support additive and does not break any link already shared.

Decision needed from you before writing that plan: which language is the default for the unprefixed URLs, and do you want the UI (menus, buttons) translated or only the articles?

## Open questions that block execution

1. ~~What is the live site URL?~~ Resolved 2026-09-20: site repo `IronDumpling/chuyue-secret-base`, live URL `https://irondumpling.github.io/chuyue-secret-base/`.
2. Your Shutterstock contributor/portfolio URL. Blocks task 1 of plan 06.
3. Two GitHub fine-grained personal access tokens, both created by you and never committed: (a) `SITE_DISPATCH_TOKEN`, scoped to the site repo only, Contents: read and write, stored as an Actions secret in `chuyue-content` (plan 07); (b) the CMS login token for your phone, scoped to `chuyue-content` only, Contents: read and write (plan 03).
4. ~~Create the empty public repo `chuyue-content`~~ Done: the owner cloned it to `C:/Users/irond/Documents/self_project/chuyue-content`.

## Not covered

- Rewriting git history to shrink `.git` (337 MB). Neither the split nor anything else here shrinks history. A history rewrite is destructive and is your call.
- Cross-posting to Xiaohongshu / Instagram. Manual, after plan 04 produces the poster.
