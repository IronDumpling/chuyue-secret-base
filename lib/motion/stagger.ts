// Lists and grids fade their items in one after another. Capped so a long list does not keep
// its last items waiting.
const STAGGER_MS = 40
const STAGGER_MAX = 8

export const staggerDelay = (index: number): string => `${Math.min(index, STAGGER_MAX) * STAGGER_MS}ms`
