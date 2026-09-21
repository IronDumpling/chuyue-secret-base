// English is the source dictionary: `Dictionary` is derived from it, and zh.ts must
// satisfy the same shape, so a missing translation is a compile error.
export const en = {
  meta: {
    siteName: 'Chuyue',
    title: 'Chuyue - System Designer',
    description:
      'Portfolio and blog of Chuyue Zhang, a system designer graduate from University of Toronto',
    ogLocale: 'en_US',
  },
  nav: {
    home: 'Home',
    identity: 'Identity',
    experiences: 'Experiences',
    portfolio: 'Portfolio',
    blog: 'Blog',
    contact: 'Contact Me',
    toggleMenu: 'Toggle menu',
  },
  language: {
    // Shown on the button that switches to the other language.
    switchLabel: '中文',
    switchAria: 'Switch to Chinese',
    current: 'English',
  },
  theme: {
    toggle: 'Toggle theme',
  },
  identity: {
    labels: {
      engineer: 'Software Engineer',
      creator: 'Creator',
      adventurer: 'Adventurer',
    },
    descriptions: {
      engineer: 'Designing and building reliable software systems.',
      creator: 'Crafting games, visuals, stories, and sound.',
      adventurer: 'Exploring activities, sports, and new connections.',
    },
  },
  blog: {
    categories: {
      photography: 'Photography',
      illustration: 'Illustration',
      'films-shows': 'Films & Shows',
      music: 'Music',
      'video-games': 'Video Games',
      books: 'Books',
    },
    types: {
      review: 'Review',
      casual: 'Casual',
    },
  },
  portfolio: {
    categories: {
      'student-projects': 'Student Projects',
      'video-games': 'Video Games',
      applications: 'Applications',
    },
  },
  notice: {
    // Shown above a page whose text is in the other language.
    showingEnglishOriginal: 'This page is not available in English yet. Showing the Chinese original.',
    showingChineseOriginal: 'This page is not available in Chinese yet. Showing the English original.',
  },
}

export type Dictionary = typeof en
