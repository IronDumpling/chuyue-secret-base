export interface Link {
  url: string
  label?: string
}

// The CMS may write `date: 2026-01-04` unquoted, which gray-matter parses into a JS Date.
// Every other loader/type expects `date: string`, so normalize at the load boundary.
export function normalizeFrontMatter(data: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(data)) {
    out[key] = value instanceof Date ? value.toISOString().slice(0, 10) : value
  }
  return out
}

// Portfolio's github/demo/website fields are written three different ways across content:
// a plain URL string, a single {url,label} object, or a list of either. Collapse them all to
// one shape so the CMS form (and the rendering code) only ever deals with a list.
export function normalizeLinks(value: unknown): Link[] {
  if (value === undefined || value === null || value === '') return []
  if (typeof value === 'string') return [{ url: value }]
  if (Array.isArray(value)) {
    return value.map(item => (typeof item === 'string' ? { url: item } : (item as Link)))
  }
  return [value as Link]
}
