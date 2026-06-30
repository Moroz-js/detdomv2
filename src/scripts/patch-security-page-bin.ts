/* eslint-disable no-console */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { getPayload, type SanitizedConfig } from 'payload'

import type { Page } from '../payload-types.ts'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const PAGE_JSON = path.join(__dirname, 'parsed', 'pages', 'security.json')

export async function script(config: Promise<SanitizedConfig> | SanitizedConfig): Promise<void> {
  const payload = await getPayload({ config })
  const doc = JSON.parse(fs.readFileSync(PAGE_JSON, 'utf8')) as {
    title: string
    slug: string
    blocks: unknown[]
  }

  try {
    const { docs } = await payload.find({
      collection: 'pages',
      where: { slug: { equals: 'security' } },
      limit: 1,
      depth: 0,
      overrideAccess: true,
    })

    if (!docs[0]) {
      console.error('Страница security не найдена в БД')
      process.exit(1)
    }

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

    console.log(`Страница /security обновлена (id=${docs[0].id})`)
  } finally {
    if (typeof payload?.destroy === 'function') {
      await payload.destroy()
    }
  }
}
