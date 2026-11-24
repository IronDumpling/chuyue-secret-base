import QRCode from 'qrcode'
import { h, clip, type Node } from './card'
import { containsCjk } from './card-texts'
import type { PosterContent, PosterLayout } from './poster-content'

// One visual system for every share poster (see docs/superpowers/specs/...-share-poster-redesign):
// a dark #0F172A page under the entry's own picture, blurred; a top bar with the category
// label and date; a layout of its own per kind of entry; and the same signature row at the
// bottom of all of them. Sky blue appears only on the label, the avatar ring and one key
// number (a review's score, a moment's day).

export interface PosterInput {
  content: PosterContent
  backgroundDataUri?: string // blurred picture; without it the page gets the sky-blue glow
  imageDataUri?: string // the sharp picture; without it the layout leaves that block out
  avatarDataUri: string
  qrDataUri: string
  signature: string // meta.siteName
  scanLine: string // share.posterScan
}

const WIDTH = 1080
const HEIGHT = 1920
const SIDE = 86 // text inset
const IMAGE_SIDE = 70 // picture inset
const IMAGE_WIDTH = WIDTH - IMAGE_SIDE * 2

const INK = '#F1F5F9'
const MUTED = 'rgba(241,245,249,0.55)'
const LINE = 'rgba(241,245,249,0.18)'
const ACCENT = '#7DD3FC'
const BASE = '#0F172A'

const SANS = 'Noto Sans SC'
const SERIF = 'Noto Serif SC'

// Size of the sharp picture each layout shows, so the build cuts it to fit exactly.
export const POSTER_IMAGE_SIZE: Record<PosterLayout, { width: number; height: number } | null> = {
  project: { width: IMAGE_WIDTH, height: 560 },
  review: { width: IMAGE_WIDTH, height: 734 },
  art: { width: IMAGE_WIDTH, height: 1060 },
  moment: { width: IMAGE_WIDTH, height: 760 },
  novel: null,
}

// An art poster with a gameplay line gives the picture up some height to fit it.
export function posterImageSize(c: PosterContent): { width: number; height: number } | null {
  if (c.layout === 'art' && c.description) return { width: IMAGE_WIDTH, height: 900 }
  return POSTER_IMAGE_SIZE[c.layout]
}

export async function qrDataUri(url: string): Promise<string> {
  return QRCode.toDataURL(url, { margin: 1, width: 440, color: { dark: '#0f172a', light: '#ffffff' } })
}

// A CJK title set vertically: one character per cell, columns read right to left (the first
// column returned is the rightmost). Too long a title ends in an ellipsis.
export function verticalColumns(title: string, perColumn = 8, maxColumns = 2): string[][] {
  const chars = Array.from(title)
  const capacity = perColumn * maxColumns
  const fitted = chars.length <= capacity ? chars : [...chars.slice(0, capacity - 1), '…']
  const columns: string[][] = []
  for (let i = 0; i < fitted.length; i += perColumn) columns.push(fitted.slice(i, i + perColumn))
  return columns
}

const flex = (style: Record<string, unknown> = {}) => ({ display: 'flex', ...style })

function background(uri?: string): Node[] {
  const fill = { position: 'absolute', top: 0, left: 0, width: WIDTH, height: HEIGHT }
  if (uri) return [h('img', { src: uri, width: WIDTH, height: HEIGHT, style: fill })]
  return [
    h('div', {
      style: { ...fill, display: 'flex', backgroundImage: 'radial-gradient(circle at 75% 20%, rgba(14,165,233,0.35), rgba(14,165,233,0) 60%)' },
    }),
    h('div', {
      style: { ...fill, display: 'flex', backgroundImage: 'radial-gradient(circle at 10% 90%, rgba(14,165,233,0.15), rgba(14,165,233,0) 55%)' },
    }),
  ]
}

function topBar(label: string, dateText: string): Node {
  return h(
    'div',
    { style: flex({ justifyContent: 'space-between', alignItems: 'baseline', padding: `96px ${SIDE}px 0 ${SIDE}px` }) },
    h('div', { style: flex({ color: ACCENT, fontSize: 38, letterSpacing: 2, fontWeight: 700, fontFamily: SANS }) }, label),
    h('div', { style: flex({ color: MUTED, fontSize: 38, fontFamily: SANS, fontWeight: 400 }) }, dateText)
  )
}

function floatingImage(uri: string, height: number, top: number): Node {
  return h(
    'div',
    {
      style: flex({
        margin: `${top}px ${IMAGE_SIDE}px 0 ${IMAGE_SIDE}px`,
        borderRadius: 26,
        overflow: 'hidden',
        boxShadow: '0 34px 86px rgba(0,0,0,0.4)',
      }),
    },
    h('img', { src: uri, width: IMAGE_WIDTH, height, style: { width: IMAGE_WIDTH, height, objectFit: 'cover' } })
  )
}

