import { draftMode } from 'next/headers'

import { BlockRenderer } from '@/components/BlockRenderer'
import { fetchPageBySlug } from '@/lib/fetchPage'

export default async function DocumentsPage() {
  const { isEnabled } = await draftMode()
  const page = await fetchPageBySlug('documents', { draft: isEnabled })

  if (!page) {
    return (
      <div className="rounded-lg border border-zinc-200 bg-white p-8 shadow-sm">
        <p className="text-zinc-600">
          Страница <code className="font-mono">documents</code> не найдена. Добавьте её в коллекции Pages или
          запустите сид.
        </p>
      </div>
    )
  }

  return (
    <article>
      <BlockRenderer blocks={page.blocks} />
    </article>
  )
}
