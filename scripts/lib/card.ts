import fs from 'fs'
import satori from 'satori'
import { Resvg } from '@resvg/resvg-js'
import sharp from 'sharp'
import type { FontData } from './fonts'

export interface Node {
  type: string
  props: Record<string, unknown>
}

// satori accepts plain React-element-shaped objects, so no JSX or React import is needed.
export function h(type: string, props: Record<string, unknown>, ...children: unknown[]): Node {
  return {
    type,
    props: { ...props, children: children.length <= 1 ? children[0] : children },
  }
}

export interface CardInput {
  title: string
  badge?: string
  coverDataUri?: string
}

const WIDTH = 1200
const HEIGHT = 630

function clip(text: string, max: number): string {
  const chars = Array.from(text)
  return chars.length <= max ? text : `${chars.slice(0, max - 1).join('')}…`
}

export function buildCardTree(input: CardInput): Node {
  const background = input.coverDataUri
    ? h('img', {
        src: input.coverDataUri,
        width: WIDTH,
        height: HEIGHT,
        style: { position: 'absolute', top: 0, left: 0, width: WIDTH, height: HEIGHT },
      })
    : null

  return h(
    'div',
    {
      style: {
        display: 'flex',
        position: 'relative',
        width: WIDTH,
        height: HEIGHT,
        backgroundImage: 'linear-gradient(135deg, #1e3a8a, #0f172a)',
        color: 'white',
      },
    },
    background,
    h('div', {
      style: {
        position: 'absolute',
        top: 0,
        left: 0,
        width: WIDTH,
        height: HEIGHT,
        backgroundImage: 'linear-gradient(to top, rgba(0,0,0,0.85), rgba(0,0,0,0.05))',
      },
    }),
    h(
      'div',
      {
        style: {
          position: 'absolute',
          left: 64,
          right: 64,
          bottom: 56,
          display: 'flex',
          flexDirection: 'column',
        },
      },
      input.badge
        ? h('div', { style: { display: 'flex', fontSize: 28, opacity: 0.85, marginBottom: 16 } }, input.badge)
        : null,
      h('div', { style: { display: 'flex', fontSize: 68, fontWeight: 700, lineHeight: 1.2 } }, clip(input.title, 44)),
      h('div', { style: { display: 'flex', fontSize: 26, opacity: 0.7, marginTop: 24 } }, 'Chuyue · System Designer')
    )
  )
}

export async function renderJpeg(tree: Node, width: number, height: number, fonts: FontData[]): Promise<Buffer> {
  const svg = await satori(tree as never, { width, height, fonts: fonts as never })
  const png = new Resvg(svg, { fitTo: { mode: 'width', value: width } }).render().asPng()
  return sharp(png).jpeg({ quality: 86 }).toBuffer()
}

export async function coverDataUri(
  filePath: string | null,
  width: number,
  height: number
): Promise<string | undefined> {
  if (!filePath || !fs.existsSync(filePath)) return undefined
  try {
    const buffer = await sharp(filePath).rotate().resize(width, height, { fit: 'cover' }).jpeg({ quality: 80 }).toBuffer()
    return `data:image/jpeg;base64,${buffer.toString('base64')}`
  } catch {
    return undefined
  }
}
