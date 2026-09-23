// Shared visual language for icon-tile actions (project/website links, the share entry
// point, and the share menu's own options): a rounded icon square with a small label
// underneath, all the same size. `accent` marks the single most prominent action in a
// group (the primary project link, Save Poster / Copy Link in the share menu); everything
// else uses the neutral variant so tiles of differing importance compete via color, not size.
export function tileIconClass(accent?: boolean): string {
  return `w-14 h-14 rounded-2xl flex items-center justify-center transition-transform active:scale-95 ${
    accent
      ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400'
      : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
  }`
}

export const tileLabelClass = 'text-xs text-center text-gray-700 dark:text-gray-300 max-w-[4.5rem] truncate'
