import Image from 'next/image'
import { RichText } from '@payloadcms/richtext-lexical/react'
import type { Metadata } from 'next'
import { draftMode } from 'next/headers'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { SerializedEditorState } from 'lexical'

import { fetchNewsBySlug } from '@/lib/fetchNews'
import { mediaSrc } from '@/lib/media'

type Props = { params: Promise<{ slug: string }> }

type NewsImage = {
  url?: string | null
  alt?: string | null
} | null

function toDateLabel(value: string | null | undefined) {
  if (!value) return 'Без даты'
  const dt = new Date(value)
  if (Number.isNaN(dt.getTime())) return 'Без даты'
  return new Intl.DateTimeFormat('ru-RU', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(dt)
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const { isEnabled } = await draftMode()
  const news = await fetchNewsBySlug(slug, isEnabled)
  if (!news) return { title: 'Новость' }
  return { title: news.title }
}

export default async function NewsItemPage({ params }: Props) {
  const { slug } = await params
  const { isEnabled } = await draftMode()
  const news = await fetchNewsBySlug(slug, isEnabled)

  if (!news) notFound()

  return (
    <article className="space-y-8">
      <div className="space-y-3">
        <Link href="/news" className="inline-flex text-sm font-medium text-stone-700 hover:text-stone-900">
          ← Ко всем новостям
        </Link>
        <p className="text-sm font-medium uppercase tracking-wide text-stone-500">{toDateLabel(news.publishedAt)}</p>
        <h1 className="text-3xl font-semibold tracking-tight text-stone-900 md:text-4xl">{news.title}</h1>
      </div>

      {news.gallery?.length ? (
        <section className="space-y-4">
          {(() => {
            const cover = news.gallery?.[0]?.image as NewsImage
            const src = mediaSrc(cover?.url)
            if (!src) return null
            return (
              <div className="relative aspect-[16/9] w-full overflow-hidden rounded-xl border border-stone-200 bg-stone-100">
                <Image src={src} alt={cover?.alt || news.title} fill className="object-cover" unoptimized />
              </div>
            )
          })()}
          {news.gallery.length > 1 ? (
            <ul className="grid grid-cols-2 gap-3 md:grid-cols-4">
              {news.gallery.slice(1).map((item, idx) => {
                const img = item?.image as NewsImage
                const src = mediaSrc(img?.url)
                if (!src) return null
                return (
                  <li key={`${news.id}-img-${idx}`} className="relative aspect-[4/3] overflow-hidden rounded-lg border border-stone-200 bg-stone-100">
                    <Image
                      src={src}
                      alt={img?.alt || `${news.title} — фото ${idx + 2}`}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  </li>
                )
              })}
            </ul>
          ) : null}
        </section>
      ) : null}

      {news.content ? (
        <section className="prose prose-stone max-w-none prose-headings:text-stone-900 prose-p:text-stone-700 prose-a:text-stone-900">
          <RichText data={news.content as unknown as SerializedEditorState} />
        </section>
      ) : null}
    </article>
  )
}
