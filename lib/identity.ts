export type Identity = 'engineer' | 'creator' | 'adventurer'

export const orderedIdentities: Identity[] = ['engineer', 'creator', 'adventurer']

export const identityLabels: Record<Identity, string> = {
  engineer: 'Software Engineer',
  creator: 'Creator / Designer',
  adventurer: 'Adventurer',
}

export const identityShortDescriptions: Record<Identity, string> = {
  engineer: 'Designing and building reliable software systems.',
  creator: 'Crafting games, visuals, stories, and sound.',
  adventurer: 'Exploring activities, sports, and new connections.',
}

