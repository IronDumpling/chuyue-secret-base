import { MDXRemote } from 'next-mdx-remote/rsc'
import Rating from './blog/Rating'

interface MDXContentProps {
  source: string
}

// Default components that can be used in MDX
const components = {
  Rating,
}

export default function MDXContent({ source }: MDXContentProps) {
  return (
    <MDXRemote source={source} components={components} />
  )
}

