import fs from 'node:fs'
import path from 'node:path'
import type { SanitizedConfig } from 'payload'
import { getPayload } from 'payload'

import {
  extraPagesSeed,
  footerContentSeed,
  footerNavSeed,
  headerNavSeed,
  homeBlocks,
  newsSeed,
} from './seedSiteContent.ts'

function hasLexicalBody(body: unknown): boolean {
  if (!body || typeof body !== 'object') return false
  const children = (body as { root?: { children?: unknown[] } }).root?.children
  return Array.isArray(children) && children.length > 0
}

export async function script(config: SanitizedConfig) {
  console.log('Сид: меню, главная, documents и остальные страницы…')
  const payload = await getPayload({ config })

  const adminEmail = 'admin@admin.com'
  const adminUser = await payload.find({
    collection: 'users',
    limit: 1,
    overrideAccess: true,
    where: {
      email: {
        equals: adminEmail,
      },
    },
  })

  if (!adminUser.docs.length) {
    const adminPassword = process.env.ADMIN_SEED_PASSWORD
    if (!adminPassword) {
      throw new Error('ADMIN_SEED_PASSWORD is required to create admin seed user')
    }

    await payload.create({
      collection: 'users',
      data: {
        email: adminEmail,
        password: adminPassword,
      },
      overrideAccess: true,
    })
    console.log(`Создан пользователь ${adminEmail}`)
  } else {
    console.log(`Пользователь ${adminEmail} уже существует — пропуск`)
  }

  await payload.updateGlobal({
    slug: 'headerNav',
    data: headerNavSeed,
    overrideAccess: true,
  })

  await payload.updateGlobal({
    slug: 'footerNav',
    data: footerNavSeed,
    overrideAccess: true,
  })

  const footerContentExisting = await payload.findGlobal({
    slug: 'footerContent',
    overrideAccess: true,
  })
  if (!hasLexicalBody(footerContentExisting.contactsBody) || !hasLexicalBody(footerContentExisting.extraBody)) {
    await payload.updateGlobal({
      slug: 'footerContent',
      data: footerContentSeed as Record<string, unknown>,
      overrideAccess: true,
    })
    console.log('Заполнен глобал «Контент подвала» (footerContent)')
  } else {
    console.log('Контент подвала уже заполнен — пропуск')
  }

  const homeExists = await payload.find({
    collection: 'pages',
    draft: false,
    limit: 1,
    overrideAccess: true,
    where: { slug: { equals: 'home' } },
  })

  if (!homeExists.docs.length) {
    await payload.create({
      collection: 'pages',
      data: {
        title: 'Главная',
        slug: 'home',
        _status: 'published',
        blocks: homeBlocks as any,
      },
      draft: false,
      overrideAccess: true,
    })
    console.log('Создана страница home')
  } else {
    console.log('Страница home уже есть — пропуск')
  }

  const docExists = await payload.find({
    collection: 'pages',
    draft: false,
    limit: 1,
    overrideAccess: true,
    where: { slug: { equals: 'documents' } },
  })

  if (!docExists.docs.length) {
    await payload.create({
      collection: 'pages',
      data: {
        title: 'Документы',
        slug: 'documents',
        _status: 'published',
        blocks: [
          { blockType: 'heading', text: 'Планы, программы, отчёты' },
          { blockType: 'fileList', sectionTitle: 'Планы', items: [] },
          { blockType: 'fileList', sectionTitle: 'Программы', items: [] },
          { blockType: 'fileList', sectionTitle: 'Программы дошкольного образования', items: [] },
        ] as any,
      },
      draft: false,
      overrideAccess: true,
    })
    console.log('Создана страница documents')
  } else {
    console.log('Страница documents уже есть — пропуск')
  }

  for (const page of extraPagesSeed) {
    const exists = await payload.find({
      collection: 'pages',
      draft: false,
      limit: 1,
      overrideAccess: true,
      where: { slug: { equals: page.slug } },
    })
    if (exists.docs.length) {
      console.log(`Страница ${page.slug} уже есть — пропуск`)
      continue
    }
    await payload.create({
      collection: 'pages',
      data: {
        title: page.title,
        slug: page.slug,
        _status: 'published',
        blocks: page.blocks as any,
      },
      draft: false,
      overrideAccess: true,
    })
    console.log(`Создана страница ${page.slug}`)
  }

  const existingNews = await payload.find({
    collection: 'news',
    draft: false,
    limit: 1,
    overrideAccess: true,
  })

  if (!existingNews.docs.length) {
    let coverMediaId: number | string | null = null

    const mediaExisting = await payload.find({
      collection: 'media',
      draft: false,
      limit: 1,
      overrideAccess: true,
      sort: '-createdAt',
    })

    if (mediaExisting.docs.length) {
      coverMediaId = mediaExisting.docs[0].id
    } else {
      const seedImagePath = path.resolve(process.cwd(), 'media', '68ef14cc-bb4d-4f69-bb7a-7bc7f68474a5.png')
      if (fs.existsSync(seedImagePath)) {
        const uploaded = await payload.create({
          collection: 'media',
          data: { alt: 'Обложка для новостей (сид)' },
          filePath: seedImagePath,
          overrideAccess: true,
        })
        coverMediaId = uploaded.id
      }
    }

    if (!coverMediaId) {
      console.log('Не удалось подготовить изображение для сида новостей — новости пропущены')
    } else {
      for (const item of newsSeed) {
        await payload.create({
          collection: 'news',
          data: {
            title: item.title,
            slug: item.slug,
            publishedAt: item.publishedAt,
            content: item.content as any,
            gallery: [{ image: coverMediaId }],
            _status: 'published',
          },
          draft: false,
          overrideAccess: true,
        })
      }
      console.log(`Создано новостей: ${newsSeed.length}`)
    }
  } else {
    console.log('Новости уже есть — пропуск')
  }

  await payload.destroy()
}
