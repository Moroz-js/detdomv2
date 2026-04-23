import { getPayload } from 'payload'

import configPromise from '@payload-config'

const NEWS_PER_PAGE = 20

export async function fetchNewsPage(page: number, draft: boolean) {
  const safePage = Number.isFinite(page) && page > 0 ? Math.floor(page) : 1
  const payload = await getPayload({ config: configPromise })

  return payload.find({
    collection: 'news',
    depth: 2,
    draft,
    limit: NEWS_PER_PAGE,
    page: safePage,
    overrideAccess: draft,
    sort: '-publishedAt',
  })
}

export async function fetchNewsBySlug(slug: string, draft: boolean) {
  const payload = await getPayload({ config: configPromise })
  const result = await payload.find({
    collection: 'news',
    depth: 2,
    draft,
    limit: 1,
    overrideAccess: draft,
    where: {
      slug: {
        equals: slug,
      },
    },
  })
  return result.docs[0] ?? null
}

export { NEWS_PER_PAGE }
