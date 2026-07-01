'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useCallback, useEffect, useMemo, useState } from 'react'

import { cn } from '@/lib/utils'

export type SliderSlide = {
  src: string
  alt: string
  href?: string | null
}

type ImageSliderProps = {
  slides: SliderSlide[]
  /** card — блоки страниц; banner — главный слайдер */
  variant?: 'card' | 'banner'
  slidesPerView?: 1 | 3
}

function ChevronIcon({ direction }: { direction: 'left' | 'right' }) {
  return (
    <svg
      className="h-5 w-5"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      {direction === 'left' ? <path d="M15 18l-6-6 6-6" /> : <path d="M9 18l6-6-6-6" />}
    </svg>
  )
}

function CloseIcon() {
  return (
    <svg
      className="h-5 w-5"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      aria-hidden
    >
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  )
}

const imageSizes = {
  card: {
    single: 'max-h-[min(70vh,28rem)] w-full object-contain',
    multi: 'h-36 w-full object-contain sm:h-40',
    width: 960,
    height: 540,
  },
  banner: {
    single: 'max-h-[min(75vh,32rem)] w-full object-contain',
    multi: 'h-40 w-full object-contain sm:h-48',
    width: 1200,
    height: 640,
  },
} as const

const MD_MEDIA = '(min-width: 768px)'

