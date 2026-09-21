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
