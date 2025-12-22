'use client'

import { MDXRemote } from 'next-mdx-remote'
import type { MDXRemoteSerializeResult } from 'next-mdx-remote'
import Rating from './blog/Rating'

interface MDXContentProps {
  source: MDXRemoteSerializeResult
}

// Default components that can be used in MDX
const components = {
  Rating,
}

export default function MDXContent({ source }: MDXContentProps) {
  return (
    <MDXRemote 
      compiledSource={source.compiledSource}
      frontmatter={source.frontmatter}
      scope={source.scope}
      components={components}
    />
  )
}

