'use client'

import { useState } from 'react'
import Image from 'next/image'

import { Lightbox } from './Lightbox'
import { cn } from '@/lib/utils'

type Props = {
  src: string
  alt: string
  caption?: string | null
  widthClass?: string
  maxHeightClass?: string
}

export function ImageWithLightbox({ src, alt, caption, widthClass, maxHeightClass }: Props) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <figure className={cn('space-y-2', widthClass)}>
        <button
          type="button"
          className="block cursor-zoom-in"
          onClick={() => setOpen(true)}
          aria-label={`Открыть: ${alt || 'Изображение'}`}
        >
          <Image
            alt={alt || caption || 'Изображение'}
            className={cn(
              'rounded-lg border border-zinc-200 object-contain shadow-sm transition-opacity hover:opacity-90',
              maxHeightClass || 'max-h-[480px]',
              'w-auto max-w-full',
            )}
            height={800}
            src={src}
            unoptimized
            width={1200}
          />
        </button>
        {caption ? (
          <figcaption className="text-sm text-zinc-600">{caption}</figcaption>
        ) : null}
      </figure>

      {open && (
        <Lightbox
          images={[{ src, alt: alt || caption || '' }]}
          index={0}
          onClose={() => setOpen(false)}
          onPrev={() => {}}
          onNext={() => {}}
        />
      )}
    </>
  )
}
