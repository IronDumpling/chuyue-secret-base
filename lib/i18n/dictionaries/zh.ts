import type { Dictionary } from './en'

export const zh: Dictionary = {
  meta: {
    siteName: 'Chuyue',
    title: 'Chuyue - 系统设计师',
    description: 'Chuyue Zhang 的作品集与博客，多伦多大学系统设计专业毕业生',
    ogLocale: 'zh_CN',
    cardBadge: '作品集与博客',
  },
  nav: {
    home: '首页',
    identity: '身份',
    experiences: '经历',
    portfolio: '作品集',
    blog: '博客',
    contact: '联系我',
    toggleMenu: '展开或收起菜单',
  },
  language: {
    switchLabel: 'EN',
    switchAria: '切换到英文',
    current: '中文',
  },
  theme: {
    toggle: '切换主题',
  },
  footer: {
    tagline: '系统设计师',
    quickLinks: '快速链接',
    socialMedia: '社交媒体',
    rights: '保留所有权利。',
  },
  home: {
    greeting: '你好，我是',
    question: '我是谁？',
    scrollDown: '向下滚动',
  },
  about: {
    heading: '我是……',
    coreCompetencies: '核心能力',
    viewResume: '查看简历',
    viewDetails: '查看详情',
    identities: {
      engineer: {
        paragraph:
          '作为软件工程师，我构建可靠、高性能的系统，经验涵盖数据库、分布式系统和后端基础设施。',
        imageAlts: ['工程师之戒仪式', '毕业照'],
        statLabels: ['年\n软件开发', '已交付\n项目'],
      },
      creator: {
        paragraph:
          '作为创作者，我通过游戏、摄影、写作、插画和音乐探索讲故事、塑造体验的不同方式。',
        imageAlts: ['摄影师', '摄影师', '中国传统服饰'],
        statLabels: ['年\n独立创作', '游戏与艺术\n实验'],
      },
      adventurer: {
        paragraph:
          '作为探险家，我不断寻找新的地方、运动和对话，让自己走出舒适区，拓宽视野。',
        imageAlts: ['在山中徒步', '喂海鸥', '和朋友滑雪'],
        statLabels: ['去过的\n城市', '运动与\n活动'],
      },
    },
  },
  skills: {
    heading: '技能',
  },
  experiences: {
    heading: '经历',
  },
  contact: {
    heading: '联系我',
    subtitle: '欢迎联系',
    call: '电话',
    email: '邮箱',
    location: '所在地',
    city: '加拿大安大略省多伦多',
    languages: '语言',
    languageList: ['英语', '普通话', '法语'],
    thanks: '感谢你的留言！我会尽快回复你。',
    pageDescription: '联系 Chuyue Zhang',
    form: {
      name: '姓名',
      email: '邮箱',
      project: '项目',
      message: '留言',
      send: '发送留言',
      sending: '发送中……',
    },
  },
  common: {
    all: '全部',
  },
  identity: {
    labels: {
      engineer: '软件工程师',
      creator: '创作者',
      adventurer: '探险家',
    },
    descriptions: {
      engineer: '设计并构建可靠的软件系统。',
      creator: '创作游戏、视觉、故事和声音。',
      adventurer: '探索活动、运动，结识新朋友。',
    },
  },
  blog: {
    pageTitle: '博客',
    pageDescription: 'Chuyue Zhang 的评测和随笔',
    sectionHeading: '博客',
    sectionTitle: '想法与评测',
    sectionIntro: '欢迎来到我的个人空间，我在这里分享对所爱之物的评测与想法：',
    sectionHighlight: '电影、游戏、音乐和书籍。',
    sectionCta: '阅读博客',
    allIn: '全部{category}',
    noPosts: '没有找到文章。',
    browseByCategory: '按分类浏览',
    browseByCategoryAndType: '按分类和类型浏览',
    back: '返回博客',
    visitWebsite: '访问网站',
    categories: {
      photography: '摄影',
      illustration: '插画',
      'films-shows': '影视',
      music: '音乐',
      'video-games': '游戏',
      books: '书籍',
    },
    types: {
      review: '评测',
      casual: '随笔',
    },
  },
  portfolio: {
    pageTitle: '作品集',
    pageDescription: 'Chuyue Zhang 的作品集',
    sectionHeading: '作品集',
    sectionTitle: '精选作品',
    sectionIntro: '浏览我过去的项目，涵盖从系统架构到游戏开发的各个方面。',
    sectionCta: '查看全部作品',
    noProjects: '这个分类下还没有项目。',
    back: '返回作品集',
    viewOnGithub: '在 GitHub 上查看',
    githubRepo: 'GitHub 仓库 {n}',
    viewDemo: '查看演示',
    visitWebsite: '访问网站',
    categories: {
      'student-projects': '学生项目',
      'video-games': '游戏',
      applications: '应用',
    },
  },
  notice: {
    missingEnglish: '这个页面暂无英文版，以下为中文原文。',
    missingChinese: '这个页面暂无中文版，以下为英文原文。',
  },
}
