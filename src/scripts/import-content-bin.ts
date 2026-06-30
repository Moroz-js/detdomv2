/* eslint-disable no-console */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { getPayload, type SanitizedConfig } from 'payload'

import type { Achievement, News, Page } from '../payload-types.ts'
import { footerNav, headerNav } from './nav-data.ts'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const PARSED = path.resolve(__dirname, 'parsed')

type Json = Record<string, unknown>

function readJson<T = unknown>(rel: string): T {
  return JSON.parse(fs.readFileSync(path.join(PARSED, rel), 'utf8')) as T
}

function dirJsonFiles(rel: string): string[] {
  const dir = path.join(PARSED, rel)
  if (!fs.existsSync(dir)) return []
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith('.json'))
    .map((f) => path.join(dir, f))
}

type PageDoc = { title: string; slug: string; blocks: Json[] }
type NewsDoc = {
  title: string
  slug: string
  publishedAt: string
  excerpt: string | null
  thumbnailUrl: string | null
  galleryUrls: Array<{ url: string; alt?: string }>
  content: Json
}
type AchievementDoc = { order: number; title: string; year?: number; imageUrl: string | null }
type SliderItem = { order: number; title?: string | null; imageUrl: string | null; href?: string | null }

export async function script(config: Promise<SanitizedConfig> | SanitizedConfig): Promise<void> {
  const payload = await getPayload({ config })

  try {
    const counters = { pages: 0, news: 0, achievements: 0, slides: 0, headerNav: 0, footerNav: 0 }

    console.log('[1/6] Импорт страниц…')
    for (const file of dirJsonFiles('pages')) {
      const doc = JSON.parse(fs.readFileSync(file, 'utf8')) as PageDoc
      const { docs } = await payload.find({
        collection: 'pages',
        where: { slug: { equals: doc.slug } },
        limit: 1,
        depth: 0,
        overrideAccess: true,
      })
      const createData = {
        title: doc.title,
        slug: doc.slug,
        blocks: doc.blocks as Page['blocks'],
        generateSlug: false,
        _status: 'published' as const,
      }
      if (docs[0]) {
        await payload.update({
          collection: 'pages',
          id: docs[0].id,
          data: {
            title: doc.title,
            blocks: doc.blocks as Page['blocks'],
            generateSlug: false,
            _status: 'published',
          },
          overrideAccess: true,
        })
        console.log(`  ↻ ${doc.slug}`)
      } else {
        await payload.create({
          collection: 'pages',
          data: createData,
          overrideAccess: true,
        })
        console.log(`  + ${doc.slug}`)
      }
      counters.pages++
    }

    console.log('[2/6] Импорт новостей…')
    const news = readJson<NewsDoc[]>('news.json')
    for (const item of news) {
      const { docs } = await payload.find({
        collection: 'news',
        where: { slug: { equals: item.slug } },
        limit: 1,
        depth: 0,
        overrideAccess: true,
      })
      const createData = {
        title: item.title,
        slug: item.slug,
        publishedAt: item.publishedAt,
        thumbnailUrl: item.thumbnailUrl ?? undefined,
        galleryUrls: (item.galleryUrls ?? []).map((g) => ({
          url: g.url,
          alt: g.alt ?? '',
        })),
        content: item.content as News['content'],
        generateSlug: false,
        _status: 'published' as const,
      }
      try {
        if (docs[0]) {
          await payload.update({
            collection: 'news',
            id: docs[0].id,
            data: {
              ...createData,
              slug: undefined,
            },
            overrideAccess: true,
          })
        } else {
          await payload.create({
            collection: 'news',
            data: createData,
            overrideAccess: true,
          })
        }
        counters.news++
      } catch (err) {
        console.error(`  ✗ news/${item.slug}:`, err instanceof Error ? err.message : err)
        throw err
      }
    }
    console.log(`  ${counters.news} новостей`)

    console.log('[3/6] Импорт достижений…')
    const achievements = readJson<AchievementDoc[]>('achievements.json')
    for (const a of achievements) {
      const { docs } = await payload.find({
        collection: 'achievements',
        where: { order: { equals: a.order } },
        limit: 1,
        depth: 0,
        overrideAccess: true,
      })
      const data = {
        order: a.order,
        title: a.title || String(a.order),
        imageUrl: a.imageUrl ?? undefined,
        ...(a.year ? { year: a.year } : {}),
      } satisfies Omit<Achievement, 'id' | 'updatedAt' | 'createdAt'>
      if (docs[0]) {
        await payload.update({
          collection: 'achievements',
          id: docs[0].id,
          data,
          overrideAccess: true,
        })
      } else {
        await payload.create({
          collection: 'achievements',
          data,
          overrideAccess: true,
        })
      }
      counters.achievements++
    }
    console.log(`  ${counters.achievements} достижений`)

    console.log('[4/6] Импорт глобала «Главный слайдер»…')
    const slides = readJson<SliderItem[]>('main-slider.json')
    await payload.updateGlobal({
      slug: 'homeSlider',
      data: {
        slides: slides
          .filter((s) => !!s.imageUrl)
          .map((s) => ({
            imageUrl: s.imageUrl ?? undefined,
            alt: s.title ?? '',
            href: s.href ?? undefined,
            title: s.title ?? '',
          })),
      },
      overrideAccess: true,
    })
    counters.slides = slides.length
    console.log(`  ${counters.slides} слайдов`)

    console.log('[5/6] Импорт меню шапки (HeaderNav)…')
    await payload.updateGlobal({
      slug: 'headerNav',
      data: {
        items: headerNav.map((item) => ({
          label: item.label,
          href: item.href,
          children: (item.children ?? []).map((child) => ({
            label: child.label,
            href: child.href,
          })),
        })),
      },
      overrideAccess: true,
    })
    counters.headerNav = headerNav.length
    console.log(`  ${counters.headerNav} пунктов (${headerNav.filter((i) => i.children?.length).length} с подменю)`)

    console.log('[6/6] Импорт меню подвала (FooterNav)…')
    await payload.updateGlobal({
      slug: 'footerNav',
      data: {
        items: footerNav.map((item) => ({
          label: item.label,
          href: item.href,
        })),
      },
      overrideAccess: true,
    })
    counters.footerNav = footerNav.length
    console.log(`  ${counters.footerNav} пунктов`)

    console.log(
      `\nГотово: страниц=${counters.pages}, новостей=${counters.news}, достижений=${counters.achievements}, слайдов=${counters.slides}, headerNav=${counters.headerNav}, footerNav=${counters.footerNav}.`,
    )
  } finally {
    if (typeof payload?.destroy === 'function') {
      await payload.destroy()
    }
  }
}
