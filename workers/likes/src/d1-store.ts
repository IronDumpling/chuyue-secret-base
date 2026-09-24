import type { LikeStore } from './handler'

// The few D1 methods used here, so this package needs no Cloudflare type dependency.
interface D1Statement {
  bind(...values: unknown[]): D1Statement
  first<T>(): Promise<T | null>
  run(): Promise<unknown>
}
export interface D1Like {
  prepare(sql: string): D1Statement
  batch(statements: D1Statement[]): Promise<unknown>
}

export function d1Store(db: D1Like): LikeStore {
  const count = async (id: string) =>
    (await db.prepare('SELECT n FROM likes WHERE id = ?').bind(id).first<{ n: number }>())?.n ?? 0

  return {
    count,
    async like(id, voter, now, windowMs) {
      const last = await db
        .prepare('SELECT at FROM votes WHERE id = ? AND voter = ?')
        .bind(id, voter)
        .first<{ at: number }>()
      if (last && now - last.at < windowMs) return { n: await count(id), counted: false }

      // One batch runs as a transaction; the upsert makes the increment atomic. Old votes
      // are only needed for the window, so they are pruned on the way.
      await db.batch([
        db.prepare('INSERT OR REPLACE INTO votes (id, voter, at) VALUES (?, ?, ?)').bind(id, voter, now),
        db.prepare('INSERT INTO likes (id, n) VALUES (?, 1) ON CONFLICT(id) DO UPDATE SET n = n + 1').bind(id),
        db.prepare('DELETE FROM votes WHERE at < ?').bind(now - windowMs),
      ])
      return { n: await count(id), counted: true }
    },
  }
}
