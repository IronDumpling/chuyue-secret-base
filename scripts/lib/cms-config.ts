// Generates the Sveltia CMS config from lib/taxonomy.ts, so the editor's form always
// matches the categories the site actually reads. Adding a category later is a one-line
// change to the taxonomy, not a config edit here.
import { getGroups, type BlogGroup, type PortfolioCategory } from '../../lib/taxonomy'

const NO_CODE: readonly PortfolioCategory[] = ['photography', 'illustration', 'novel']
import { hasRating } from '../../lib/blog-utils'
import { en } from '../../lib/i18n/dictionaries/en'
import { REVIEW_CATEGORIES } from '../../lib/ratings'

export interface CmsOptions {
  repo: string
  branch: string
}

type CmsField = { name: string; i18n?: boolean | 'duplicate' } & Record<string, unknown>
type CmsFieldInput = { name: string } & Record<string, unknown>

function localField(field: CmsFieldInput): CmsField {
  return { ...field, i18n: true }
}

function sharedField(field: CmsFieldInput): CmsField {
  return { ...field, i18n: 'duplicate' }
}

function dateField(): CmsField {
  return sharedField({ name: 'date', label: 'Date', widget: 'datetime', type: 'date' })
}

function tagsField(): CmsField {
  return localField({ name: 'tags', label: 'Tags', widget: 'list', required: false })
}

function imagesField(): CmsField {
  return sharedField({
    name: 'images',
    label: 'Images (first one is the cover)',
    widget: 'image',
    multiple: true,
    required: false,
  })
}

function linkListField(name: string, label: string): CmsField {
  return sharedField({
    name,
    label,
    widget: 'list',
    required: false,
    fields: [
      { name: 'url', label: 'URL', widget: 'string' },
      { name: 'label', label: 'Button text', widget: 'string', required: false },
    ],
  })
}

function bodyField(): CmsField {
  return localField({ name: 'body', label: 'Body', widget: 'richtext' })
}

function blogFields(group: BlogGroup): CmsField[] {
  const fields: CmsField[] = [
    localField({ name: 'title', label: 'Title', widget: 'string' }),
    localField({ name: 'description', label: 'One-line summary', widget: 'text', required: false }),
    dateField(),
    imagesField(),
  ]
  if (hasRating(group)) {
    fields.push(
      sharedField({
        name: 'rating',
        label: 'Rating (1-10)',
        widget: 'number',
        value_type: 'int',
        min: 1,
        max: 10,
        required: false,
      })
    )
    fields.push(
      sharedField({
        name: 'website',
        label: 'External link',
        widget: 'object',
        required: false,
        fields: [
          { name: 'url', label: 'URL', widget: 'string' },
          { name: 'label', label: 'Button text', widget: 'string' },
        ],
      })
    )
  }
  fields.push(bodyField())
  return fields
}

function portfolioFields(category: PortfolioCategory): CmsField[] {
  const fields: CmsField[] = [
    localField({ name: 'title', label: 'Title', widget: 'string' }),
    localField({ name: 'description', label: 'One-line summary', widget: 'text', required: false }),
    dateField(),
    tagsField(),
    imagesField(),
    sharedField({
      name: 'context',
      label: 'Context',
      widget: 'select',
      required: false,
      options: ['course', 'research', 'work', 'personal'],
    }),
  ]
  // Pictures and writing have no code repository or live demo. Games do, though they sit in
  // the Art group, so this follows the category, not the group.
  if (!NO_CODE.includes(category)) {
    fields.push(linkListField('github', 'GitHub links'))
    fields.push(linkListField('demo', 'Demo links'))
  }
  fields.push(linkListField('website', 'Website links'))
  fields.push(bodyField())
  return fields
}

