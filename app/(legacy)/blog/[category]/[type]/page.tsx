import LegacyRedirect from '@/components/shared/LegacyRedirect'
import { categoryMap, typeMap } from '@/lib/blog-utils'

export const dynamicParams = false

export function generateStaticParams() {
  return Object.keys(categoryMap).flatMap(category => Object.keys(typeMap).map(type => ({ category, type })))
}

export default function LegacyBlogType({ params }: { params: { category: string; type: string } }) {
  return <LegacyRedirect path={`/blog/${params.category}/${params.type}/`} />
}
