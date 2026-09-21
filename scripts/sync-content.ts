import path from 'path'
import { assertContentLayout, assertContentPresent, syncContentImages } from './lib/sync-content'
import { assertContentLanguages } from './lib/content-language'

function main() {
  const contentDir = path.join(process.cwd(), 'content')
  const publicDir = path.join(process.cwd(), 'public')
  assertContentPresent(contentDir)
  assertContentLayout(contentDir)
  assertContentLanguages(contentDir)
  const copied = syncContentImages(contentDir, publicDir)
  console.log(`[content] synced images: ${copied.join(', ')}`)
}

try {
  main()
} catch (error) {
  console.error((error as Error).message)
  process.exit(1)
}
