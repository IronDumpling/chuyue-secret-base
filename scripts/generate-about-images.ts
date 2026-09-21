import fs from 'fs'
import path from 'path'
import { collectAboutImages } from './lib/about-images'

const ROOT = process.cwd()
const OUT = path.join(ROOT, 'lib', 'generated', 'about-images.json')

const images = collectAboutImages(path.join(ROOT, 'public', 'images', 'about'))

fs.mkdirSync(path.dirname(OUT), { recursive: true })
fs.writeFileSync(OUT, JSON.stringify(images, null, 2) + '\n')
console.log(
  'About images: ' +
    Object.entries(images)
      .map(([identity, list]) => `${identity} ${list.length}`)
      .join(', ')
)
