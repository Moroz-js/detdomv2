import type { GlobalConfig } from 'payload'

import { authenticated } from '../access/authenticated.ts'

export const FooterContent: GlobalConfig = {
  slug: 'footerContent',
  label: 'Контент подвала',
  access: {
    read: () => true,
    update: authenticated,
  },
  fields: [
    {
      name: 'navSectionTitle',
      type: 'text',
      label: 'Заголовок колонки «Основные разделы»',
      defaultValue: 'Основные разделы',
    },
    {
      name: 'contactsSectionTitle',
      type: 'text',
      label: 'Заголовок колонки «Контакты»',
      defaultValue: 'Контакты',
    },
    {
      name: 'contactsBody',
      type: 'richText',
      label: 'Текст колонки «Контакты»',
    },
    {
      name: 'extraBody',
      type: 'richText',
      label: 'Текст третьей колонки (доп. сведения)',
    },
    {
      name: 'copyrightOrganization',
      type: 'text',
      label: 'Организация в копирайте (перед годом)',
      defaultValue: 'КГКУ «Комплексный центр помощи семье и детям г. Уссурийска»',
    },
    {
      name: 'busBadgeImageUrl',
      type: 'text',
      label: 'URL изображения bus.gov.ru',
      defaultValue: 'https://detskiydomuss.ru/wp-content/themes/detdom/assets/img/footer-image.png',
    },
    {
      name: 'busBadgeImageAlt',
      type: 'text',
      label: 'Alt изображения bus.gov.ru',
      defaultValue: 'bus.gov.ru — результаты независимой оценки качества оказания услуг',
    },
  ],
}
