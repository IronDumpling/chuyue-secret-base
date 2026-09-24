import { getAllPosts } from '@/lib/blog'
import { buildRss } from '@/lib/feed'
import { absoluteUrl } from '@/lib/site'
import { pagePath } from '@/lib/share-paths'
import { feedPath, summarize } from '@/lib/seo'
import { LOCALES, type Locale } from '@/lib/i18n/config'
import { localePath } from '@/lib/i18n/paths'
import { getDictionary } from '@/lib/i18n'

export const dynamic = 'force-static'
export const dynamicParams = false

// Route handlers don't inherit the [lang] layout's params, so list the languages here too.
export function generateStaticParams() {
  return LOCALES.map(lang => ({ lang }))
}

// One feed per language. A post with no version in that language is listed in the one it
// has, the same way the site serves it as a fallback.
export function GET(_request: Request, { params }: { params: { lang: Locale } }) {
  const lang = params.lang
  const t = getDictionary(lang)

  const items = getAllPosts(lang).map(post => ({
    title: post.frontMatter.title,
    link: absoluteUrl(pagePath({ kind: 'blog', category: post.frontMatter.category, slug: post.slug }, lang)),
    description: summarize(post.frontMatter.description, post.content),
    pubDate: new Date(post.frontMatter.date),
  }))

  const xml = buildRss(
    {
      title: `${t.meta.siteName} - ${t.blog.pageTitle}`,
      link: absoluteUrl(localePath(lang, '/blog')),
      description: t.blog.pageDescription,
      feedUrl: absoluteUrl(feedPath(lang)),
      language: lang === 'zh' ? 'zh-CN' : 'en',
    },
    items
  )

  return new Response(xml, { headers: { 'Content-Type': 'application/rss+xml; charset=utf-8' } })
}
