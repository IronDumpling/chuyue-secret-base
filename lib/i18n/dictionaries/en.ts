// English is the source dictionary: `Dictionary` is derived from it, and zh.ts must
// satisfy the same shape, so a missing translation is a compile error.
export const en = {
  meta: {
    siteName: 'Chuyue',
    fullName: 'Chuyue Zhang',
    title: 'Chuyue - System Designer',
    description:
      'Portfolio and blog of Chuyue Zhang, a system designer graduate from University of Toronto',
    ogLocale: 'en_US',
    cardBadge: 'Portfolio & Blog',
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
    pageDescription: 'Get in touch with Chuyue Zhang',
    form: {
      name: 'Name',
      email: 'Email',
      project: 'Project',
      message: 'Message',
      send: 'Send Message',
      sending: 'Sending...',
    },
  },
  common: {
    all: 'All',
    allIn: 'All {name}',
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
    pageTitle: 'Blog',
    pageDescription: 'Reviews and casual posts by Chuyue Zhang',
    sectionHeading: 'Blogs',
    sectionTitle: 'Thoughts & Reviews',
    sectionIntro: 'Dive into my personal space where I share reviews and thoughts on the things I love: ',
    sectionHighlight: 'Movies, Video Games, Music, and Books.',
    sectionCta: 'Read the Blog',
    noPosts: 'No blog posts found.',
    browseByCategory: 'Browse by category',
    filterLabel: 'Filter posts',
    back: 'Back to Blog',
    visitWebsite: 'Visit Website',
    groups: {
      moments: 'Moments',
      reviews: 'Reviews',
    },
    categories: {
      moments: 'Moments',
      films: 'Films',
      shows: 'Shows',
      music: 'Music',
      'video-games': 'Video Games',
      books: 'Books',
    },
  },
  portfolio: {
    pageTitle: 'Portfolio',
    pageDescription: 'Portfolio projects by Chuyue Zhang',
    sectionHeading: 'Portfolio',
    sectionTitle: 'Selected Works',
    sectionIntro: 'Explore a collection of my past projects, ranging from system architecture to game development.',
    sectionCta: 'View Full Portfolio',
    noProjects: 'No projects found in this category.',
    back: 'Back to Portfolio',
    viewOnGithub: 'View on GitHub',
    githubRepo: 'GitHub Repo {n}',
    viewDemo: 'View Demo',
    visitWebsite: 'Visit Website',
    filterLabel: 'Filter projects',
    groups: {
      computing: 'Computing',
      art: 'Art',
    },
    categories: {
      applications: 'Applications',
      games: 'Games',
      systems: 'Systems',
      ai: 'AI',
      photography: 'Photography',
      illustration: 'Illustration',
    },
    contexts: {
      course: 'Course',
      research: 'Research',
      work: 'Work',
      personal: 'Personal',
    },
  },
  notice: {
    // Shown above a page whose text is in the other language.
    missingEnglish: 'This page is not available in English yet. Showing the Chinese original.',
    missingChinese: 'This page is not available in Chinese yet. Showing the English original.',
  },
}

export type Dictionary = typeof en
