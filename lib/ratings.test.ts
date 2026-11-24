import { describe, it, expect } from 'vitest'
import { resolveScale, resolveScales, validateRatingsFile, SCORES, REVIEW_CATEGORIES } from './ratings'

function baseRaw(): any {
  return {
    tiers: SCORES.map(score => ({ score, name: `N${score}`, definition: `D${score}` })),
  }
}

function valid(raw: unknown = baseRaw()) {
  return validateRatingsFile(raw, 'blog/ratings.en.yml')
}

describe('resolveScale', () => {
  it('uses the default set when a category has no override', () => {
    const scale = resolveScale(valid(), 'films')
    expect(scale).not.toHaveProperty('subtitle')
    expect(scale.tiers[7]).toEqual({ name: 'N7', definition: 'D7' })
  })

  it('overrides only the fields a category gives, for that category only', () => {
    const raw = baseRaw()
    raw.categories = [{ category: 'video-games', tiers: [{ score: 8, name: 'Standout' }] }]
    const file = valid(raw)
    const games = resolveScale(file, 'video-games')
    expect(games.tiers[8]).toEqual({ name: 'Standout', definition: 'D8' })
    expect(games.tiers[9]).toEqual({ name: 'N9', definition: 'D9' })
    expect(resolveScale(file, 'films').tiers[8].name).toBe('N8')
  })


  it('treats an empty override field as not overridden', () => {
    const raw = baseRaw()
    raw.categories = [{ category: 'shows', tiers: [{ score: 6, name: '', definition: '  ' }] }]
    expect(resolveScale(valid(raw), 'shows').tiers[6]).toEqual({ name: 'N6', definition: 'D6' })
  })
})

describe('resolveScales', () => {
  it('has a scale for every reviews category, even with no categories key', () => {
    const scales = resolveScales(valid())
    expect(Object.keys(scales).sort()).toEqual([...REVIEW_CATEGORIES].sort())
    expect(REVIEW_CATEGORIES).toEqual(['films', 'shows', 'music', 'video-games', 'books'])
  })
})

describe('validateRatingsFile', () => {
  function expectProblem(raw: unknown, ...parts: string[]) {
    let message = ''
    try {
      valid(raw)
    } catch (error) {
      message = (error as Error).message
    }
    expect(message).toContain('blog/ratings.en.yml')
    for (const part of parts) expect(message).toContain(part)
  }

  it('rejects a default set missing a tier', () => {
    const raw = baseRaw()
    raw.tiers = raw.tiers.filter((t: any) => t.score !== 4)
    expectProblem(raw, 'tiers', '4')
  })

  it('rejects a default tier with an empty definition', () => {
    const raw = baseRaw()
    raw.tiers[2].definition = ' '
    expectProblem(raw, 'definition')
  })

  it('rejects a duplicate default score', () => {
    const raw = baseRaw()
    raw.tiers.push({ score: 3, name: 'x', definition: 'y' })
    expectProblem(raw, 'duplicate')
  })

  it('rejects a score outside 1-10, in the defaults or an override', () => {
    const raw = baseRaw()
    raw.tiers.push({ score: 11, name: 'x', definition: 'y' })
    expectProblem(raw, '11')
    const raw2 = baseRaw()
    raw2.categories = [{ category: 'films', tiers: [{ score: 11, name: 'x' }] }]
    expectProblem(raw2, '11')
  })

  it('needs no subtitle: the axis explains the midpoint', () => {
    expect(() => valid(baseRaw())).not.toThrow()
  })

  it('rejects a category that is not a review category, naming the known ones', () => {
    const raw = baseRaw()
    raw.categories = [{ category: 'moments' }, { category: 'anime' }]
    expectProblem(raw, 'moments', 'anime', 'films, shows, music, video-games, books')
  })

  it('rejects the same category listed twice', () => {
    const raw = baseRaw()
    raw.categories = [{ category: 'films' }, { category: 'films' }]
    expectProblem(raw, 'duplicate', 'films')
  })

  it('rejects a file that is not an object', () => {
    expectProblem(null)
    expectProblem('hello')
  })
})
