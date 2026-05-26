import type { CollectionConfig } from 'payload'

import { authenticated } from '../access/authenticated.ts'

export const Achievements: CollectionConfig = {
  slug: 'achievements',
  labels: { singular: 'Достижение', plural: 'Достижения' },
  access: {
    create: authenticated,
    delete: authenticated,
    read: () => true,
    update: authenticated,
  },
  defaultSort: 'order',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['order', 'title', 'year', 'updatedAt'],
  },
  fields: [
    {
      name: 'order',
      type: 'number',
      required: true,
      label: 'Порядок',
      admin: { description: 'Сортировка в галерее (1, 2, 3, ...).' },
    },
    {
      name: 'title',
      type: 'text',
      label: 'Название',
      admin: { description: 'Можно оставить пустым или поставить «1», «2», ...' },
    },
    {
      name: 'year',
      type: 'number',
      label: 'Год (опц.)',
    },
    {
      name: 'image',
      type: 'upload',
      relationTo: 'media',
      label: 'Изображение (upload)',
    },
    {
      name: 'imageUrl',
      type: 'text',
      label: 'Изображение (URL)',
      admin: { description: 'Альтернатива upload — прямой URL.' },
    },
  ],
}
