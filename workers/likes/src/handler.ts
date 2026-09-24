// Like counter for the static site. Request handling only: storage is passed in, so this
// runs under vitest without Cloudflare. The site must work without this service, so a
// failure here only means the like button hides or shows a stale count.

export interface LikeStore {
  count(id: string): Promise<number>
  // Adds one like unless this voter already liked `id` within the last `windowMs`.
  // Returns the count after the attempt and whether it was counted.
  like(id: string, voter: string, now: number, windowMs: number): Promise<{ n: number; counted: boolean }>
}

export interface HandlerOptions {
  allowedOrigins: string[]
  now: number
  voter: string // an opaque per-visitor key (a salted IP hash), never the raw IP
}

export const VOTE_WINDOW_MS = 24 * 60 * 60 * 1000

// Same shape as a page's ShareTarget (lib/share-paths.ts), without the language, so the
// English and Chinese pages of a post share one count.
const ID_PATTERN = /^(blog|portfolio)\/[a-z0-9-]+\/[^/\s]{1,120}$/

export function isValidId(id: unknown): id is string {
  return typeof id === 'string' && ID_PATTERN.test(id)
}

function corsHeaders(origin: string | null, allowed: string[]): Record<string, string> {
  const headers: Record<string, string> = { Vary: 'Origin' }
  if (origin && allowed.includes(origin)) {
    headers['Access-Control-Allow-Origin'] = origin
    headers['Access-Control-Allow-Methods'] = 'GET, POST, OPTIONS'
    headers['Access-Control-Allow-Headers'] = 'Content-Type'
    headers['Access-Control-Max-Age'] = '86400'
  }
  return headers
}

function json(body: unknown, status: number, headers: Record<string, string>): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...headers, 'Content-Type': 'application/json' },
  })
}

export async function handle(request: Request, store: LikeStore, o: HandlerOptions): Promise<Response> {
  const url = new URL(request.url)
  const origin = request.headers.get('Origin')
  const cors = corsHeaders(origin, o.allowedOrigins)

  if (url.pathname !== '/likes') return json({ error: 'not found' }, 404, cors)
  if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors })
  // Browsers always send Origin on cross-site requests; refuse other sites' pages.
  if (origin && !o.allowedOrigins.includes(origin)) return json({ error: 'forbidden' }, 403, cors)

  if (request.method === 'GET') {
    const id = url.searchParams.get('id')
    if (!isValidId(id)) return json({ error: 'bad id' }, 400, cors)
    return json({ n: await store.count(id) }, 200, cors)
  }

  if (request.method === 'POST') {
    let id: unknown
    try {
      id = ((await request.json()) as { id?: unknown }).id
    } catch {
      return json({ error: 'bad body' }, 400, cors)
    }
    if (!isValidId(id)) return json({ error: 'bad id' }, 400, cors)
    return json(await store.like(id, o.voter, o.now, VOTE_WINDOW_MS), 200, cors)
  }

  return json({ error: 'method not allowed' }, 405, cors)
}

export async function voterKey(ip: string, salt: string): Promise<string> {
  const bytes = new TextEncoder().encode(`${salt}:${ip}`)
  const digest = await crypto.subtle.digest('SHA-256', bytes)
  return Array.from(new Uint8Array(digest), b => b.toString(16).padStart(2, '0')).join('')
}
