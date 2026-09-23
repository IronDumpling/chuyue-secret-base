import type { LinkIconId } from '@/lib/link-icon'
import LinkIcon from '@/components/shared/LinkIcons'
import { tileIconClass, tileLabelClass } from '@/components/shared/tileStyles'

interface LinkTileProps {
  href: string
  iconId: LinkIconId
  label: string
  accent?: boolean
}

// Same icon-tile shape as the share menu's options (see tileStyles), used for project/website
// links so a page's primary link, secondary links, and Share button all read as one unified
// row instead of a mix of differently-sized buttons.
export default function LinkTile({ href, iconId, label, accent }: LinkTileProps) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="flex flex-col items-center gap-1.5"
    >
      <span className={tileIconClass(accent)}>
        <LinkIcon iconId={iconId} className="w-6 h-6" />
      </span>
      <span className={tileLabelClass}>{label}</span>
    </a>
  )
}
