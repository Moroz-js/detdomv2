import { getPayload } from 'payload'

import configPromise from '@payload-config'

export async function fetchHeaderNav() {
  const payload = await getPayload({ config: configPromise })
  return payload.findGlobal({ slug: 'headerNav', depth: 0 })
}

export async function fetchFooterNav() {
  const payload = await getPayload({ config: configPromise })
  return payload.findGlobal({ slug: 'footerNav', depth: 0 })
}

export async function fetchFooterContent() {
  const payload = await getPayload({ config: configPromise })
  return payload.findGlobal({ slug: 'footerContent', depth: 0 })
}
