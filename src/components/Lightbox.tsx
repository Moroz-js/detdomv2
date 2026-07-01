'use client'

import { useCallback, useEffect } from 'react'
import Image from 'next/image'

export type LightboxImage = { src: string; alt: string }

type Props = {
  images: LightboxImage[]
  index: number
  onClose: () => void
  onPrev: () => void
  onNext: () => void
}

export function Lightbox({ images, index, onClose, onPrev, onNext }: Props) {
  const current = images[index]
  const hasMany = images.length > 1

  useEffect(() => {
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [])

  const handleKey = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowLeft') onPrev()
      if (e.key === 'ArrowRight') onNext()
    },
    [onClose, onPrev, onNext],
  )

  useEffect(() => {
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [handleKey])

  if (!current) return null

  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center bg-stone-950/88 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal
      aria-label="Просмотр изображения"
      onClick={onClose}
    >
      {/* Закрыть */}
      <button
        type="button"
        aria-label="Закрыть"
        className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-xl text-white transition-colors hover:bg-white/20"
        onClick={onClose}
      >
        ✕
      </button>

      {/* Назад */}
      {hasMany && (
        <button
          type="button"
          aria-label="Предыдущее"
          className="absolute left-4 top-1/2 -translate-y-1/2 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-2xl text-white transition-colors hover:bg-white/20"
          onClick={(e) => { e.stopPropagation(); onPrev() }}
        >
          ‹
        </button>
      )}

      {/* Изображение */}
      <div
        className="relative flex max-h-[90vh] max-w-[90vw] items-center justify-center"
        onClick={(e) => e.stopPropagation()}
      >
        <Image
          src={current.src}
          alt={current.alt}
          width={1600}
          height={900}
          className="max-h-[90vh] max-w-[90vw] rounded-lg object-contain shadow-2xl"
          unoptimized
        />
      </div>

      {/* Вперёд */}
      {hasMany && (
        <button
          type="button"
          aria-label="Следующее"
          className="absolute right-4 top-1/2 -translate-y-1/2 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-2xl text-white transition-colors hover:bg-white/20"
          onClick={(e) => { e.stopPropagation(); onNext() }}
        >
          ›
        </button>
      )}

      {/* Счётчик */}
      {hasMany && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-black/40 px-3 py-1 text-sm text-white/80">
          {index + 1} / {images.length}
        </div>
      )}
    </div>
  )
}
