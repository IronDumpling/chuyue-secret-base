# Chuyue Secret Base

A modern portfolio and blog website built with Next.js, MDX, and Tailwind CSS.

## Features

- **Portfolio**: Showcase projects in four categories (Student Projects, Work Projects, Video Games, Applications)
- **Blog**: Write reviews and recommendations with MDX support
- **Dark Mode**: Toggle between light and dark themes
- **Responsive Design**: Optimized for all device sizes
- **Static Site Generation**: Fast, SEO-friendly static pages
- **GitHub Pages Deployment**: Automated deployment via GitHub Actions

## Tech Stack

- Next.js 14+ (App Router, SSG mode)
- TypeScript
- Tailwind CSS
- MDX (for blog posts and portfolio projects)
- GitHub Actions (for CI/CD)

## Getting Started

### Prerequisites

- Node.js 20+
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/IronDumpling/chuyue-secret-base.git
cd chuyue-secret-base
```

2. Install dependencies:
```bash
npm install
```

3. Clone the content repository into `content/` (blog posts, portfolio projects and their images live there, not in this repo):
```bash
git clone https://github.com/IronDumpling/chuyue-content.git content
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

`npm run dev` and `npm run build` first run `npm run sync:content`, which copies `content/images/*` into `public/images/` and stops with an error if `content/` is missing or has no posts, so an empty site is never built.

## Project Structure

```
chuyue-secret-base/
├── app/                    # Next.js App Router pages
│   ├── [lang]/            # the site, once per language (/en/..., /zh/...)
│   └── (legacy)/          # the root URL and pre-language URLs, which redirect to /en/
├── components/             # React components
├── content/                # clone of the chuyue-content repository (git-ignored)
│   ├── blog/              # Blog post MDX files
│   ├── portfolio/         # Portfolio project MDX files
│   └── images/            # Blog and portfolio images (synced to public/images)
├── lib/                   # Utility functions
│   └── i18n/              # locales, paths and the en/zh dictionaries
├── public/                # Static assets
└── .github/workflows/     # GitHub Actions workflows
```

## Adding Content

Content lives in the separate repository [`chuyue-content`](https://github.com/IronDumpling/chuyue-content). Commit and push there (from your clone in `content/`, or on GitHub). Every push to its `main` branch triggers a rebuild and deploy of this site through GitHub Actions (`repository_dispatch`, see `.github/workflows/deploy.yml`). Put images in `content/images/blog/...` or `content/images/portfolio/...` and reference them as `/images/blog/...` or `/images/portfolio/...`.

### Portfolio Projects

Create a new MDX file in `content/portfolio/{category}/{slug}.mdx` (in the content repo):

```mdx
---
title: "Project Name"
category: "video-games"  # student-projects, video-games, or applications
date: "2024-01-01"
tags: ["Unity", "C#"]
github: "https://github.com/..."
demo: "https://..."
images:
  - "/images/project-image.png"
description: "Project description"
---

# Project Name

Your project content here...
```

### Blog Posts

Create a new MDX file in `content/blog/{category}/{type}/{slug}.mdx` (in the content repo; add `.zh` before the extension for the Chinese version, see Languages), where `category` is one of `photography`, `illustration`, `films-shows`, `music`, `video-games`, `books` and `type` is `review` or `casual`:

```mdx
---
title: "Post Title"
category: "review"  # review or casual
subcategory: "movies"  # music, movies, video-games, shows, or books (only for review)
date: "2024-01-15"
tags: ["Sci-Fi", "Thriller"]
rating: 5  # Only for review posts
description: "Post description"
---

# Post Title

<Rating score={5} />

Your blog content here...
```

For casual posts (no subcategory or rating):

```mdx
---
title: "Casual Post Title"
category: "casual"
date: "2024-01-15"
tags: ["Thoughts", "Life"]
description: "Post description"
---

# Casual Post Title

Your casual blog content here...
```

## Languages

The site is bilingual: English (default) at `/en/...` and Chinese at `/zh/...`. The root URL `/` and the old unprefixed URLs (`/blog/...`, `/portfolio/...`) are small redirect pages, because GitHub Pages cannot send HTTP redirects; they go to `/en/...` (the root goes to the language the visitor last picked, if any).

- **Interface text** lives in `lib/i18n/dictionaries/en.ts` (the source of truth) and `zh.ts`, which must have the same shape: a missing translation is a type error. Skills and experience entries carry `{ en, zh }` pairs next to their data (`lib/i18n/localized.ts`); a plain string means "same in both languages".
- **Posts and projects** are written once per language: `her-review.en.mdx` and `her-review.zh.mdx` in the same folder, same slug. A file without a language suffix (`her-review.mdx`) counts as English. If a language is missing, the page shows the other language with a notice, and its canonical link points at the real one.
- Share cards are generated per language (`public/share/og/{en,zh}/...`); Chinese cards need a CJK font, downloaded from Google Fonts at build time and cached in `.cache/fonts`. The build fails rather than shipping cards with empty boxes.

## Building for Production

```bash
npm run build
```

This generates a static site in the `out/` directory, ready for deployment.

## Deployment

The site is automatically deployed to GitHub Pages via GitHub Actions when you push to the `main` branch.

## License

All rights reserved.
