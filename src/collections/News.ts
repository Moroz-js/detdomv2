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
    thumbnail: true,
    thumbnailUrl: true,
    gallery: true,
    galleryUrls: true,
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
      name: 'thumbnail',
      type: 'upload',
      relationTo: 'media',
      label: 'Миниатюра (upload)',
      admin: { description: 'Используется для карточки в ленте.' },
    },
    {
      name: 'thumbnailUrl',
      type: 'text',
      label: 'Миниатюра (URL)',
      admin: { description: 'Альтернатива upload — прямой URL.' },
    },
    {
      name: 'gallery',
      type: 'array',
      label: 'Галерея (upload)',
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
      name: 'galleryUrls',
      type: 'array',
      label: 'Галерея (URL)',
      admin: { description: 'Альтернатива — массив прямых URL изображений.' },
      fields: [
        { name: 'url', type: 'text', required: true, label: 'URL' },
        { name: 'alt', type: 'text', label: 'Alt-текст' },
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
