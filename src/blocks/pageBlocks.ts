import type { Block } from 'payload'

export const HeroBlock: Block = {
  slug: 'hero',
  labels: { singular: 'Hero', plural: 'Hero' },
  fields: [
    { name: 'heading', type: 'text', required: true, label: 'Заголовок (H1)' },
    { name: 'subtitle', type: 'textarea', label: 'Подзаголовок' },
    {
      name: 'image',
      type: 'upload',
      relationTo: 'media',
      label: 'Изображение (upload)',
      admin: { description: 'Если задан — используется upload; иначе берётся URL ниже.' },
    },
    {
      name: 'imageUrl',
      type: 'text',
      label: 'Изображение (URL)',
      admin: { description: 'Прямой URL (например, на detskiydomuss.ru).' },
    },
  ],
}

export const BannerBlock: Block = {
  slug: 'banner',
  labels: { singular: 'Баннер', plural: 'Баннеры' },
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
        { name: 'image', type: 'upload', relationTo: 'media', label: 'Изображение (upload)' },
        { name: 'imageUrl', type: 'text', label: 'Изображение (URL)' },
        { name: 'alt', type: 'text', label: 'Alt-текст' },
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
    { name: 'media', type: 'upload', relationTo: 'media', label: 'Изображение (upload)' },
    { name: 'imageUrl', type: 'text', label: 'Изображение (URL)' },
    { name: 'alt', type: 'text', label: 'Alt-текст' },
    { name: 'caption', type: 'text', label: 'Подпись' },
    {
      name: 'width',
      type: 'select',
      label: 'Ширина',
      defaultValue: 'auto',
      options: [
        { label: 'Авто', value: 'auto' },
        { label: '1/3', value: '1/3' },
        { label: '1/2', value: '1/2' },
        { label: '2/3', value: '2/3' },
        { label: 'Полная', value: 'full' },
      ],
    },
    {
      name: 'maxHeight',
      type: 'select',
      label: 'Макс. высота',
      defaultValue: 'md',
      options: [
        { label: 'Маленькая (320px)', value: 'sm' },
        { label: 'Средняя (480px)', value: 'md' },
        { label: 'Большая (640px)', value: 'lg' },
        { label: 'Очень большая (800px)', value: 'xl' },
        { label: 'Без ограничений', value: 'none' },
      ],
    },
  ],
}

export const FormTabsBlock: Block = {
  slug: 'formTabs',
  labels: { singular: 'Формы (MVP)', plural: 'Формы' },
  fields: [
    { name: 'title', type: 'text', required: true, label: 'Заголовок блока' },
    { name: 'intro', type: 'textarea', label: 'Вводный текст' },
    {
      name: 'tabs',
      type: 'select',
      hasMany: true,
      label: 'Доступные вкладки',
      defaultValue: ['help_request', 'want_to_help', 'feedback'],
      options: [
        { label: 'Нужна помощь', value: 'help_request' },
        { label: 'Хочу помочь', value: 'want_to_help' },
        { label: 'Обратная связь', value: 'feedback' },
      ],
    },
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
  fields: [
    { name: 'text', type: 'text', required: true, label: 'Текст' },
    {
      name: 'anchorId',
      type: 'text',
      label: 'Якорь (id)',
      admin: {
        description:
          'Без решётки, латиницей. Используется для ссылок вида /info#main, /socials#living и т.п.',
      },
    },
  ],
}

const FILE_EXT_OPTIONS = [
  { label: 'PDF', value: 'pdf' },
  { label: 'DOCX', value: 'docx' },
  { label: 'DOC', value: 'doc' },
  { label: 'XLSX', value: 'xlsx' },
  { label: 'XLS', value: 'xls' },
  { label: 'ZIP', value: 'zip' },
  { label: 'Другое', value: 'other' },
]

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
        { name: 'file', type: 'upload', relationTo: 'media', label: 'Файл (upload)' },
        {
          name: 'fileUrl',
          type: 'text',
          label: 'Файл (URL)',
          admin: { description: 'Альтернатива upload — прямой URL.' },
        },
        {
          name: 'fileExt',
          type: 'select',
          label: 'Тип файла',
          defaultValue: 'pdf',
          options: FILE_EXT_OPTIONS,
        },
      ],
    },
  ],
}

