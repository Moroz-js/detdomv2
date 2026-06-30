/* eslint-disable no-console */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { getPayload, type SanitizedConfig } from 'payload'

import type { News } from '../payload-types.ts'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const PARSED = path.resolve(__dirname, 'parsed')

type Json = Record<string, unknown>

function readJson<T = unknown>(rel: string): T {
  return JSON.parse(fs.readFileSync(path.join(PARSED, rel), 'utf8')) as T
}

type NewsDoc = {
  title: string
  slug: string
  publishedAt: string
  excerpt: string | null
  thumbnailUrl: string | null
  galleryUrls: Array<{ url: string; alt?: string }>
  content: Json
}

export async function script(config: Promise<SanitizedConfig> | SanitizedConfig): Promise<void> {
  const payload = await getPayload({ config })
  const allowUpdate = process.argv.includes('--update')

  try {
    let created = 0
    let updated = 0
    let skipped = 0

    console.log('Импорт новостей…')
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
          if (!allowUpdate) {
            skipped++
            console.log(`  ⊘ ${item.slug} (уже есть)`)
            continue
          }

          await payload.update({
            collection: 'news',
            id: docs[0].id,
            data: {
              ...createData,
              slug: undefined,
            },
            overrideAccess: true,
          })
          updated++
          console.log(`  ↻ ${item.slug}`)
          continue
        }

        await payload.create({
          collection: 'news',
          data: createData,
          overrideAccess: true,
        })
        created++
        console.log(`  + ${item.slug}`)
      } catch (err) {
        console.error(`  ✗ news/${item.slug}:`, err instanceof Error ? err.message : err)
        throw err
      }
    }

    console.log(
      `\nГотово: ${news.length} в файле, создано: ${created}, обновлено: ${updated}, пропущено: ${skipped}.`,
    )
  } finally {
    if (typeof payload?.destroy === 'function') {
      await payload.destroy()
    }
  }
}

