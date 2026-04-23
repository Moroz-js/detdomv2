import { getPayload } from 'payload'

import configPromise from '@payload-config'

export async function fetchPageBySlug(slug: string, { draft }: { draft: boolean }) {
  const payload = await getPayload({ config: configPromise })
  const result = await payload.find({
    collection: 'pages',
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
