import LegacyRedirect from '@/components/shared/LegacyRedirect'
import type { Metadata } from 'next'
import { getAllPosts, getPostBySlug } from '@/lib/blog'
import { buildPageMetadata } from '@/lib/seo'

export const dynamicParams = false

export function generateStaticParams() {
  return getAllPosts('en').map(post => ({
    category: post.frontMatter.category,
    type: post.frontMatter.type,
    slug: post.slug,
  }))
}

export function generateMetadata({
  params,
}: {
  params: { category: string; type: string; slug: string }
}): Metadata {
  const post = getPostBySlug(params.slug, params.category, params.type, 'en')
  if (!post) return {}
  return buildPageMetadata(
    { kind: 'blog', category: params.category, type: params.type, slug: post.slug },
    'en',
    {
      title: post.frontMatter.title,
      description: post.frontMatter.description,
      body: post.content,
      date: String(post.frontMatter.date),
      contentLang: post.lang,
    }
  )
}

export default function LegacyBlogPost({
  params,
}: {
  params: { category: string; type: string; slug: string }
}) {
  return <LegacyRedirect path={`/blog/${params.category}/${params.type}/${params.slug}/`} />
}
