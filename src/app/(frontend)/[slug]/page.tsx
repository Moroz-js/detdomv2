import { draftMode } from 'next/headers'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { BlockRenderer } from '@/components/BlockRenderer'
import { fetchPageBySlug } from '@/lib/fetchPage'

type Props = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const { isEnabled } = await draftMode()
  const page = await fetchPageBySlug(slug, { draft: isEnabled })
  if (!page?.title) return { title: 'Страница' }
  return { title: String(page.title) }
}

export default async function DynamicPage({ params }: Props) {
  const { slug } = await params
  const { isEnabled } = await draftMode()
  const page = await fetchPageBySlug(slug, { draft: isEnabled })

  if (!page) {
    notFound()
  }

  return (
    <article>
      <BlockRenderer blocks={page.blocks} />
    </article>
  )
}
