import fs from 'fs'
import path from 'path'
import { parse } from 'yaml'
import type { Locale } from './i18n/config'
import { resolveScales, validateRatingsFile, type RatingScales } from './ratings'

// Reads content/blog/ratings.{lang}.yml, one file per language, validates it and resolves every
// review category's scale. A missing or invalid file throws, which fails the build.
export function createRatingsSource(root: string, { cache = false }: { cache?: boolean } = {}) {
  const cached = new Map<Locale, RatingScales>()

  function scales(lang: Locale): RatingScales {
    const hit = cached.get(lang)
    if (hit) return hit
    const rel = `blog/ratings.${lang}.yml`
    const full = path.join(root, rel)
    if (!fs.existsSync(full)) throw new Error(`${rel} is missing from the content repository`)
    let raw: unknown
    try {
      raw = parse(fs.readFileSync(full, 'utf8'))
    } catch (error) {
      throw new Error(`${rel} is not valid YAML: ${(error as Error).message}`)
    }
    const resolved = resolveScales(validateRatingsFile(raw, rel))
    if (cache) cached.set(lang, resolved)
    return resolved
  }

  return { scales }
}
