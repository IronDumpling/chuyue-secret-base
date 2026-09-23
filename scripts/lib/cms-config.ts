// Generates the Sveltia CMS config from lib/taxonomy.ts, so the editor's form always
// matches the categories the site actually reads. Adding a category later is a one-line
// change to the taxonomy, not a config edit here.
import { getGroups, type BlogGroup, type PortfolioGroup } from '../../lib/taxonomy'
import { hasRating } from '../../lib/blog-utils'
import { en } from '../../lib/i18n/dictionaries/en'

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
  return sharedField({ name: 'tags', label: 'Tags', widget: 'list', required: false })
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

function portfolioFields(group: PortfolioGroup): CmsField[] {
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
  // Art-group work (photography, illustration) has no code repository or live demo.
  if (group !== 'art') {
    fields.push(linkListField('github', 'GitHub links'))
    fields.push(linkListField('demo', 'Demo links'))
  }
  fields.push(linkListField('website', 'Website links'))
  fields.push(bodyField())
  return fields
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
      i18n: true,
      media_folder: `/images/portfolio/${category}`,
      public_folder: `/images/portfolio/${category}`,
      fields: portfolioFields(group.id),
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
      default_locale: 'en',
      initial_locales: ['en'],
    },
    media_libraries: {
      all: {
        transformations: {
          raster_image: { format: 'webp', quality: 82, width: 2048, height: 2048 },
        },
      },
    },
    collections: [...blogCollections, ...portfolioCollections],
  }
}
