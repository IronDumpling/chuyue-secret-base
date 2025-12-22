import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
    },
    sitemap: 'https://irondumpling.github.io/chuyue-secret-base/sitemap.xml',
  }
}

