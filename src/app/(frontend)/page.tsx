import { draftMode } from 'next/headers'

import { BlockRenderer } from '@/components/BlockRenderer'
import { fetchPageBySlug } from '@/lib/fetchPage'

export default async function HomePage() {
  const { isEnabled } = await draftMode()
  const page = await fetchPageBySlug('home', { draft: isEnabled })

  if (!page) {
    return (
      <div className="rounded-lg border border-zinc-200 bg-white p-8 shadow-sm">
        <p className="text-zinc-600">
          Запись страницы со slug <code className="font-mono">home</code> не найдена. Создайте и опубликуйте её в
          админке Payload.
        </p>
      </div>
    )
  }

  return (
    <article>
      <BlockRenderer blocks={page.blocks} pageSlug="home" />
    </article>
  )
}
