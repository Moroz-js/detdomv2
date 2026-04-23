import type { CollectionConfig } from 'payload'
import { slugField } from 'payload'

import { authenticated } from '../access/authenticated.ts'
import { authenticatedOrPublished } from '../access/authenticatedOrPublished.ts'
import { pageBlocks } from '../blocks/pageBlocks.ts'

function previewPathForSlug(slug: string | null | undefined): string {
  if (slug === 'home') return '/'
  if (slug === 'documents') return '/documents'
  if (slug) return `/${slug}`
  return '/'
}

export const Pages: CollectionConfig<'pages'> = {
  slug: 'pages',
  labels: { singular: 'Страница', plural: 'Страницы' },
  access: {
    create: authenticated,
    delete: authenticated,
    read: authenticatedOrPublished,
    update: authenticated,
  },
  defaultPopulate: {
    title: true,
    slug: true,
    blocks: true,
  },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'slug', 'updatedAt'],
    livePreview: {
      url: ({ data }) => {
        const base = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
        const secret = process.env.PREVIEW_SECRET
        if (!secret) return null
        const slug = data?.slug as string | undefined
        const redirect = previewPathForSlug(slug)
        const params = new URLSearchParams({
          secret,
          redirect,
        })
        return `${base}/api/draft?${params.toString()}`
      },
    },
  },
  fields: [
    { name: 'title', type: 'text', required: true, label: 'Название' },
    slugField({ useAsSlug: 'title' }),
    {
      name: 'blocks',
      type: 'blocks',
      label: 'Блоки',
      blocks: pageBlocks,
    },
  ],
  versions: {
    drafts: {
      autosave: {
        interval: 500,
      },
    },
    maxPerDoc: 25,
  },
}
