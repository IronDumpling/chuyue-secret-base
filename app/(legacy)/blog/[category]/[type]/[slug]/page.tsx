import LegacyRedirect from '@/components/shared/LegacyRedirect'
import { getAllPosts } from '@/lib/blog'

export const dynamicParams = false

export function generateStaticParams() {
  return getAllPosts('en').map(post => ({
    category: post.frontMatter.category,
    type: post.frontMatter.type,
    slug: post.slug,
  }))
}

export default function LegacyBlogPost({
  params,
}: {
  params: { category: string; type: string; slug: string }
}) {
  return <LegacyRedirect path={`/blog/${params.category}/${params.type}/${params.slug}/`} />
}
