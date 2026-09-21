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
  footer: {
    tagline: 'System Designer',
    quickLinks: 'Quick Links',
    socialMedia: 'Social Media',
    rights: 'All rights reserved.',
  },
  home: {
    greeting: 'Hi, I am',
    question: 'Who am I?',
    scrollDown: 'Scroll down',
  },
  about: {
    heading: 'I am...',
    coreCompetencies: 'Core Competencies',
    viewResume: 'View Resume',
    viewDetails: 'View Details',
    identities: {
      engineer: {
        paragraph:
          'As a software engineer, I build reliable, high-performance systems with experience across databases, distributed systems, and backend infrastructure.',
        imageAlts: ['Engineer ring ceremony', 'Graduation photo'],
        statLabels: ['Years\nin software', 'Shipped\nprojects'],
      },
      creator: {
        paragraph:
          'As a creator, I explore games, photography, writing, illustration, and music as different ways of telling stories and shaping experiences.',
        imageAlts: ['Photographer', 'Photographer', 'Traditional Chinese Costume'],
        statLabels: ['Years in\nindie creation', 'Game & art\nexperiments'],
      },
      adventurer: {
        paragraph:
          'As an adventurer, I seek out new places, sports, and conversations that push me out of my comfort zone and widen my perspective.',
        imageAlts: ['Hiking in the mountains', 'Feeding the gulls', 'Skiing with friends'],
        statLabels: ['Cities\nvisited', 'Sports &\nactivities'],
      },
    },
  },
  skills: {
    heading: 'Skills',
  },
  experiences: {
    heading: 'Experiences',
  },
  contact: {
    heading: 'Contact Me',
    subtitle: 'Get in touch',
    call: 'Call Me',
    email: 'Email',
    location: 'Location',
    city: 'Toronto, ON, Canada',
    languages: 'Language',
    languageList: ['English', 'Mandarin', 'French'],
    thanks: 'Thank you for your message! I will get back to you soon.',
    form: {
      name: 'Name',
      email: 'Email',
      project: 'Project',
      message: 'Message',
      send: 'Send Message',
      sending: 'Sending...',
    },
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
