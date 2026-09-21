import LegacyRedirect from '@/components/shared/LegacyRedirect'
import { getAllProjects } from '@/lib/portfolio'

export const dynamicParams = false

export function generateStaticParams() {
  return getAllProjects('en').map(project => ({
    category: project.frontMatter.category,
    slug: project.slug,
  }))
}

export default function LegacyProject({ params }: { params: { category: string; slug: string } }) {
  return <LegacyRedirect path={`/portfolio/${params.category}/${params.slug}/`} />
}
