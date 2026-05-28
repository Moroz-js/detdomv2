import { getPayload } from 'payload'
import { unstable_noStore as noStore } from 'next/cache'

import configPromise from '@payload-config'

export async function fetchHeaderNav() {
  noStore()
  const payload = await getPayload({ config: configPromise })
  return payload.findGlobal({ slug: 'headerNav', depth: 0 })
}

export async function fetchFooterNav() {
  noStore()
  const payload = await getPayload({ config: configPromise })
  return payload.findGlobal({ slug: 'footerNav', depth: 0 })
}

export async function fetchFooterContent() {
  noStore()
  const payload = await getPayload({ config: configPromise })
  return payload.findGlobal({ slug: 'footerContent', depth: 0 })
}
