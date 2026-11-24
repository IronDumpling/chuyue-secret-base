import fs from 'fs'
import sharp from 'sharp'
import { coverDataUri } from './card'

// Pictures a poster is built from, prepared with sharp because satori cannot filter images.

const WIDTH = 1080
const HEIGHT = 1920
// Mean channel value (0-255) a blurred background may reach at most.
const TARGET_MEAN = 42

// The poster's own picture, blurred and darkened to fill the whole 1080x1920 page. It is cut
// ~10% larger and cropped back, so the blur's soft edge never shows as a grey frame.
export async function blurredBackgroundDataUri(filePath: string | null): Promise<string | undefined> {
  if (!filePath || !fs.existsSync(filePath)) return undefined
  try {
    const margin = 108
    const soft = await sharp(filePath)
      .rotate()
      .resize(WIDTH + margin * 2, HEIGHT + margin * 2, { fit: 'cover' })
      .blur(60)
      .toBuffer()
    // Darken to 35%, but never leave the page brighter than an average photo would: a white
    // diagram cover at 35% is mid grey, and the series must stay uniformly dark.
    const { channels } = await sharp(soft).stats()
    const mean = channels.slice(0, 3).reduce((sum, c) => sum + c.mean, 0) / 3
    const brightness = Math.min(0.35, TARGET_MEAN / Math.max(mean, 1))
    const blurred = await sharp(soft).modulate({ brightness, saturation: 0.9 }).toBuffer()
    const buffer = await sharp(blurred)
      .extract({ left: margin, top: margin, width: WIDTH, height: HEIGHT })
      .jpeg({ quality: 70 })
      .toBuffer()
    return `data:image/jpeg;base64,${buffer.toString('base64')}`
  } catch {
    return undefined
  }
}

// The sharp picture that floats on the blurred background.
export function posterImageDataUri(filePath: string | null, width: number, height: number) {
  return coverDataUri(filePath, width, height)
}

// The author's face for the signature row. Every poster has one, so a missing file is an error.
export async function avatarDataUri(filePath: string): Promise<string> {
  const buffer = await sharp(filePath).rotate().resize(160, 160, { fit: 'cover' }).jpeg({ quality: 85 }).toBuffer()
  return `data:image/jpeg;base64,${buffer.toString('base64')}`
}
