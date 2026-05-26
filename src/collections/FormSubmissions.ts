import type { CollectionConfig } from 'payload'

import { authenticated } from '../access/authenticated.ts'

export const FormSubmissions: CollectionConfig = {
  slug: 'form-submissions',
  labels: { singular: 'Заявка', plural: 'Заявки' },
  access: {
    create: () => true,
    read: authenticated,
    update: authenticated,
    delete: authenticated,
  },
  admin: {
    useAsTitle: 'subject',
    defaultColumns: ['formType', 'name', 'subject', 'status', 'createdAt'],
    description:
      'Заявки с публичных форм сайта (без отправки email — оператор обрабатывает вручную).',
  },
  fields: [
    {
      name: 'formType',
      type: 'select',
      required: true,
      label: 'Тип формы',
      options: [
        { label: 'Нужна помощь', value: 'help_request' },
        { label: 'Хочу помочь', value: 'want_to_help' },
        { label: 'Обратная связь', value: 'feedback' },
      ],
    },
    { name: 'name', type: 'text', required: true, label: 'Имя' },
    { name: 'phone', type: 'text', label: 'Телефон' },
    { name: 'email', type: 'text', label: 'Email' },
    { name: 'subject', type: 'text', label: 'Тема' },
    { name: 'message', type: 'textarea', required: true, label: 'Сообщение' },
    {
      name: 'pageSlug',
      type: 'text',
      label: 'Откуда отправлено (slug страницы)',
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'new',
      label: 'Статус',
      options: [
        { label: 'Новая', value: 'new' },
        { label: 'В работе', value: 'in_progress' },
        { label: 'Обработана', value: 'done' },
      ],
    },
  ],
  timestamps: true,
}