function spacer(): Node {
  return h('div', { style: flex({ flexGrow: 1 }) })
}

function signatureRow(input: PosterInput): Node {
  return h(
    'div',
    {
      'data-part': 'signature',
      style: flex({
        flexShrink: 0,
        justifyContent: 'space-between',
        alignItems: 'center',
        margin: `40px 78px 0 78px`,
        padding: '52px 0 70px 0',
        borderTop: `4px solid ${LINE}`,
      }),
    },
    h(
      'div',
      { style: flex({ alignItems: 'center' }) },
      h('img', {
        src: input.avatarDataUri,
        width: 104,
        height: 104,
        style: { width: 104, height: 104, borderRadius: 52, border: `6px solid ${ACCENT}` },
      }),
      h(
        'div',
        { style: flex({ flexDirection: 'column', marginLeft: 34 }) },
        h('div', { style: flex({ fontSize: 52, fontWeight: 700, fontFamily: SANS, color: INK }) }, input.signature),
        h('div', { style: flex({ fontSize: 35, fontWeight: 400, fontFamily: SANS, color: MUTED, marginTop: 8 }) }, input.scanLine)
      )
    ),
    h(
      'div',
      { style: flex({ padding: 13, backgroundColor: 'white', borderRadius: 16 }) },
      h('img', { src: input.qrDataUri, width: 150, height: 150, style: { width: 150, height: 150 } })
    )
  )
}

// Lines are capped, not only characters: an English title wraps sooner than a Chinese one.
function clamped(lines: number) {
  return { display: 'block', lineClamp: lines }
}

function titleText(text: string, size: number, top: number, lines = 2, family = SANS): Node {
  return h(
    'div',
    {
      style: {
        ...clamped(lines),
        fontSize: size,
        fontWeight: 700,
        fontFamily: family,
        lineHeight: 1.25,
        marginTop: top,
        color: INK,
        flexShrink: 0,
      },
    },
    text
  )
}

function bodyText(text: string, size: number, top: number, style: Record<string, unknown> = {}): Node {
  return h(
    'div',
    {
      style: {
        ...clamped(2),
        fontSize: size,
        fontWeight: 400,
        fontFamily: SANS,
        lineHeight: 1.6,
        marginTop: top,
        color: INK,
        flexShrink: 0,
        ...style,
      },
    },
    text
  )
}

