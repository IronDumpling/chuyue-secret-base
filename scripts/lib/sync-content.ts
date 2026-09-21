import fs from 'fs'
import path from 'path'
import { getCategories, isValidCategory } from '../../lib/taxonomy'

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

// Every folder with posts in it must be a category of lib/taxonomy.ts. Without this, content
// laid out for an older or newer taxonomy would build "successfully" and just be missing
// its posts, because the site only looks in the folders it knows.
export function assertContentLayout(contentDir: string): void {
  const problems: string[] = []

  for (const section of ['blog', 'portfolio'] as const) {
    const root = path.join(contentDir, section)
    if (!fs.existsSync(root)) continue
    const known = getCategories(section).join(', ')

    for (const entry of fs.readdirSync(root, { withFileTypes: true })) {
      const dir = path.join(root, entry.name)
      if (!entry.isDirectory()) {
        if (/\.mdx?$/.test(entry.name)) {
          problems.push(`${section}/${entry.name}: put posts in a category folder (${known})`)
        }
        continue
      }
      // A leftover empty folder holds nothing to lose.
      if (!hasMarkdown(dir)) continue

      if (!isValidCategory(section, entry.name)) {
        problems.push(`${section}/${entry.name}/ is not a ${section} category (known: ${known})`)
        continue
      }
      for (const sub of fs.readdirSync(dir, { withFileTypes: true })) {
        if (sub.isDirectory() && hasMarkdown(path.join(dir, sub.name))) {
          problems.push(`${section}/${entry.name}/${sub.name}/: put files directly in ${section}/${entry.name}/`)
        }
      }
    }
  }

  if (problems.length > 0) {
    throw new Error(
      `The content layout does not match lib/taxonomy.ts:\n  - ${problems.join('\n  - ')}\nUpdate the content repo (or the taxonomy) so they agree.`
    )
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
