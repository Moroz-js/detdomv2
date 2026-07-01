'use client'

import { useState } from 'react'
import Image from 'next/image'

import { Lightbox, type LightboxImage } from './Lightbox'

type Props = {
  newsId: string | number
  newsTitle: string
  gallery: LightboxImage[]
}

export function NewsGallery({ newsId, newsTitle, gallery }: Props) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null)

  if (!gallery.length) return null

  const [cover, ...rest] = gallery

  return (
    <>
      <section className="space-y-4">
        {/* Обложка */}
        <button
          type="button"
          className="relative aspect-[16/9] w-full cursor-zoom-in overflow-hidden rounded-xl border border-stone-200 bg-stone-100 block"
          onClick={() => setActiveIndex(0)}
          aria-label="Открыть фото"
        >
          <Image src={cover.src} alt={cover.alt} fill className="object-cover" unoptimized />
        </button>

        {/* Остальные фото */}
        {rest.length ? (
          <ul className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {rest.map((item, idx) => (
              <li key={`${newsId}-img-${idx}`}>
                <button
                  type="button"
                  className="relative aspect-[4/3] w-full cursor-zoom-in overflow-hidden rounded-lg border border-stone-200 bg-stone-100 block"
                  onClick={() => setActiveIndex(idx + 1)}
                  aria-label={`Открыть фото ${idx + 2}`}
                >
                  <Image
                    src={item.src}
                    alt={item.alt || `${newsTitle} — фото ${idx + 2}`}
                    fill
                    className="object-cover transition-opacity hover:opacity-90"
                    unoptimized
                  />
                </button>
              </li>
            ))}
          </ul>
        ) : null}
      </section>

      {activeIndex !== null && (
        <Lightbox
          images={gallery}
          index={activeIndex}
          onClose={() => setActiveIndex(null)}
          onPrev={() => setActiveIndex((i) => ((i ?? 0) - 1 + gallery.length) % gallery.length)}
          onNext={() => setActiveIndex((i) => ((i ?? 0) + 1) % gallery.length)}
        />
      )}
    </>
  )
}
