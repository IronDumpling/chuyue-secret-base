import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import fs from 'fs'
import os from 'os'
import path from 'path'
import { createRatingsSource } from './ratings-source'
import { SCORES } from './ratings'

let dir: string

function write(rel: string, text: string) {
  const full = path.join(dir, rel)
  fs.mkdirSync(path.dirname(full), { recursive: true })
  fs.writeFileSync(full, text)
}

function yamlFile(prefix: string): string {
  const tiers = SCORES.map(s => `  - score: ${s}\n    name: ${prefix}${s}\n    definition: ${prefix}D${s}`).join('\n')
  return `subtitle: ${prefix}S\ntiers:\n${tiers}\n`
}

beforeEach(() => {
  dir = fs.mkdtempSync(path.join(os.tmpdir(), 'ratings-'))
})
afterEach(() => {
  fs.rmSync(dir, { recursive: true, force: true })
})

describe('createRatingsSource', () => {
  it('reads each language from its own file', () => {
    write('blog/ratings.en.yml', yamlFile('E'))
    write('blog/ratings.zh.yml', yamlFile('Z'))
    const source = createRatingsSource(dir)
    expect(source.scales('en').films!.tiers[7].name).toBe('E7')
    expect(source.scales('zh').films!.tiers[7].name).toBe('Z7')
  })

  it('throws naming the file when a language file is missing', () => {
    write('blog/ratings.en.yml', yamlFile('E'))
    expect(() => createRatingsSource(dir).scales('zh')).toThrow('ratings.zh.yml')
  })

  it('throws naming the file when the YAML does not parse', () => {
    write('blog/ratings.en.yml', 'subtitle: [unclosed\n')
    expect(() => createRatingsSource(dir).scales('en')).toThrow('ratings.en.yml')
  })

  it('accepts the committed content files', () => {
    const source = createRatingsSource(path.join(process.cwd(), 'content'))
    expect(source.scales('en').films!.tiers[5].name).toBe('Competent')
    expect(source.scales('zh').films!.tiers[5].name).toBe('合格作品')
  })
})
