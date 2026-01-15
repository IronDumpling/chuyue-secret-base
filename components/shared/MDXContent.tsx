import { MDXRemote } from 'next-mdx-remote/rsc'
import Rating from '@/components/blog/Rating'
import MDXContentImage from '@/components/shared/MDXContentImage'

interface MDXContentProps {
  source: string
}

// Default components that can be used in MDX
const components = {
  Rating,
  img: MDXContentImage as React.ComponentType<any>,
}

export default function MDXContent({ source }: MDXContentProps) {
  return (
    <MDXRemote source={source} components={components} />
  )
}

