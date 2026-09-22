import QRCode from 'qrcode'
import { h, clip, type Node } from './card'

export interface PosterInput {
  title: string
  badge?: string
  description?: string
  coverDataUri?: string
  qrDataUri: string
  brand: string
  scanLine: string
}

const WIDTH = 1080
const HEIGHT = 1920
const COVER = 1080

export async function qrDataUri(url: string): Promise<string> {
  return QRCode.toDataURL(url, { margin: 1, width: 440, color: { dark: '#0f172a', light: '#ffffff' } })
}

export function buildPosterTree(input: PosterInput): Node {
  const cover = input.coverDataUri
    ? h('img', { src: input.coverDataUri, width: WIDTH, height: COVER, style: { width: WIDTH, height: COVER } })
    : h('div', {
        style: {
          display: 'flex',
          width: WIDTH,
          height: COVER,
          backgroundImage: 'linear-gradient(135deg, #1e3a8a, #0f172a)',
        },
      })

  return h(
    'div',
    {
      style: {
        display: 'flex',
        flexDirection: 'column',
        width: WIDTH,
        height: HEIGHT,
        backgroundColor: '#0f172a',
        color: 'white',
      },
    },
    cover,
    h(
      'div',
      { style: { display: 'flex', flexDirection: 'column', flexGrow: 1, padding: '56px 72px 64px 72px' } },
      input.badge
        ? h('div', { style: { display: 'flex', fontSize: 32, opacity: 0.85, marginBottom: 20 } }, input.badge)
        : null,
      h('div', { style: { display: 'flex', fontSize: 68, fontWeight: 700, lineHeight: 1.25 } }, clip(input.title, 36)),
      input.description
        ? h(
            'div',
            { style: { display: 'flex', fontSize: 32, lineHeight: 1.5, opacity: 0.75, marginTop: 24 } },
            clip(input.description, 90)
          )
        : null,
      h('div', { style: { display: 'flex', flexGrow: 1 } }),
      h(
        'div',
        { style: { display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' } },
        h(
          'div',
          { style: { display: 'flex', flexDirection: 'column' } },
          h('div', { style: { display: 'flex', fontSize: 36, fontWeight: 700 } }, input.brand),
          h('div', { style: { display: 'flex', fontSize: 26, opacity: 0.7, marginTop: 10 } }, input.scanLine)
        ),
        h(
          'div',
          { style: { display: 'flex', padding: 12, backgroundColor: 'white', borderRadius: 16 } },
          h('img', { src: input.qrDataUri, width: 200, height: 200, style: { width: 200, height: 200 } })
        )
      )
    )
  )
}
