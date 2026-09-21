# A category is its folder and its URL; groups are only for the menu

Status: accepted (2026-09-21)

## Context

Categories were listed by hand in about six places (the loaders, both list components, two route files, the type definitions, the name maps), and a review/casual "type" was a second folder level and a second URL segment. Changing a category meant editing all of them and moving files, and every change of grouping changed URLs. The lists also mixed two kinds of thing: what a piece of work is (application, game) and where it was made (student project).

## Decision

- `lib/taxonomy.ts` is the only list of sections, groups and categories.
- A **category** id is the folder name under `content/{section}/` and the URL segment: `/blog/films/her-review/`. There is no further folder level.
- A **group** only shapes the filter menu. It never appears in a folder or a URL.
- Categories are split by **what the work is**. Where it was made (`course`, `research`, `work`, `personal`) is a `context` field shown as a badge, never a category.
- Display names live in the per-language dictionaries, not in the taxonomy.
- The build fails when a folder that contains posts is not a category of its section (`scripts/lib/sync-content.ts`, `assertContentLayout`).

## Consequences

- Adding a category is one line in the taxonomy, two dictionary entries and a folder. Regrouping, or turning a group into its own section, changes no files and no URLs.
- Old URLs were not kept (`/blog/films-shows/review/...`, `/blog/photography/casual/...`, `/portfolio/student-projects/...`), because the site is young and GitHub Pages cannot send real redirects. Portfolio URLs that did not change (`/portfolio/applications/...`) still work through the existing language redirect.
- Moving a category to another **section** (as photography and illustration moved from blog to portfolio) still changes its URLs. Keep sections few and stable.
- The site and `chuyue-content` must change together. The site is merged first: new site code with old content fails the build (nothing is deployed), whereas old site code with new content would build without the moved posts.
