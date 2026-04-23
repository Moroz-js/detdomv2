import type { GlobalConfig } from 'payload'

import { authenticated } from '../access/authenticated.ts'

export const HeaderNav: GlobalConfig = {
  slug: 'headerNav',
  label: 'Меню (шапка)',
  access: {
    read: () => true,
    update: authenticated,
  },
  fields: [
    {
      name: 'items',
      type: 'array',
      label: 'Пункты',
      fields: [
        { name: 'label', type: 'text', required: true },
        { name: 'href', type: 'text', required: true },
        {
          name: 'children',
          type: 'array',
          label: 'Подпункты',
          fields: [
            { name: 'label', type: 'text', required: true },
            { name: 'href', type: 'text', required: true },
          ],
        },
      ],
    },
  ],
}
