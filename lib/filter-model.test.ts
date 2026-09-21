import { describe, it, expect } from 'vitest'
import {
  ALL,
  applySelectionToParams,
  buildFilterModel,
  matchesSelection,
  normalizeSelection,
  selectionFromParams,
  selectionKey,
} from './filter-model'

const labels = { group: (id: string) => `G:${id}`, category: (id: string) => `C:${id}` }
const posts = (...categories: string[]) => categories.map(category => ({ category }))

describe('buildFilterModel', () => {
  it('counts posts per category and per group, in taxonomy order', () => {
    const model = buildFilterModel('blog', posts('music', 'films', 'films', 'moments'), labels)
    expect(model.map(g => [g.id, g.count])).toEqual([
      ['moments', 1],
      ['reviews', 3],
    ])
    expect(model[1].categories).toEqual([
      { id: 'films', label: 'C:films', count: 2 },
      { id: 'music', label: 'C:music', count: 1 },
    ])
  })

  it('leaves out empty categories and empty groups', () => {
    const model = buildFilterModel('blog', posts('films', 'music'), labels)
    expect(model.map(g => g.id)).toEqual(['reviews'])
    expect(model[0].categories.map(c => c.id)).toEqual(['films', 'music'])
  })

  it('offers no second level for a group with one category or one filled category', () => {
    const moments = buildFilterModel('blog', posts('moments', 'moments'), labels)[0]
    expect(moments.categories).toEqual([])
    const oneReview = buildFilterModel('blog', posts('films'), labels)[0]
    expect(oneReview.categories).toEqual([])
  })

  it('works for the portfolio sections', () => {
    const model = buildFilterModel('portfolio', posts('applications', 'games', 'photography'), labels)
    expect(model.map(g => g.id)).toEqual(['computing', 'art'])
    expect(model[0].categories.map(c => c.id)).toEqual(['applications', 'games'])
    expect(model[1].categories).toEqual([]) // only photography has work in it
  })
})

describe('matchesSelection', () => {
  const films = { category: 'films', group: 'reviews' }
  it('matches everything, a group, or a category', () => {
    expect(matchesSelection(films, ALL)).toBe(true)
    expect(matchesSelection(films, { group: 'reviews', category: null })).toBe(true)
    expect(matchesSelection(films, { group: 'reviews', category: 'films' })).toBe(true)
    expect(matchesSelection(films, { group: 'reviews', category: 'music' })).toBe(false)
    expect(matchesSelection(films, { group: 'moments', category: null })).toBe(false)
  })
})

describe('selection encoding', () => {
  const model = buildFilterModel('blog', posts('moments', 'films', 'music'), labels)

  it('makes a key that changes with every selection', () => {
    expect(selectionKey(ALL)).toBe('all')
    expect(selectionKey({ group: 'reviews', category: null })).toBe('reviews')
    expect(selectionKey({ group: 'reviews', category: 'films' })).toBe('reviews/films')
  })

  it('normalizes a selection that the menu no longer contains', () => {
    expect(normalizeSelection({ group: 'art', category: null }, model)).toEqual(ALL)
    expect(normalizeSelection({ group: 'reviews', category: 'books' }, model)).toEqual({ group: 'reviews', category: null })
    expect(normalizeSelection({ group: 'reviews', category: 'films' }, model)).toEqual({ group: 'reviews', category: 'films' })
  })
})

describe('selection in the address', () => {
  it('round-trips a group and a category', () => {
    for (const selection of [ALL, { group: 'reviews', category: null }, { group: 'reviews', category: 'films' }]) {
      const params = new URLSearchParams()
      applySelectionToParams(params, selection)
      expect(selectionFromParams(new URLSearchParams(params.toString()))).toEqual(selection)
    }
  })

  it('leaves other query parameters alone and removes its own on ALL', () => {
    const params = new URLSearchParams('utm=x&group=reviews&category=films')
    applySelectionToParams(params, ALL)
    expect(params.toString()).toBe('utm=x')
  })

  it('reads a category without a group as everything', () => {
    expect(selectionFromParams(new URLSearchParams('category=films'))).toEqual(ALL)
  })

  it('lets normalizeSelection discard values the model does not have', () => {
    const model = buildFilterModel('blog', posts('films', 'music'), labels)
    expect(normalizeSelection(selectionFromParams(new URLSearchParams('group=nope')), model)).toEqual(ALL)
    expect(normalizeSelection(selectionFromParams(new URLSearchParams('group=reviews&category=nope')), model)).toEqual({
      group: 'reviews',
      category: null,
    })
  })
})
