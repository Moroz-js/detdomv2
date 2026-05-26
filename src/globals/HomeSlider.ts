import type { GlobalConfig } from 'payload'

import { authenticated } from '../access/authenticated.ts'

export const HomeSlider: GlobalConfig = {
  slug: 'homeSlider',
  label: 'Главный слайдер',
  access: {
    read: () => true,
    update: authenticated,
  },
  fields: [
    {
      name: 'slides',
      type: 'array',
      label: 'Слайды',
      fields: [
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
        { name: 'alt', type: 'text', label: 'Alt-текст' },
        { name: 'href', type: 'text', label: 'Ссылка (опц.)' },
        {
          name: 'title',
          type: 'text',
          label: 'Внутреннее название (для админки)',
        },
      ],
    },
  ],
}
