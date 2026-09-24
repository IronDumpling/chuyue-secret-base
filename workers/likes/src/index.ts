import { handle, voterKey } from './handler'
import { d1Store, type D1Like } from './d1-store'

interface Env {
  DB: D1Like
  ALLOWED_ORIGINS: string // comma-separated, e.g. "https://irondumpling.github.io,http://localhost:3000"
  VOTER_SALT?: string // secret: `npx wrangler secret put VOTER_SALT`
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const ip = request.headers.get('CF-Connecting-IP') ?? 'unknown'
    return handle(request, d1Store(env.DB), {
      allowedOrigins: env.ALLOWED_ORIGINS.split(',').map(s => s.trim()).filter(Boolean),
      now: Date.now(),
      voter: await voterKey(ip, env.VOTER_SALT ?? ''),
    })
  },
}
