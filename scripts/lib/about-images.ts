import fs from 'fs'
import { orderedIdentities, type Identity } from '../../lib/identity'

const IMAGE_FILE = /^(engineer|creator|adventurer)-(\d+)\.(jpe?g|png|webp|avif|gif)$/i

// The About card's pictures are whatever files are named <identity>-<n>.<ext> in the
// folder, in the order of n. Adding or removing a picture needs no code change.
export function collectAboutImages(dir: string): Record<Identity, string[]> {
  const found = Object.fromEntries(orderedIdentities.map(id => [id, [] as { n: number; file: string }[]])) as Record<
    Identity,
    { n: number; file: string }[]
  >

  const files = fs.existsSync(dir) ? fs.readdirSync(dir) : []
  for (const file of files) {
    const match = IMAGE_FILE.exec(file)
    if (!match) continue
    found[match[1].toLowerCase() as Identity].push({ n: Number(match[2]), file })
  }

  return Object.fromEntries(
    orderedIdentities.map(id => [id, found[id].sort((a, b) => a.n - b.n).map(({ file }) => `/images/about/${file}`)])
  ) as Record<Identity, string[]>
}
