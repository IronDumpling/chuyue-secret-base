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
