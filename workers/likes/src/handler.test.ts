import { describe, it, expect } from 'vitest'
import { handle, isValidId, voterKey, VOTE_WINDOW_MS, type LikeStore } from './handler'

function memoryStore(): LikeStore {
  const counts = new Map<string, number>()
  const votes = new Map<string, number>()
  return {
    async count(id) {
      return counts.get(id) ?? 0
    },
    async like(id, voter, now, windowMs) {
      const last = votes.get(`${id} ${voter}`)
      if (last !== undefined && now - last < windowMs) return { n: counts.get(id) ?? 0, counted: false }
      votes.set(`${id} ${voter}`, now)
      counts.set(id, (counts.get(id) ?? 0) + 1)
      return { n: counts.get(id)!, counted: true }
    },
  }
}

const SITE = 'https://irondumpling.github.io'
const API = 'https://likes.example.workers.dev'
const opts = (over: Partial<{ now: number; voter: string }> = {}) => ({
  allowedOrigins: [SITE],
  now: 1_000_000,
  voter: 'v1',
  ...over,
})

const get = (id: string, origin = SITE) =>
  new Request(`${API}/likes?id=${encodeURIComponent(id)}`, { headers: { Origin: origin } })
const post = (body: string, origin = SITE) =>
  new Request(`${API}/likes`, { method: 'POST', body, headers: { Origin: origin, 'Content-Type': 'application/json' } })

describe('isValidId', () => {
  it('accepts language-free page ids, including non-ascii slugs', () => {
    expect(isValidId('blog/films/her-review')).toBe(true)
    expect(isValidId('portfolio/applications/pact')).toBe(true)
    expect(isValidId('blog/films/résidence-evil')).toBe(true)
  })

  it('rejects anything else', () => {
    for (const id of ['', 'blog/films', 'en/blog/films/x', 'blog/films/x/y', 'other/films/x', 'blog/Films/x', 42]) {
      expect(isValidId(id)).toBe(false)
    }
  })
})

describe('handle', () => {
  it('counts a like and returns it on the next read', async () => {
    const store = memoryStore()
    const liked = await handle(post('{"id":"blog/films/her-review"}'), store, opts())
    expect(await liked.json()).toEqual({ n: 1, counted: true })

    const read = await handle(get('blog/films/her-review'), store, opts())
    expect(read.status).toBe(200)
    expect(await read.json()).toEqual({ n: 1 })
    expect(read.headers.get('Access-Control-Allow-Origin')).toBe(SITE)
  })

  it('counts the same visitor once per day per post', async () => {
    const store = memoryStore()
    await handle(post('{"id":"blog/films/her-review"}'), store, opts())
    const again = await handle(post('{"id":"blog/films/her-review"}'), store, opts({ now: 1_000_000 + 1000 }))
    expect(await again.json()).toEqual({ n: 1, counted: false })

    const otherVisitor = await handle(post('{"id":"blog/films/her-review"}'), store, opts({ voter: 'v2' }))
    expect(await otherVisitor.json()).toEqual({ n: 2, counted: true })

    const nextDay = await handle(post('{"id":"blog/films/her-review"}'), store, opts({ now: 1_000_000 + VOTE_WINDOW_MS }))
    expect(await nextDay.json()).toEqual({ n: 3, counted: true })
  })

  it('refuses other sites, bad ids and bad bodies', async () => {
    const store = memoryStore()
    expect((await handle(get('blog/films/x', 'https://evil.example'), store, opts())).status).toBe(403)
    expect((await handle(get('../etc'), store, opts())).status).toBe(400)
    expect((await handle(post('not json'), store, opts())).status).toBe(400)
    expect((await handle(post('{"id":"nope"}'), store, opts())).status).toBe(400)
    expect(await store.count('blog/films/x')).toBe(0)
  })

  it('answers the CORS preflight for the site only', async () => {
    const ok = await handle(new Request(`${API}/likes`, { method: 'OPTIONS', headers: { Origin: SITE } }), memoryStore(), opts())
    expect(ok.status).toBe(204)
    expect(ok.headers.get('Access-Control-Allow-Methods')).toContain('POST')

    const other = await handle(
      new Request(`${API}/likes`, { method: 'OPTIONS', headers: { Origin: 'https://evil.example' } }),
      memoryStore(),
      opts()
    )
    expect(other.headers.get('Access-Control-Allow-Origin')).toBeNull()
  })

  it('404s other paths and 405s other methods', async () => {
    expect((await handle(new Request(`${API}/`), memoryStore(), opts())).status).toBe(404)
    expect((await handle(new Request(`${API}/likes`, { method: 'DELETE', headers: { Origin: SITE } }), memoryStore(), opts())).status).toBe(405)
  })
})

describe('voterKey', () => {
  it('hashes the ip with the salt and never returns it raw', async () => {
    const a = await voterKey('1.2.3.4', 's')
    expect(a).toMatch(/^[0-9a-f]{64}$/)
    expect(a).not.toContain('1.2.3.4')
    expect(await voterKey('1.2.3.4', 's')).toBe(a)
    expect(await voterKey('1.2.3.4', 't')).not.toBe(a)
  })
})
