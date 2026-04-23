import Image from 'next/image'
import Link from 'next/link'
import { RichText } from '@payloadcms/richtext-lexical/react'
import type { SerializedEditorState } from 'lexical'

import { mediaSrc } from '@/lib/media'
import { cn } from '@/lib/utils'

type MediaRef = {
  id?: string | number
  url?: string | null
  alt?: string | null
  filename?: string | null
  mimeType?: string | null
} | null

export type BlockRendererBlock = {
  id?: string | null
  blockType?: string | null
  [key: string]: unknown
}

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null
}

function normalizeBlocks(v: unknown): BlockRendererBlock[] {
  if (!Array.isArray(v)) return []
  return v.filter((item): item is BlockRendererBlock => isRecord(item))
}

function containerColumnsClass(columns: string) {
  if (columns === '1') return 'grid grid-cols-1 gap-6'
  if (columns === '3') return 'grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3'
  return 'grid grid-cols-1 gap-6 md:grid-cols-2'
}

function renderBlock(block: BlockRendererBlock, key: string): React.ReactNode {
  switch (block.blockType) {
    case 'hero':
      return (
        <section key={key} className="space-y-3">
          <h1 className="text-3xl font-semibold tracking-tight text-stone-900 md:text-4xl">
            {String(block.heading ?? '')}
          </h1>
          {block.subtitle ? (
            <p className="max-w-3xl text-lg leading-relaxed text-stone-600">
              {String(block.subtitle)}
            </p>
          ) : null}
        </section>
      )
    case 'banner': {
      const img = block.image as MediaRef
      const href = block.href ? String(block.href) : null
      const src = mediaSrc(img?.url)
      const inner =
        src ? (
          <Image
            alt={img?.alt || img?.filename || 'Баннер'}
            className="h-auto w-full max-w-2xl rounded-lg border border-zinc-200 object-contain"
            height={200}
            src={src}
            unoptimized
            width={800}
          />
        ) : null
      return (
        <section key={key} className="flex justify-center">
          {href ? (
            <Link className="inline-block transition-opacity hover:opacity-90" href={href}>
              {inner}
            </Link>
          ) : (
            inner
          )}
        </section>
      )
    }
    case 'cta':
      return (
        <section
          key={key}
          className="rounded-xl border border-stone-200/90 bg-white/95 p-8 shadow-[0_2px_16px_-4px_rgba(28,25,23,0.08)] backdrop-blur-sm md:flex md:items-center md:justify-between md:gap-8"
        >
          <div className="space-y-2">
            <h2 className="text-xl font-semibold text-stone-900">{String(block.title ?? '')}</h2>
            {block.text ? (
              <p className="text-stone-600">{String(block.text)}</p>
            ) : null}
          </div>
          {block.buttonUrl && block.buttonLabel ? (
            <Link
              className={cn(
                'mt-4 inline-flex h-10 shrink-0 items-center justify-center rounded-md bg-stone-900 px-5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-stone-800 md:mt-0',
              )}
              href={String(block.buttonUrl)}
            >
              {String(block.buttonLabel)}
            </Link>
          ) : null}
        </section>
      )
    case 'slider': {
      const slides = Array.isArray(block.slides) ? block.slides : []
      return (
        <section key={key} className="space-y-4">
          <div className="flex gap-4 overflow-x-auto pb-2">
            {slides.map((slide, i) => {
              if (!isRecord(slide)) return null
              const img = slide.image as MediaRef
              const src = mediaSrc(img?.url)
              const href = slide.href ? String(slide.href) : null
              const slideKey = `${key}-slide-${i}`
              const card = src ? (
                <Image
                  alt={img?.alt || `Слайд ${i + 1}`}
                  className="h-48 w-72 rounded-lg border border-zinc-200 object-cover shadow-sm"
                  height={192}
                  src={src}
                  unoptimized
                  width={288}
                />
              ) : null
              return (
                <div key={slideKey} className="shrink-0">
                  {href ? (
                    <Link className="block" href={href}>
                      {card}
                    </Link>
                  ) : (
                    card
                  )}
                </div>
              )
            })}
          </div>
        </section>
      )
    }
    case 'content': {
      const body = block.body
      if (!body || !isRecord(body)) return <div key={key} />
      return (
        <section
          key={key}
          className="prose prose-stone max-w-none prose-headings:text-stone-900 prose-p:text-stone-700 prose-a:text-stone-900"
        >
          <RichText data={body as unknown as SerializedEditorState} />
        </section>
      )
    }
    case 'image': {
      const img = block.media as MediaRef
      const src = mediaSrc(img?.url)
      return (
        <figure key={key} className="space-y-2">
          {src ? (
            <Image
              alt={img?.alt || 'Изображение'}
              className="max-h-[480px] w-auto max-w-full rounded-lg border border-zinc-200 object-contain shadow-sm"
              height={480}
              src={src}
              unoptimized
              width={800}
            />
          ) : null}
          {block.caption ? (
            <figcaption className="text-sm text-zinc-600">{String(block.caption)}</figcaption>
          ) : null}
        </figure>
      )
    }
    case 'formTabs':
      return (
        <section
          key={key}
          className="rounded-xl border border-dashed border-stone-300 bg-[#f6f5f1]/90 p-8 text-center text-stone-600"
        >
          <h2 className="mb-2 text-lg font-semibold text-stone-900">
            {String(block.title ?? '')}
          </h2>
          {block.intro ? <p className="mb-4 text-left text-sm">{String(block.intro)}</p> : null}
          <p className="text-sm">
            Отправка форм (SMTP) — следующий этап по плану. Ссылка на политику:{' '}
            <Link className="font-medium text-stone-900 underline" href={String(block.privacyHref || '/privacy')}>
              {String(block.privacyHref || '/privacy')}
            </Link>
          </p>
        </section>
      )
    case 'heading':
      return (
        <h2 key={key} className="text-2xl font-semibold tracking-tight text-stone-900">
          {String(block.text ?? '')}
        </h2>
      )
    case 'fileList': {
      const items = Array.isArray(block.items) ? block.items : []
      return (
        <section key={key} className="space-y-4">
          <h3 className="text-xl font-semibold text-stone-900">
            {String(block.sectionTitle ?? '')}
          </h3>
          <ul className="grid grid-cols-1 gap-3 lg:grid-cols-3">
            {items.map((item, i) => {
              if (!isRecord(item)) return null
              const file = item.file as MediaRef
              const href = mediaSrc(file?.url)
              return (
                <li
                  key={`${key}-f-${i}`}
                  className="group overflow-hidden rounded-xl border border-stone-200 bg-white/95 shadow-[0_2px_14px_-6px_rgba(28,25,23,0.12)] transition-all hover:-translate-y-0.5 hover:border-stone-300 hover:shadow-[0_8px_24px_-12px_rgba(28,25,23,0.2)]"
                >
                  {href ? (
                    <a
                      className="flex items-start gap-3 p-4"
                      download
                      href={href}
                      rel="noopener noreferrer"
                    >
                      <span className="mt-0.5 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-stone-100 text-stone-700 transition-colors group-hover:bg-stone-200">
                        <svg
                          aria-hidden="true"
                          className="h-5 w-5"
                          fill="none"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M3.75 8.25A2.25 2.25 0 0 1 6 6h4.28c.54 0 1.06.2 1.46.57l1.15 1.06c.4.37.92.57 1.46.57H18A2.25 2.25 0 0 1 20.25 10.5v6A2.25 2.25 0 0 1 18 18.75H6a2.25 2.25 0 0 1-2.25-2.25v-8.25Z"
                            stroke="currentColor"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="1.5"
                          />
                        </svg>
                      </span>
                      <span className="min-w-0 space-y-1">
                        <span className="block truncate text-sm font-semibold text-stone-900">
                          {String(item.title ?? 'Скачать файл')}
                        </span>
                        <span className="inline-flex text-xs font-medium text-stone-700 transition-colors group-hover:text-stone-900">
                          Скачать
                        </span>
                      </span>
                    </a>
                  ) : (
                    <div className="flex items-start gap-3 p-4 opacity-80">
                      <span className="mt-0.5 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-stone-100 text-stone-700">
                        <svg
                          aria-hidden="true"
                          className="h-5 w-5"
                          fill="none"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M3.75 8.25A2.25 2.25 0 0 1 6 6h4.28c.54 0 1.06.2 1.46.57l1.15 1.06c.4.37.92.57 1.46.57H18A2.25 2.25 0 0 1 20.25 10.5v6A2.25 2.25 0 0 1 18 18.75H6a2.25 2.25 0 0 1-2.25-2.25v-8.25Z"
                            stroke="currentColor"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="1.5"
                          />
                        </svg>
                      </span>
                      <span className="min-w-0 space-y-1">
                        <span className="block truncate text-sm font-semibold text-stone-900">
                          {String(item.title ?? '')}
                        </span>
                        <span className="block text-xs text-stone-500">Файл недоступен</span>
                      </span>
                    </div>
                  )}
                </li>
              )
            })}
          </ul>
        </section>
      )
    }
    case 'container': {
      const columns = String(block.columns ?? '2')
      const column1 = normalizeBlocks(block.column1)
      const column2 = columns === '1' ? [] : normalizeBlocks(block.column2)
      const column3 = columns === '3' ? normalizeBlocks(block.column3) : []
      const columnBlocks = [column1, column2, column3].filter((list) => list.length > 0)

      if (!columnBlocks.length) return null

      return (
        <section key={key} className="space-y-4">
          {block.title ? (
            <div className="space-y-1.5">
              <h2 className="text-2xl font-semibold tracking-tight text-stone-900">
                {String(block.title)}
              </h2>
              {block.subtitle ? <p className="text-stone-600">{String(block.subtitle)}</p> : null}
            </div>
          ) : null}
          <div className={containerColumnsClass(columns)}>
            {columnBlocks.map((blocksInColumn, idx) => (
              <div key={`${key}-col-${idx}`} className="min-w-0 space-y-8 break-words [overflow-wrap:anywhere]">
                {blocksInColumn.map((innerBlock) => {
                  const innerKey = innerBlock.id ?? `${key}-col-${idx}-${JSON.stringify(innerBlock).slice(0, 32)}`
                  return renderBlock(innerBlock, String(innerKey))
                })}
              </div>
            ))}
          </div>
        </section>
      )
    }
    default:
      return null
  }
}

export function BlockRenderer({ blocks }: { blocks: BlockRendererBlock[] | null | undefined }) {
  if (!blocks?.length) return null

  return (
    <div className="flex flex-col gap-12">
      {blocks.map((block) => {
        const key = block.id ?? JSON.stringify(block).slice(0, 40)
        return renderBlock(block, String(key))
      })}
    </div>
  )
}