// The rating scale (content/blog/ratings.{en,zh}.yml, see lib/ratings.ts): a full default set
// and optional per-category overrides. Each language file is edited on its own, so every field
// is localized. Category choices follow the taxonomy's reviews group.
function ratingsCollection(): Record<string, unknown> {
  const score = { name: 'score', label: 'Score', widget: 'number', value_type: 'int', min: 1, max: 10 }
  return {
    name: 'ratings',
    label: 'Rating scale',
    format: 'yaml',
    files: [
      {
        name: 'ratings',
        label: 'Rating scale',
        file: 'blog/ratings.{{locale}}.yml',
        i18n: true,
        fields: [
          localField({ name: 'subtitle', label: 'Subtitle (under the heading)', widget: 'string' }),
          localField({
            name: 'tiers',
            label: 'Tiers (one per score, 1-10)',
            widget: 'list',
            min: 10,
            max: 10,
            summary: '{{fields.score}} · {{fields.name}}',
            fields: [
              score,
              { name: 'name', label: 'Name', widget: 'string' },
              { name: 'definition', label: 'Definition', widget: 'text' },
            ],
          }),
          localField({
            name: 'categories',
            label: 'Category overrides (anything left empty uses the defaults)',
            widget: 'list',
            required: false,
            summary: '{{fields.category}}',
            fields: [
              { name: 'category', label: 'Category', widget: 'select', options: [...REVIEW_CATEGORIES] },
              { name: 'subtitle', label: 'Subtitle', widget: 'string', required: false },
              {
                name: 'tiers',
                label: 'Tier overrides',
                widget: 'list',
                required: false,
                summary: '{{fields.score}} · {{fields.name}}',
                fields: [
                  score,
                  { name: 'name', label: 'Name', widget: 'string', required: false },
                  { name: 'definition', label: 'Definition', widget: 'text', required: false },
                ],
              },
            ],
          }),
        ],
      },
    ],
  }
}

export function buildCmsConfig({ repo, branch }: CmsOptions): Record<string, unknown> {
  const blogCollections = getGroups('blog').flatMap(group =>
    group.categories.map(category => ({
      name: `blog-${category}`,
      label: `Blog · ${en.blog.categories[category]}`,
      folder: `blog/${category}`,
      extension: 'mdx',
      format: 'frontmatter',
      create: true,
      // Chinese titles cannot become ASCII slugs, so the editor asks for the slug instead.
      slug: '{{fields._slug}}',
      i18n: true,
      media_folder: `/images/blog/${category}`,
      public_folder: `/images/blog/${category}`,
      fields: blogFields(group.id),
    }))
  )

  const portfolioCollections = getGroups('portfolio').flatMap(group =>
    group.categories.map(category => ({
      name: `portfolio-${category}`,
      label: `Portfolio · ${en.portfolio.categories[category]}`,
      folder: `portfolio/${category}`,
      extension: 'mdx',
      format: 'frontmatter',
      create: true,
      // Chinese titles cannot become ASCII slugs, so the editor asks for the slug instead.
      slug: '{{fields._slug}}',
      i18n: true,
      media_folder: `/images/portfolio/${category}`,
      public_folder: `/images/portfolio/${category}`,
      fields: portfolioFields(category),
    }))
  )

  return {
    backend: { name: 'github', repo, branch, auth_methods: ['token'] },
    // Fallback for the global Asset Library (browsed outside any specific collection/field,
    // e.g. via the top "Media" nav item), which needs a media folder even though every
    // collection also sets its own via media_folder/public_folder above.
    media_folder: '/images',
    public_folder: '/images',
    // Entry file names become URL slugs; accented titles like "Résidence Evil" would
    // otherwise produce non-ASCII slugs, so strip accents and keep slugs ASCII-only.
    slug: { encoding: 'ascii', clean_accents: true },
    i18n: {
      structure: 'multiple_files',
      locales: ['en', 'zh'],
      // The default locale is always saved and validated (only other locales can be turned
      // off), so it is the language most posts are written in; English is opt-in per entry.
      default_locale: 'zh',
      initial_locales: ['zh'],
    },
    media_libraries: {
      all: {
        transformations: {
          raster_image: { format: 'webp', quality: 82, width: 2048, height: 2048 },
        },
      },
    },
    collections: [...blogCollections, ...portfolioCollections, ratingsCollection()],
  }
}
