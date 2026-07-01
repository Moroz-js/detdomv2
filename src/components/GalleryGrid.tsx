'use client'

import { useState } from 'react'
import Image from 'next/image'

import { Lightbox, type LightboxImage } from './Lightbox'

type GalleryImage = LightboxImage & { caption?: string | null }

export function GalleryGrid({
  images,
  withCaptions = false,
}: {
  images: GalleryImage[]
  withCaptions?: boolean
}) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null)
  const visible = images.filter((img) => img.src)

  return (
    <>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {visible.map((img, i) => (
          <figure
            key={i}
            className="overflow-hidden rounded-lg border border-stone-200 bg-white shadow-sm"
          >
            <button
              type="button"
              className="block w-full cursor-zoom-in"
              onClick={() => setActiveIndex(i)}
              aria-label={`Открыть: ${img.alt || 'Изображение'}`}
            >
              <Image
                alt={img.alt || 'Изображение'}
                className="aspect-[3/4] w-full object-contain transition-opacity hover:opacity-90"
                height={400}
                src={img.src}
                unoptimized
                width={300}
              />
            </button>
            {withCaptions && img.caption ? (
              <figcaption className="border-t border-stone-100 px-2 py-1 text-center text-xs text-stone-600">
                {img.caption}
              </figcaption>
            ) : null}
          </figure>
        ))}
      </div>

      {activeIndex !== null && (
        <Lightbox
          images={visible}
          index={activeIndex}
          onClose={() => setActiveIndex(null)}
          onPrev={() => setActiveIndex((i) => ((i ?? 0) - 1 + visible.length) % visible.length)}
          onNext={() => setActiveIndex((i) => ((i ?? 0) + 1) % visible.length)}
        />
      )}
    </>
  )
}
