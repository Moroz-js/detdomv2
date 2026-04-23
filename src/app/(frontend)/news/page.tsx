import Image from 'next/image'
import Link from 'next/link'
import { draftMode } from 'next/headers'
import type { Metadata } from 'next'

import { NEWS_PER_PAGE, fetchNewsPage } from '@/lib/fetchNews'
import { mediaSrc } from '@/lib/media'

type SearchParams = Promise<{ page?: string }>

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

export const metadata: Metadata = {
  title: 'Новости',
}

export default async function NewsListPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams
  const currentPage = Math.max(1, Number.parseInt(params.page || '1', 10) || 1)
  const { isEnabled } = await draftMode()
  const result = await fetchNewsPage(currentPage, isEnabled)
  const pageNumber = result.page ?? 1
  const totalPages = result.totalPages ?? 1

  return (
    <article className="space-y-8">
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight text-stone-900">Новости</h1>
        <p className="text-stone-600">
          Актуальные события и мероприятия центра
        </p>
      </header>

      {!result.docs.length ? (
        <div className="rounded-lg border border-stone-200 bg-white p-6 text-stone-600 shadow-sm">
          Новостей пока нет.
        </div>
      ) : (
        <ul className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {result.docs.map((item) => {
            const cover = item.gallery?.[0]?.image as NewsImage
            const src = mediaSrc(cover?.url)
            return (
              <li key={String(item.id)}>
                <Link
                  href={`/news/${item.slug}`}
                  className="group block overflow-hidden rounded-xl border border-stone-200 bg-white shadow-[0_2px_14px_-6px_rgba(28,25,23,0.12)] transition-all hover:-translate-y-0.5 hover:border-stone-300 hover:shadow-[0_8px_24px_-12px_rgba(28,25,23,0.2)]"
                >
                  <div className="relative aspect-[4/3] w-full bg-stone-100">
                    {src ? (
                      <Image
                        src={src}
                        alt={cover?.alt || item.title}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    ) : null}
                  </div>
                  <div className="space-y-2 p-4">
                    <p className="text-xs font-medium uppercase tracking-wide text-stone-500">
                      {toDateLabel(item.publishedAt)}
                    </p>
                    <h2 className="line-clamp-3 text-base font-semibold text-stone-900 group-hover:text-stone-700">
                      {item.title}
                    </h2>
                    <span className="inline-flex text-sm font-medium text-stone-700">Открыть новость</span>
                  </div>
                </Link>
              </li>
            )
          })}
        </ul>
      )}

      {totalPages > 1 ? (
        <nav className="flex items-center justify-center gap-2 pt-2" aria-label="Пагинация новостей">
          <Link
            href={result.hasPrevPage ? `/news?page=${pageNumber - 1}` : '#'}
            aria-disabled={!result.hasPrevPage}
            className="inline-flex h-10 items-center rounded-md border border-stone-300 px-4 text-sm font-medium text-stone-800 transition-colors hover:bg-stone-100 aria-disabled:pointer-events-none aria-disabled:opacity-50"
          >
            Назад
          </Link>
          <span className="text-sm text-stone-600">
            Страница {pageNumber} из {totalPages}
          </span>
          <Link
            href={result.hasNextPage ? `/news?page=${pageNumber + 1}` : '#'}
            aria-disabled={!result.hasNextPage}
            className="inline-flex h-10 items-center rounded-md border border-stone-300 px-4 text-sm font-medium text-stone-800 transition-colors hover:bg-stone-100 aria-disabled:pointer-events-none aria-disabled:opacity-50"
          >
            Вперёд
          </Link>
        </nav>
      ) : null}
    </article>
  )
}
