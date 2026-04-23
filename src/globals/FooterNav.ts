import type { GlobalConfig } from 'payload'

import { authenticated } from '../access/authenticated.ts'

export const FooterNav: GlobalConfig = {
  slug: 'footerNav',
  label: 'Меню (подвал)',
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
      ],
    },
  ],
}
