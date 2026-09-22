import 'server-only'

import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import { serialize } from 'next-mdx-remote/serialize'
import { MDXRemoteSerializeResult } from 'next-mdx-remote'
import remarkGfm from 'remark-gfm'
import rehypeHighlight from 'rehype-highlight'
import rehypeSlug from 'rehype-slug'
import rehypeAutolinkHeadings from 'rehype-autolink-headings'
import { parseContentFilename, pickLocalized } from './content-lang'
import { DEFAULT_LOCALE, type Locale } from './i18n/config'
import { normalizeFrontMatter } from './frontmatter'

const contentDirectory = path.join(process.cwd(), 'content')

export interface FrontMatter {
  [key: string]: any
}

export interface MDXContent {
  frontMatter: FrontMatter
  content: string
  slug: string
}

// Read MDX file and parse frontmatter
export function getMDXFile(filePath: string): MDXContent | null {
  try {
    const fullPath = path.join(contentDirectory, filePath)
    if (!fs.existsSync(fullPath)) {
      return null
    }

    const fileContents = fs.readFileSync(fullPath, 'utf8')
    const { data, content } = matter(fileContents)
    const slug = path.basename(filePath, path.extname(filePath))

    return {
      frontMatter: normalizeFrontMatter(data),
      content,
      slug,
    }
  } catch (error) {
    console.error(`Error reading MDX file ${filePath}:`, error)
    return null
  }
}

export interface LocalizedMDXContent extends MDXContent {
  lang: Locale // the language the text is actually in
  isFallback: boolean // true when that is not the language that was asked for
}

// One entry per post in a directory, in the requested language where it exists. The slug
// never contains the language suffix: `her-review.zh.mdx` and `her-review.mdx` are both
// `her-review`.
export function getLocalizedMDXFiles(directory: string, lang: Locale = DEFAULT_LOCALE): LocalizedMDXContent[] {
  const fullPath = path.join(contentDirectory, directory)
  if (!fs.existsSync(fullPath)) return []

  const candidates = []
  for (const file of fs.readdirSync(fullPath, { recursive: true })) {
    if (typeof file !== 'string') continue
    const parsed = parseContentFilename(path.basename(file))
    if (!parsed) continue
    const content = getMDXFile(path.join(directory, file))
    if (content) {
      candidates.push({ slug: parsed.slug, lang: parsed.lang, value: content })
    }
  }

  return pickLocalized(candidates, lang).map(({ slug, lang: actual, isFallback, value }) => ({
    ...value,
    slug,
    lang: actual,
    isFallback,
  }))
}

export function getLocalizedMDXFile(
  directory: string,
  slug: string,
  lang: Locale = DEFAULT_LOCALE
): LocalizedMDXContent | null {
  return getLocalizedMDXFiles(directory, lang).find(file => file.slug === slug) ?? null
}

// Get all MDX files from a directory
export function getAllMDXFiles(directory: string): MDXContent[] {
  const fullPath = path.join(contentDirectory, directory)
  
  if (!fs.existsSync(fullPath)) {
    return []
  }

  const files = fs.readdirSync(fullPath, { recursive: true })
  const mdxFiles: MDXContent[] = []

  for (const file of files) {
    if (typeof file === 'string' && (file.endsWith('.mdx') || file.endsWith('.md'))) {
      const filePath = path.join(directory, file)
      const mdxContent = getMDXFile(filePath)
      if (mdxContent) {
        mdxFiles.push(mdxContent)
      }
    }
  }

  return mdxFiles
}

// Serialize MDX content for rendering
export async function serializeMDX(content: string): Promise<MDXRemoteSerializeResult> {
  return await serialize(content, {
    mdxOptions: {
      remarkPlugins: [remarkGfm],
      rehypePlugins: [
        rehypeHighlight,
        rehypeSlug,
        [
          rehypeAutolinkHeadings,
          {
            behavior: 'wrap',
            properties: {
              className: ['anchor'],
            },
          },
        ],
      ],
    },
  })
}

