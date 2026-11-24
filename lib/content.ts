import 'server-only'

import path from 'path'
import { createContentIndex } from './entries'
import { createRatingsSource } from './ratings-source'

// The site's content, read once per build. In development it is read on every request so
// edits to content/ show up without restarting the dev server.
const index = createContentIndex(path.join(process.cwd(), 'content'), {
  cache: process.env.NODE_ENV !== 'development',
})

export const getEntries = index.entries
export const getEntry = index.entry

const ratings = createRatingsSource(path.join(process.cwd(), 'content'), {
  cache: process.env.NODE_ENV !== 'development',
})

// The rating scale of every review category, in one language (content/blog/ratings.{lang}.yml).
export const getRatingScales = ratings.scales
