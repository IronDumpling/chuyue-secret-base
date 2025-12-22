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

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
chuyue-secret-base/
├── app/                    # Next.js App Router pages
├── components/             # React components
├── content/                # MDX content files
│   ├── portfolio/         # Portfolio project MDX files
│   └── blog/              # Blog post MDX files
├── lib/                   # Utility functions
├── public/                # Static assets
└── .github/workflows/     # GitHub Actions workflows
```

## Adding Content

### Portfolio Projects

Create a new MDX file in `content/portfolio/{category}/{slug}.mdx`:

```mdx
---
title: "Project Name"
category: "video-games"  # student-projects, work-projects, video-games, or applications
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

For review posts (with subcategory), create a new MDX file in `content/blog/review/{subcategory}/{slug}.mdx`:

For casual posts (no subcategory), create a new MDX file in `content/blog/casual/{slug}.mdx`:

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

<Rating stars={5} />

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

## Building for Production

```bash
npm run build
```

This generates a static site in the `out/` directory, ready for deployment.

## Deployment

The site is automatically deployed to GitHub Pages via GitHub Actions when you push to the `main` branch.

## License

All rights reserved.
