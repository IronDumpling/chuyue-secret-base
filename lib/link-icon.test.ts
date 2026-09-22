import { describe, it, expect } from 'vitest'
import { describeLink, pickPrimaryLink, secondaryLinks } from './link-icon'
import type { Link } from './frontmatter'

describe('describeLink', () => {
  it('recognizes github.com', () => {
    expect(describeLink({ url: 'https://github.com/foo/bar' })).toEqual({
      label: 'GitHub',
      iconId: 'github',
    })
  })

  it('recognizes itch.io', () => {
    expect(describeLink({ url: 'https://foo.itch.io/game' })).toEqual({
      label: 'itch.io',
      iconId: 'itch',
    })
  })

  it('recognizes youtube.com and youtu.be', () => {
    expect(describeLink({ url: 'https://www.youtube.com/watch?v=x' })).toEqual({
      label: 'YouTube',
      iconId: 'youtube',
    })
    expect(describeLink({ url: 'https://youtu.be/x' })).toEqual({
      label: 'YouTube',
      iconId: 'youtube',
    })
  })

  it('recognizes bilibili.com and b23.tv', () => {
    expect(describeLink({ url: 'https://www.bilibili.com/video/x' })).toEqual({
      label: 'Bilibili',
      iconId: 'bilibili',
    })
    expect(describeLink({ url: 'https://b23.tv/x' })).toEqual({
      label: 'Bilibili',
      iconId: 'bilibili',
    })
  })

  it('recognizes apps.apple.com', () => {
    expect(describeLink({ url: 'https://apps.apple.com/us/app/x/id123' })).toEqual({
      label: 'App Store',
      iconId: 'appstore',
    })
  })

  it('recognizes pixiv.net', () => {
    expect(describeLink({ url: 'https://www.pixiv.net/en/users/123' })).toEqual({
      label: 'Pixiv',
      iconId: 'pixiv',
    })
  })

  it('falls back to the hostname (without www.) for unrecognized domains', () => {
    expect(describeLink({ url: 'https://www.example.com/x' })).toEqual({
      label: 'example.com',
      iconId: 'website',
    })
    expect(describeLink({ url: 'https://foo.github.io/project' })).toEqual({
      label: 'foo.github.io',
      iconId: 'website',
    })
  })

  it('prefers the link label when present, but still detects the icon by domain', () => {
    expect(describeLink({ url: 'https://github.com/foo/bar', label: 'Version 2' })).toEqual({
      label: 'Version 2',
      iconId: 'github',
    })
  })

  it('falls back gracefully when the URL cannot be parsed', () => {
    expect(describeLink({ url: 'not-a-url' })).toEqual({
      label: 'not-a-url',
      iconId: 'website',
    })
  })

  it('uses the label even when the URL cannot be parsed', () => {
    expect(describeLink({ url: 'not-a-url', label: 'My Link' })).toEqual({
      label: 'My Link',
      iconId: 'website',
    })
  })
})

describe('pickPrimaryLink', () => {
  const demo: Link = { url: 'https://demo.example.com' }
  const website: Link = { url: 'https://example.com' }
  const github: Link = { url: 'https://github.com/foo/bar' }

  it('prefers demo over website and github', () => {
    expect(pickPrimaryLink({ github: [github], demo: [demo], website: [website] })).toEqual(demo)
  })

  it('prefers website over github when there is no demo', () => {
    expect(pickPrimaryLink({ github: [github], demo: [], website: [website] })).toEqual(website)
  })

  it('falls back to github when there is no demo or website', () => {
    expect(pickPrimaryLink({ github: [github], demo: [], website: [] })).toEqual(github)
  })

  it('picks the first github link when there are several', () => {
    const github2: Link = { url: 'https://github.com/foo/baz', label: 'Version 2' }
    expect(pickPrimaryLink({ github: [github, github2], demo: [], website: [] })).toEqual(github)
  })

  it('returns null when every group is empty', () => {
    expect(pickPrimaryLink({ github: [], demo: [], website: [] })).toBeNull()
  })
})

describe('secondaryLinks', () => {
  const demo: Link = { url: 'https://demo.example.com' }
  const website: Link = { url: 'https://example.com' }
  const github: Link = { url: 'https://github.com/foo/bar' }
  const github2: Link = { url: 'https://github.com/foo/baz', label: 'Version 2' }

  it('returns every link except the primary one, ordered demo, website, github', () => {
    expect(secondaryLinks({ github: [github, github2], demo: [demo], website: [website] }, demo)).toEqual([
      website,
      github,
      github2,
    ])
  })

  it('returns all links when primary is null', () => {
    expect(secondaryLinks({ github: [github], demo: [demo], website: [website] }, null)).toEqual([
      demo,
      website,
      github,
    ])
  })

  it('returns an empty list when there is only a primary link and nothing else', () => {
    expect(secondaryLinks({ github: [], demo: [demo], website: [] }, demo)).toEqual([])
  })

  it('handles every group being empty', () => {
    expect(secondaryLinks({ github: [], demo: [], website: [] }, null)).toEqual([])
  })
})