export function ImageSlider({ slides, variant = 'card', slidesPerView = 3 }: ImageSliderProps) {
  const [isWide, setIsWide] = useState(false)
  const [page, setPage] = useState(0)
  const [zoomIndex, setZoomIndex] = useState(0)
  const [zoomOpen, setZoomOpen] = useState(false)
  const count = slides.length

  /** На телефоне всегда 1; тройной режим — с md и шире */
  const perView = slidesPerView === 1 ? 1 : isWide ? 3 : 1

  const pageCount = Math.max(1, Math.ceil(count / perView))

  useEffect(() => {
    const mq = window.matchMedia(MD_MEDIA)
    const update = () => setIsWide(mq.matches)
    update()
    mq.addEventListener('change', update)
    return () => mq.removeEventListener('change', update)
  }, [])

  useEffect(() => {
    setPage(0)
  }, [count, perView])

  const visibleSlides = useMemo(() => {
    const start = page * perView
    const items: Array<{ slide: SliderSlide; index: number }> = []
    for (let i = 0; i < perView; i++) {
      const index = start + i
      if (index >= count) break
      items.push({ slide: slides[index]!, index })
    }
    return items
  }, [page, perView, slides, count])

  const goPage = useCallback(
    (delta: number) => {
      if (pageCount < 2) return
      setPage((p) => (p + delta + pageCount) % pageCount)
    },
    [pageCount],
  )

  const goZoom = useCallback(
    (delta: number) => {
      if (!count) return
      setZoomIndex((i) => (i + delta + count) % count)
    },
    [count],
  )

  useEffect(() => {
    if (!zoomOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setZoomOpen(false)
      if (e.key === 'ArrowLeft') goZoom(-1)
      if (e.key === 'ArrowRight') goZoom(1)
    }
    document.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
    }
  }, [zoomOpen, goZoom])

  if (!count) return null

  const sizes = imageSizes[variant]
  const zoomSlide = slides[zoomIndex]!

  const navButtonClass =
    'inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-stone-300 bg-white/95 text-stone-800 shadow-sm transition-colors hover:border-stone-400 hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stone-800 disabled:pointer-events-none disabled:opacity-40'

  const lightboxNavButtonClass =
    'inline-flex h-11 w-11 items-center justify-center rounded-md border border-white/50 bg-stone-900 text-white shadow-lg transition-colors hover:border-white hover:bg-stone-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white'

  const slideButtonClass =
    'group relative flex w-full min-h-[8rem] cursor-zoom-in items-center justify-center overflow-hidden rounded-xl border border-stone-200/90 bg-stone-100/80 p-2 shadow-sm transition-shadow hover:shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stone-800'

  const counterLabel =
    perView === 1
      ? `${page + 1} / ${count}`
      : `${page + 1} / ${pageCount}`

  return (
    <>
      <div className="flex items-center gap-2 sm:gap-3">
        <button
          type="button"
          className={navButtonClass}
          aria-label="Предыдущий слайд"
          disabled={pageCount < 2}
          onClick={() => goPage(-1)}
        >
          <ChevronIcon direction="left" />
        </button>

        <div className="min-w-0 flex-1">
          <div
            className={cn(perView === 3 ? 'grid gap-2' : '')}
            style={
              perView === 3
                ? {
                    gridTemplateColumns: `repeat(${visibleSlides.length}, minmax(0, 1fr))`,
                  }
                : undefined
            }
          >
            {visibleSlides.map(({ slide, index }) => (
              <div key={`${slide.src}-${index}`} className="min-w-0">
                <button
                  type="button"
                  className={slideButtonClass}
                  onClick={() => {
                    setZoomIndex(index)
                    setZoomOpen(true)
                  }}
                  aria-label={`Увеличить: ${slide.alt}`}
                >
                  <Image
                    alt={slide.alt}
                    className={cn(
                      perView === 1 ? sizes.single : sizes.multi,
                      'rounded-lg',
                    )}
                    height={sizes.height}
                    src={slide.src}
                    unoptimized
                    width={sizes.width}
                    priority={page === 0 && index === 0}
                  />
                </button>
                {slide.href ? (
                  <Link
                    className="mt-1 block text-center text-xs font-medium text-stone-800 underline-offset-2 hover:underline sm:text-sm"
                    href={slide.href}
                  >
                    Подробнее
                  </Link>
                ) : null}
              </div>
            ))}
          </div>

          {count > 1 ? (
            <p className="mt-2 text-center text-xs text-stone-500 tabular-nums">{counterLabel}</p>
          ) : null}
        </div>

        <button
          type="button"
          className={navButtonClass}
          aria-label="Следующий слайд"
          disabled={pageCount < 2}
          onClick={() => goPage(1)}
        >
          <ChevronIcon direction="right" />
        </button>
      </div>

      {zoomOpen ? (
        <div
          className="fixed inset-0 z-[80] flex items-center justify-center bg-stone-950/85 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal
          aria-label="Увеличенное изображение"
          onClick={(e) => { if (e.target === e.currentTarget) setZoomOpen(false) }}
        >
          <button
            type="button"
            className={cn(lightboxNavButtonClass, 'absolute right-4 top-4')}
            aria-label="Закрыть"
            onClick={() => setZoomOpen(false)}
          >
            <CloseIcon />
          </button>

          {count > 1 ? (
            <>
              <button
                type="button"
                className={cn(
                  lightboxNavButtonClass,
                  'absolute left-2 top-1/2 z-10 -translate-y-1/2 sm:left-4',
                )}
                aria-label="Предыдущее"
                onClick={(e) => {
                  e.stopPropagation()
                  goZoom(-1)
                }}
              >
                <ChevronIcon direction="left" />
              </button>
              <button
                type="button"
                className={cn(
                  lightboxNavButtonClass,
                  'absolute right-2 top-1/2 z-10 -translate-y-1/2 sm:right-4',
                )}
                aria-label="Следующее"
                onClick={(e) => {
                  e.stopPropagation()
                  goZoom(1)
                }}
              >
                <ChevronIcon direction="right" />
              </button>
            </>
          ) : null}

          <div
            className="relative max-h-[90vh] max-w-[min(100%,72rem)]"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              alt={zoomSlide.alt}
              className="max-h-[90vh] w-auto max-w-full object-contain"
              height={1200}
              src={zoomSlide.src}
              unoptimized
              width={1600}
            />
            {count > 1 ? (
              <p className="mt-3 text-center text-sm text-white/80 tabular-nums">
                {zoomIndex + 1} / {count}
              </p>
            ) : null}
          </div>
        </div>
      ) : null}
    </>
  )
}
