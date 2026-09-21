import LegacyRedirect from '@/components/shared/LegacyRedirect'
import { categoryMap } from '@/lib/blog-utils'

export const dynamicParams = false

export function generateStaticParams() {
  return Object.keys(categoryMap).map(category => ({ category }))
}

export default function LegacyBlogCategory({ params }: { params: { category: string } }) {
  return <LegacyRedirect path={`/blog/${params.category}/`} />
}