export const EmbedBlock: Block = {
  slug: 'embed',
  labels: { singular: 'HTML-вставка', plural: 'HTML-вставки' },
  fields: [
    { name: 'title', type: 'text', label: 'Внутреннее название (для админки)' },
    {
      name: 'html',
      type: 'textarea',
      required: true,
      label: 'HTML-код виджета',
      admin: {
        description:
          'Вставится «как есть». Используется для виджетов Госуслуг, форм CF7 и т.п.',
      },
    },
  ],
}

export const GalleryBlock: Block = {
  slug: 'gallery',
  labels: { singular: 'Галерея (достижения)', plural: 'Галереи' },
  fields: [
    { name: 'title', type: 'text', label: 'Заголовок (опц.)' },
    {
      name: 'source',
      type: 'select',
      label: 'Источник',
      required: true,
      defaultValue: 'achievements',
      options: [
        { label: 'Коллекция «Достижения»', value: 'achievements' },
        { label: 'Свой список изображений', value: 'custom' },
      ],
    },
    {
      name: 'year',
      type: 'number',
      label: 'Фильтр по году (для коллекции)',
      admin: { condition: (_, sibling) => sibling?.source === 'achievements' },
    },
    {
      name: 'items',
      type: 'array',
      label: 'Свои изображения',
      admin: { condition: (_, sibling) => sibling?.source === 'custom' },
      fields: [
        { name: 'image', type: 'upload', relationTo: 'media', label: 'Изображение (upload)' },
        { name: 'imageUrl', type: 'text', label: 'Изображение (URL)' },
        { name: 'alt', type: 'text', label: 'Alt-текст' },
        { name: 'caption', type: 'text', label: 'Подпись' },
      ],
    },
  ],
}

export const HomeSliderBlock: Block = {
  slug: 'homeSlider',
  labels: { singular: 'Главный слайдер', plural: 'Главные слайдеры' },
  fields: [
    {
      name: 'note',
      type: 'text',
      label: 'Заметка (опц.)',
      admin: {
        description:
          'Содержимое слайдера редактируется в глобале «Главный слайдер». Здесь — место для размещения.',
      },
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
  EmbedBlock,
]

export const ContainerBlock: Block = {
  slug: 'container',
  labels: { singular: 'Контейнер (до 6 колонок)', plural: 'Контейнеры (до 6 колонок)' },
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
        { label: '4 колонки', value: '4' },
        { label: '5 колонок', value: '5' },
        { label: '6 колонок', value: '6' },
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
        condition: (_, siblingData) =>
          ['3', '4', '5', '6'].includes(String(siblingData?.columns ?? '')),
      },
    },
    {
      name: 'column4',
      type: 'blocks',
      label: 'Колонка 4',
      blocks: contentColumnBlocks,
      admin: {
        condition: (_, siblingData) =>
          ['4', '5', '6'].includes(String(siblingData?.columns ?? '')),
      },
    },
    {
      name: 'column5',
      type: 'blocks',
      label: 'Колонка 5',
      blocks: contentColumnBlocks,
      admin: {
        condition: (_, siblingData) => ['5', '6'].includes(String(siblingData?.columns ?? '')),
      },
    },
    {
      name: 'column6',
      type: 'blocks',
      label: 'Колонка 6',
      blocks: contentColumnBlocks,
      admin: {
        condition: (_, siblingData) => String(siblingData?.columns ?? '') === '6',
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
  EmbedBlock,
  GalleryBlock,
  HomeSliderBlock,
  ContainerBlock,
]
