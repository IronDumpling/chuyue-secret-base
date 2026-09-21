import { withBasePath } from '@/lib/utils'

// GitHub and LinkedIn are drawn inline so they follow the text color. Every other
// platform is an image at /images/logo/<id>.svg, so a new platform only needs its file.
const INLINE_PATHS: Record<string, string> = {
  github:
    'M12 0C5.373 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.6.111.793-.261.793-.577v-2.234C5.662 21.38 4.967 19.238 4.967 19.238c-.546-1.387-1.333-1.756-1.333-1.756-1.09-.745.082-.729.082-.729 1.205.084 1.84 1.237 1.84 1.237 1.07 1.834 2.807 1.304 3.492.997.108-.775.418-1.305.762-1.604C7.14 16.902 4.337 15.873 4.337 11.276c0-1.311.469-2.381 1.238-3.221-.124-.303-.536-1.524.117-3.176 0 0 1.008-.322 3.3 1.23a11.52 11.52 0 0 1 3.003-.404c1.02.002 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.652.241 2.873.118 3.176.77.84 1.236 1.91 1.236 3.221 0 4.609-2.807 5.624-5.48 5.921.43.372.824 1.102.824 2.222v3.293c0 .319.192.694.8.576C20.563 21.8 24 17.302 24 12 24 5.373 18.627 0 12 0Z',
  linkedin:
    'M20.447 20.452H16.89v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.35V9h3.414v1.561h.047c.476-.9 1.636-1.85 3.369-1.85 3.602 0 4.268 2.37 4.268 5.455v6.286ZM5.337 7.433A2.063 2.063 0 1 1 5.338 3.305a2.063 2.063 0 0 1-.001 4.128ZM6.782 20.452H3.89V9h2.892v11.452ZM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.454C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.225 0Z',
}

export default function SocialIcon({ id, className = '' }: { id: string; className?: string }) {
  const path = INLINE_PATHS[id]

  if (path) {
    return (
      <svg className={`w-6 h-6 ${className}`} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path d={path} />
      </svg>
    )
  }

  // The link itself carries the accessible name, so the image is decorative.
  return <img src={withBasePath(`/images/logo/${id}.svg`)} alt="" className="w-6 h-6 dark:invert" />
}
