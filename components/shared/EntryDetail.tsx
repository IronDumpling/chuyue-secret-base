import type { ReactNode } from 'react'
import { renderMDX } from '@/components/shared/MDXContent'
import TableOfContents from '@/components/shared/toc/TableOfContents'
import ReadAloudProvider from '@/components/shared/read-aloud/ReadAloudProvider'
import ReadAloudButton from '@/components/shared/read-aloud/ReadAloudButton'
import { CONTENT_ID, TITLE_ID } from '@/components/shared/read-aloud/extract'
import MDXHeaderImage from '@/components/shared/MDXHeaderImage'
import ShareBar from '@/components/shared/ShareBar'
import LinkTile from '@/components/shared/LinkTile'
import ListBackLink from '@/components/shared/ListBackLink'
import FallbackNotice from '@/components/shared/FallbackNotice'
import { describeLink, pickPrimaryLink, secondaryLinks } from '@/lib/link-icon'
import { getShareProps } from '@/lib/share'
import { summarize } from '@/lib/seo'
import { formatLongDay } from '@/lib/date'
import { localePath } from '@/lib/i18n/paths'
import { getDictionary } from '@/lib/i18n'
import { TOC_MIN_HEADINGS } from '@/lib/toc'
import type { Locale } from '@/lib/i18n/config'
import type { Section } from '@/lib/taxonomy'
import type { Entry } from '@/lib/entry-types'

const PLACEHOLDER: Record<Section, string> = {
  blog: '/images/placeholder/blog-default.jpg',
  portfolio: '/images/placeholder/portofolio-default.jpg',
}

interface EntryDetailProps {
  entry: Entry
  lang: Locale // language of the page, which may differ from the language of the text
  badges?: ReactNode // shown after the date: what differs between a Post and a Project
}

// The page of one Post or Project. Owns the layout and the DOM contract the table of
// contents and read-aloud rely on (TITLE_ID, CONTENT_ID, the .prose body).
export default async function EntryDetail({ entry, lang, badges }: EntryDetailProps) {
  const section = entry.target.kind
  const { title, description, images } = entry.frontMatter
  const t = getDictionary(lang)
  const { content, headings } = await renderMDX(entry.content)

  // One row of same-size icon tiles. The primary link (demo > website > github, see
  // lib/link-icon.ts) is accented; secondary links and Share are neutral.
  const links = { github: entry.frontMatter.github, demo: entry.frontMatter.demo, website: entry.frontMatter.website }
  const primary = pickPrimaryLink(links)
  const secondary = secondaryLinks(links, primary)

  return (
    <article className="toc-shift section bg-white dark:bg-gray-900">
      <ReadAloudProvider lang={entry.lang} title={title} hasToc={headings.length >= TOC_MIN_HEADINGS}>
        {/* Wide screens: three columns with the table of contents in the left gutter, so the
            body column keeps its width and stays centred. */}
        <div className="container max-w-4xl xl:grid xl:max-w-none xl:grid-cols-[1fr_minmax(0,52rem)_1fr] xl:gap-8">
          <aside className="hidden xl:block">
            <TableOfContents headings={headings} labels={t.toc} variant="sidebar" />
          </aside>
          <div className="min-w-0">
            <FallbackNotice pageLang={lang} contentLang={entry.lang} />
            {/* Header */}
            <div className="mb-8">
              <ListBackLink
                href={localePath(lang, `/${section}`)}
                className="inline-flex items-center gap-2 text-primary-600 dark:text-primary-400 hover:underline mb-4"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                {t[section].back}
              </ListBackLink>
              <h1 id={TITLE_ID} lang={entry.lang} className="text-4xl font-bold mb-4">{title}</h1>
              <div className="flex flex-wrap items-center gap-4 text-gray-600 dark:text-gray-400 mb-4">
                <span className="text-sm">{formatLongDay(entry.frontMatter.date, lang)}</span>
                {badges}
              </div>
            </div>

            <MDXHeaderImage images={images && images.length > 0 ? images : [PLACEHOLDER[section]]} title={title} />

            <div className="flex flex-wrap items-start gap-4 mb-8">
              {primary && <LinkTile href={primary.url} {...tileProps(primary)} accent />}
              {secondary.map(link => (
                <LinkTile key={link.url} href={link.url} {...tileProps(link)} />
              ))}
              <ShareBar {...getShareProps(entry.target, lang, title, summarize(description, entry.content))} />
              <ReadAloudButton />
            </div>

            <div id={CONTENT_ID} lang={entry.lang} className="prose prose-lg dark:prose-invert max-w-none">
              {content}
            </div>
          </div>
        </div>
        <div className="xl:hidden">
          <TableOfContents headings={headings} labels={t.toc} variant="floating" />
        </div>
      </ReadAloudProvider>
    </article>
  )
}

function tileProps(link: Parameters<typeof describeLink>[0]) {
  const { iconId, label } = describeLink(link)
  return { iconId, label }
}