function projectLayout({ content: c, imageDataUri }: PosterInput): (Node | null)[] {
  const size = POSTER_IMAGE_SIZE.project!
  return [
    h(
      'div',
      { style: flex({ flexDirection: 'column', padding: `0 ${SIDE}px` }) },
      titleText(c.title, 112, 34),
      c.description ? bodyText(c.description, 46, 26, { opacity: 0.85 }) : null
    ),
    imageDataUri ? floatingImage(imageDataUri, size.height, 70) : null,
    c.specRows.length > 0
      ? h(
          'div',
          { style: flex({ flexDirection: 'column', padding: `70px ${SIDE}px 0 ${SIDE}px` }) },
          ...c.specRows.map((row, i) =>
            h(
              'div',
              { style: flex({ fontSize: 42, fontFamily: SANS, fontWeight: 400, marginTop: i === 0 ? 0 : 30 }) },
              h('div', { style: flex({ width: 172, color: MUTED }) }, row.label),
              h(
                'div',
                { style: { display: 'block', flex: 1, color: INK, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' } },
                row.value
              )
            )
          )
        )
      : null,
  ]
}

function reviewLayout({ content: c, imageDataUri }: PosterInput): (Node | null)[] {
  const size = POSTER_IMAGE_SIZE.review!
  return [
    h(
      'div',
      {
        style: flex({
          flexDirection: 'column',
          margin: `52px ${IMAGE_SIDE}px 0 ${IMAGE_SIDE}px`,
          backgroundColor: 'rgba(15,23,42,0.55)',
          border: `2px solid rgba(241,245,249,0.12)`,
          borderRadius: 34,
          overflow: 'hidden',
        }),
      },
      imageDataUri
        ? h('img', {
            src: imageDataUri,
            width: size.width - 4,
            height: size.height,
            style: { width: size.width - 4, height: size.height, objectFit: 'cover' },
          })
        : null,
      h(
        'div',
        { style: flex({ justifyContent: 'space-between', alignItems: 'flex-start', padding: '48px 56px 0 56px' }) },
        h(
          'div',
          { style: { ...clamped(2), flex: 1, fontSize: 64, fontWeight: 700, fontFamily: SANS, color: INK, lineHeight: 1.25, marginTop: 14 } },
          c.title
        ),
        typeof c.rating === 'number'
          ? h(
              'div',
              { style: flex({ alignItems: 'baseline', marginLeft: 30 }) },
              h('div', { style: flex({ fontSize: 112, fontWeight: 700, fontFamily: SANS, color: ACCENT, lineHeight: 1 }) }, String(c.rating)),
              h('div', { style: flex({ fontSize: 38, fontFamily: SANS, color: MUTED }) }, '/10')
            )
          : null
      ),
      c.description
        ? h(
            'div',
            {
              style: flex({
                padding: '26px 56px 0 56px',
                fontSize: 52,
                fontWeight: 700,
                fontFamily: SERIF,
                lineHeight: 1.6,
                color: INK,
                opacity: 0.9,
              }),
            },
            c.description
          )
        : null,
      h('div', { style: flex({ height: 60 }) })
    ),
  ]
}

function artLayout({ content: c, imageDataUri }: PosterInput): (Node | null)[] {
  return [
    imageDataUri ? floatingImage(imageDataUri, posterImageSize(c)!.height, 52) : null,
    h(
      'div',
      { style: flex({ flexDirection: 'column', padding: `0 ${SIDE}px` }) },
      titleText(c.title, 74, 70),
      c.description ? bodyText(c.description, 43, 18, { color: MUTED }) : null
    ),
  ]
}

function momentLayout({ content: c, imageDataUri }: PosterInput): (Node | null)[] {
  return [
    c.day
      ? h(
          'div',
          { style: flex({ padding: `26px ${SIDE}px 0 ${SIDE}px`, fontSize: 172, fontWeight: 700, fontFamily: SANS, color: ACCENT, lineHeight: 1 }) },
          c.day
        )
      : null,
    imageDataUri ? floatingImage(imageDataUri, POSTER_IMAGE_SIZE.moment!.height, 60) : null,
    h(
      'div',
      { style: flex({ flexDirection: 'column', padding: `0 ${SIDE}px` }) },
      titleText(c.title, 64, 70),
      c.description ? bodyText(c.description, 43, 22, { color: MUTED }) : null
    ),
  ]
}

function novelLayout({ content: c }: PosterInput): (Node | null)[] {
  const blurb = c.description
    ? h(
        'div',
        { style: flex({ fontSize: 48, fontWeight: 700, fontFamily: SERIF, lineHeight: 1.9, color: INK, opacity: 0.82 }) },
        c.description
      )
    : null

  if (!containsCjk(c.title)) {
    // Latin letters stacked one per cell read as nonsense; set the title across instead.
    return [
      h(
        'div',
        { style: flex({ flexDirection: 'column', flexGrow: 1, padding: `104px ${SIDE}px 96px ${SIDE}px` }) },
        h(
          'div',
          { style: { ...clamped(3), fontSize: 110, fontWeight: 700, fontFamily: SERIF, lineHeight: 1.2, color: INK } },
          c.title
        ),
        spacer(),
        blurb
      ),
    ]
  }

  const columns = verticalColumns(c.title)
  return [
    h(
      'div',
      { style: flex({ flexGrow: 1, padding: `104px ${SIDE}px 96px ${SIDE}px` }) },
      h(
        'div',
        { style: flex({ flexDirection: 'row-reverse' }) },
        ...columns.map((column, i) =>
          h(
            'div',
            { style: flex({ flexDirection: 'column', alignItems: 'center', marginLeft: i === columns.length - 1 ? 0 : 20 }) },
            ...column.map(ch =>
              h(
                'div',
                { style: flex({ fontSize: 134, fontWeight: 700, fontFamily: SERIF, lineHeight: 1.15, color: INK }) },
                ch
              )
            )
          )
        )
      ),
      h('div', { style: flex({ flexDirection: 'column', flex: 1, justifyContent: 'flex-end', marginLeft: 70 }) }, blurb)
    ),
  ]
}

const LAYOUTS: Record<PosterLayout, (input: PosterInput) => (Node | null)[]> = {
  project: projectLayout,
  review: reviewLayout,
  art: artLayout,
  novel: novelLayout,
  moment: momentLayout,
}

export function buildPosterTree(input: PosterInput): Node {
  const { content: c } = input
  const body = LAYOUTS[c.layout](input)
  return h(
    'div',
    { style: flex({ position: 'relative', width: WIDTH, height: HEIGHT, backgroundColor: BASE, color: INK }) },
    ...background(input.backgroundDataUri),
    h(
      'div',
      { style: flex({ position: 'absolute', top: 0, left: 0, width: WIDTH, height: HEIGHT, flexDirection: 'column' }) },
      // Everything above the signature lives in a box that clips instead of growing, so no
      // amount of text can push the signature row or the QR code off the page.
      h(
        'div',
        { style: flex({ flexDirection: 'column', flexGrow: 1, flexShrink: 1, minHeight: 0, overflow: 'hidden' }) },
        topBar(c.label, c.dateText),
        ...body
      ),
      signatureRow(input)
    )
  )
}
