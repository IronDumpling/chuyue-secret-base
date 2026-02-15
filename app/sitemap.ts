import { MetadataRoute } from 'next'
import { getAllProjects } from '@/lib/portfolio'
import { getAllPosts } from '@/lib/blog'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://irondumpling.github.io/chuyue-secret-base'

  const routes = [
    '',
    '/about',
    '/skills',
    '/experiences',
    '/portfolio',
    '/blog',
    '/contact',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: route === '' ? 1 : 0.8,
  }))

  // Add portfolio project pages
  const projects = getAllProjects()
  const projectRoutes = projects.map((project) => ({
    url: `${baseUrl}/portfolio/${project.frontMatter.category}/${project.slug}`,
    lastModified: new Date(project.frontMatter.date),
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }))

  // Add blog post pages - new structure: /blog/{category}/{type}/{slug}
  const posts = getAllPosts()
  const postRoutes = posts.map((post) => {
    const url = `${baseUrl}/blog/${post.frontMatter.category}/${post.frontMatter.type}/${post.slug}`
    
    return {
      url,
      lastModified: new Date(post.frontMatter.date),
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    }
  })

  return [...routes, ...projectRoutes, ...postRoutes]
}

