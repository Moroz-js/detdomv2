import type { Block } from 'payload'

export const HeroBlock: Block = {
  slug: 'hero',
  labels: { singular: 'Hero', plural: 'Hero' },
  fields: [
    { name: 'heading', type: 'text', required: true, label: 'Заголовок (H1)' },
    { name: 'subtitle', type: 'textarea', label: 'Подзаголовок' },
  ],
}

export const BannerBlock: Block = {
  slug: 'banner',
  labels: { singular: 'Баннер', plural: 'Баннеры' },
  fields: [
    { name: 'image', type: 'upload', relationTo: 'media', required: true, label: 'Изображение' },
    { name: 'href', type: 'text', label: 'Ссылка' },
  ],
}

export const CtaBlock: Block = {
  slug: 'cta',
  labels: { singular: 'CTA', plural: 'CTA' },
  fields: [
    { name: 'title', type: 'text', required: true, label: 'Заголовок' },
    { name: 'text', type: 'textarea', label: 'Текст' },
    { name: 'buttonLabel', type: 'text', label: 'Текст кнопки' },
    { name: 'buttonUrl', type: 'text', label: 'URL кнопки' },
  ],
}

export const SliderBlock: Block = {
  slug: 'slider',
  labels: { singular: 'Слайдер', plural: 'Слайдеры' },
  fields: [
    {
      name: 'slides',
      type: 'array',
      label: 'Слайды',
      fields: [
        { name: 'image', type: 'upload', relationTo: 'media', required: true },
        { name: 'href', type: 'text', label: 'Ссылка (опционально)' },
      ],
    },
  ],
}

export const ContentBlock: Block = {
  slug: 'content',
  labels: { singular: 'Текст (rich)', plural: 'Тексты' },
  fields: [
    {
      name: 'body',
      type: 'richText',
      label: 'Содержимое',
      required: true,
    },
  ],
}

export const ImageBlock: Block = {
  slug: 'image',
  labels: { singular: 'Изображение', plural: 'Изображения' },
  fields: [
    { name: 'media', type: 'upload', relationTo: 'media', required: true },
    { name: 'caption', type: 'text', label: 'Подпись' },
  ],
}

export const FormTabsBlock: Block = {
  slug: 'formTabs',
  labels: { singular: 'Формы (MVP)', plural: 'Формы' },
  fields: [
    { name: 'title', type: 'text', required: true, label: 'Заголовок блока' },
    { name: 'intro', type: 'textarea', label: 'Вводный текст' },
    {
      name: 'privacyHref',
      type: 'text',
      label: 'Ссылка на политику',
      defaultValue: '/privacy',
    },
  ],
}

export const HeadingBlock: Block = {
  slug: 'heading',
  labels: { singular: 'Подзаголовок H2', plural: 'Подзаголовки' },
  fields: [{ name: 'text', type: 'text', required: true, label: 'Текст' }],
}

export const FileListBlock: Block = {
  slug: 'fileList',
  labels: { singular: 'Список файлов', plural: 'Списки файлов' },
  fields: [
    { name: 'sectionTitle', type: 'text', required: true, label: 'Название раздела' },
    {
      name: 'items',
      type: 'array',
      label: 'Файлы',
      fields: [
        { name: 'title', type: 'text', required: true, label: 'Название' },
        { name: 'file', type: 'upload', relationTo: 'media', required: true, label: 'Файл' },
      ],
    },
  ],
}

const contentColumnBlocks: Block[] = [
  HeroBlock,
  BannerBlock,
  CtaBlock,
  SliderBlock,
  ContentBlock,
  ImageBlock,
  FormTabsBlock,
  HeadingBlock,
  FileListBlock,
]

export const ContainerBlock: Block = {
  slug: 'container',
  labels: { singular: 'Контейнер (1-2-3 колонки)', plural: 'Контейнеры (1-2-3 колонки)' },
  fields: [
    { name: 'title', type: 'text', label: 'Заголовок секции' },
    { name: 'subtitle', type: 'textarea', label: 'Подзаголовок секции' },
    {
      name: 'columns',
      type: 'select',
      label: 'Количество колонок',
      defaultValue: '2',
      options: [
        { label: '1 колонка', value: '1' },
        { label: '2 колонки', value: '2' },
        { label: '3 колонки', value: '3' },
      ],
      required: true,
    },
    {
      name: 'column1',
      type: 'blocks',
      label: 'Колонка 1',
      blocks: contentColumnBlocks,
    },
    {
      name: 'column2',
      type: 'blocks',
      label: 'Колонка 2',
      blocks: contentColumnBlocks,
      admin: {
        condition: (_, siblingData) => siblingData?.columns !== '1',
      },
    },
    {
      name: 'column3',
      type: 'blocks',
      label: 'Колонка 3',
      blocks: contentColumnBlocks,
      admin: {
        condition: (_, siblingData) => siblingData?.columns === '3',
      },
    },
  ],
}

export const pageBlocks: Block[] = [
  HeroBlock,
  BannerBlock,
  CtaBlock,
  SliderBlock,
  ContentBlock,
  ImageBlock,
  FormTabsBlock,
  HeadingBlock,
  FileListBlock,
  ContainerBlock,
]
