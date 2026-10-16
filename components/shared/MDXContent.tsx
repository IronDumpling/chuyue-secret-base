import { compileMDX } from 'next-mdx-remote/rsc'
import remarkGfm from 'remark-gfm'
import rehypeSlug from 'rehype-slug'
import Rating from '@/components/blog/Rating'
import MDXContentImage from '@/components/shared/MDXContentImage'
import { rehypeCollectHeadings, type TocHeading } from '@/lib/rehype-collect-headings'

// Default components that can be used in MDX
const components = {
  Rating,
  img: MDXContentImage as React.ComponentType<any>,
}

// Renders the body and, from the same pipeline, lists its headings for the table of
// contents: rehype-slug gives each heading its id and the collector reads those ids back.
export async function renderMDX(source: string): Promise<{ content: React.ReactElement; headings: TocHeading[] }> {
  const headings: TocHeading[] = []
  const { content } = await compileMDX({
    source,
    components,
    options: {
      mdxOptions: {
        remarkPlugins: [remarkGfm],
        rehypePlugins: [rehypeSlug, [rehypeCollectHeadings, headings]],
      },
    },
  })
  return { content, headings }
}
