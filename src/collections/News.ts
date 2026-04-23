import type { CollectionConfig } from 'payload'
import { slugField } from 'payload'

import { authenticated } from '../access/authenticated.ts'
import { authenticatedOrPublished } from '../access/authenticatedOrPublished.ts'

export const News: CollectionConfig = {
  slug: 'news',
  labels: { singular: 'Новость', plural: 'Новости' },
  access: {
    create: authenticated,
    delete: authenticated,
    read: authenticatedOrPublished,
    update: authenticated,
  },
  defaultPopulate: {
    title: true,
    slug: true,
    publishedAt: true,
    gallery: true,
  },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'publishedAt', 'updatedAt'],
  },
  fields: [
    { name: 'title', type: 'text', required: true, label: 'Заголовок' },
    slugField({ useAsSlug: 'title' }),
    {
      name: 'publishedAt',
      type: 'date',
      required: true,
      label: 'Дата публикации',
      defaultValue: () => new Date().toISOString(),
      admin: {
        date: {
          pickerAppearance: 'dayOnly',
          displayFormat: 'dd.MM.yyyy',
        },
      },
    },
    {
      name: 'gallery',
      type: 'array',
      label: 'Галерея',
      minRows: 1,
      required: true,
      fields: [
        {
          name: 'image',
          type: 'upload',
          relationTo: 'media',
          required: true,
          label: 'Изображение',
        },
      ],
    },
    {
      name: 'content',
      type: 'richText',
      required: true,
      label: 'Текст новости',
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
