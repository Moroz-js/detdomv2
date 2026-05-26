import Image from 'next/image'
import Link from 'next/link'
import { RichText } from '@payloadcms/richtext-lexical/react'
import type { SerializedEditorState } from 'lexical'
import { getPayload } from 'payload'

import configPromise from '@payload-config'
import { FormTabsBlock, type FormType } from '@/components/FormTabsBlock'
import { ImageSlider, type SliderSlide } from '@/components/ImageSlider'
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

function pickStr(v: unknown): string | null {
  if (typeof v !== 'string') return null
  const trimmed = v.trim()
  return trimmed.length > 0 ? trimmed : null
}

/**
 * Достаёт src изображения по приоритету: imageUrl (text) > upload-поле (MediaRef).
 */
function resolveImageSrc(block: Record<string, unknown>, uploadField: string, urlField = 'imageUrl'): {
  src: string
  alt: string
} {
  const directUrl = pickStr(block[urlField])
  if (directUrl) {
    return {
      src: mediaSrc(directUrl),
      alt: pickStr(block.alt) || pickStr(block.caption) || '',
    }
  }
  const upload = block[uploadField] as MediaRef
  return {
    src: mediaSrc(upload?.url),
    alt: pickStr(upload?.alt) || pickStr(upload?.filename) || pickStr(block.alt) || '',
  }
}

function resolveFileHref(item: Record<string, unknown>): string {
  const direct = pickStr(item.fileUrl)
  if (direct) return mediaSrc(direct)
  const file = item.file as MediaRef
  return mediaSrc(file?.url)
}

function containerColumnsClass(columns: string) {
  switch (columns) {
    case '1':
      return 'grid grid-cols-1 gap-6'
    case '3':
      return 'grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3'
    case '4':
      return 'grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4'
    case '5':
      return 'grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-5'
    case '6':
      return 'grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6'
    default:
      return 'grid grid-cols-1 gap-6 md:grid-cols-2'
  }
}

async function fetchHomeSliderSlides() {
  const payload = await getPayload({ config: configPromise })
  const global = await payload.findGlobal({ slug: 'homeSlider', depth: 1 })
  const slides = Array.isArray(global?.slides) ? global.slides : []
  return slides.filter(isRecord)
}

async function fetchAchievements(year?: number | null) {
  const payload = await getPayload({ config: configPromise })
  const result = await payload.find({
    collection: 'achievements',
    depth: 1,
    limit: 1000,
    sort: 'order',
    ...(typeof year === 'number' ? { where: { year: { equals: year } } } : {}),
  })
  return result.docs.filter(isRecord)
}

function headingTextFromContentBlock(block: BlockRendererBlock): string | null {
  if (block.blockType !== 'content') return null
  const body = block.body
  if (!isRecord(body)) return null
  const root = body.root
  if (!isRecord(root)) return null
  const children = root.children
  if (!Array.isArray(children) || children.length !== 1) return null
  const node = children[0]
  if (!isRecord(node) || node.type !== 'heading') return null
  const tag = node.tag
  if (tag !== 'h2' && tag !== 'h3') return null
  const nodeChildren = node.children
  if (!Array.isArray(nodeChildren) || nodeChildren.length !== 1) return null
  const textNode = nodeChildren[0]
  if (!isRecord(textNode) || textNode.type !== 'text') return null
  return pickStr(textNode.text)
}

type RenderBlockOpts = {
  hideFileListTitle?: boolean
  pageSlug?: string
  /** Число колонок контейнера (0 — вне контейнера, на всю ширину) */
  containerColumns?: number
}

function parseSliderSlides(items: unknown[]): SliderSlide[] {
  const slides: SliderSlide[] = []
  for (let i = 0; i < items.length; i++) {
    const slide = items[i]
    if (!isRecord(slide)) continue
    const { src, alt } = resolveImageSrc(slide, 'image')
    if (!src) continue
    slides.push({
      src,
      alt: alt || pickStr(slide.title) || `Слайд ${i + 1}`,
      href: pickStr(slide.href),
    })
  }
  return slides
}

function parseFormTabs(block: BlockRendererBlock): FormType[] {
  const raw = block.tabs
  if (!Array.isArray(raw)) return ['help_request', 'want_to_help', 'feedback']
  const tabs: FormType[] = []
  for (const t of raw) {
    if (t === 'help_request' || t === 'want_to_help' || t === 'feedback') tabs.push(t)
  }
  return tabs.length ? tabs : ['feedback']
}

async function renderBlock(
  block: BlockRendererBlock,
  key: string,
  opts?: RenderBlockOpts,
): Promise<React.ReactNode> {
  switch (block.blockType) {
    case 'hero': {
      const { src, alt } = resolveImageSrc(block, 'image')
      return (
        <section key={key} className="space-y-4">
          <h1 className="text-3xl font-semibold tracking-tight text-stone-900 md:text-4xl">
            {String(block.heading ?? '')}
          </h1>
          {block.subtitle ? (
            <p className="max-w-3xl text-lg leading-relaxed text-stone-600">
              {String(block.subtitle)}
            </p>
          ) : null}
          {src ? (
            <Image
              alt={alt || String(block.heading ?? '')}
              className="h-auto w-full max-w-3xl rounded-xl border border-zinc-200 object-cover shadow-sm"
              height={420}
              src={src}
              unoptimized
              width={1280}
            />
          ) : null}
        </section>
      )
    }
    case 'banner': {
      const { src, alt } = resolveImageSrc(block, 'image')
      const href = pickStr(block.href)
      const inner = src ? (
        <Image
          alt={alt || 'Баннер'}
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
          className="flex h-full flex-col rounded-xl border border-stone-200/90 bg-white/95 p-6 shadow-[0_2px_16px_-4px_rgba(28,25,23,0.08)] backdrop-blur-sm"
        >
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-stone-900">{String(block.title ?? '')}</h3>
            {block.text ? <p className="text-sm leading-relaxed text-stone-600">{String(block.text)}</p> : null}
          </div>
          {block.buttonUrl && block.buttonLabel ? (
            <Link
              className={cn(
                'mt-4 inline-flex h-10 w-full items-center justify-center rounded-md bg-stone-900 px-4 text-sm font-medium text-white shadow-sm transition-colors hover:bg-stone-800',
              )}
              href={String(block.buttonUrl)}
            >
              {String(block.buttonLabel)}
            </Link>
          ) : null}
        </section>
      )
    case 'slider': {
      const raw = Array.isArray(block.slides) ? block.slides : []
      const slides = parseSliderSlides(raw)
      if (!slides.length) return null
      return (
        <section key={key} className="space-y-4">
          <ImageSlider
            slides={slides}
            slidesPerView={opts?.slidesPerView ?? 3}
            variant="card"
          />
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
      const { src, alt } = resolveImageSrc(block, 'media')
      return (
        <figure key={key} className="space-y-2">
          {src ? (
            <Image
              alt={alt || pickStr(block.caption) || 'Изображение'}
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
        <FormTabsBlock
          key={key}
          intro={block.intro ? String(block.intro) : null}
          pageSlug={opts?.pageSlug}
          privacyHref={String(block.privacyHref || '/privacy')}
          tabs={parseFormTabs(block)}
          title={String(block.title ?? 'Свяжитесь с нами')}
        />
      )
    case 'heading': {
      const anchorId = pickStr(block.anchorId)
      return (
        <h2
          key={key}
          {...(anchorId ? { id: anchorId } : {})}
          className="scroll-mt-24 text-2xl font-semibold tracking-tight text-stone-900"
        >
          {String(block.text ?? '')}
        </h2>
      )
    }
    case 'fileList': {
      const items = Array.isArray(block.items) ? block.items : []
      const sectionTitle = pickStr(block.sectionTitle)
      return (
        <section key={key} className="space-y-4">
          {sectionTitle && !opts?.hideFileListTitle ? (
            <h3 className="text-xl font-semibold text-stone-900">{sectionTitle}</h3>
          ) : null}
          <ul className="grid grid-cols-1 gap-3 lg:grid-cols-3">
            {items.map((item, i) => {
              if (!isRecord(item)) return null
              const href = resolveFileHref(item)
              const ext = pickStr(item.fileExt)?.toUpperCase() || null
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
                      target="_blank"
                    >
                      <span className="mt-0.5 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-stone-100 text-[10px] font-bold tracking-wider text-stone-700 transition-colors group-hover:bg-stone-200">
                        {ext ?? 'FILE'}
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
                      <span className="mt-0.5 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-stone-100 text-[10px] font-bold tracking-wider text-stone-700">
                        {ext ?? 'FILE'}
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
    case 'embed': {
      const html = pickStr(block.html)
      if (!html) return null
      return (
        <section
          key={key}
          className="overflow-hidden rounded-xl border border-stone-200 bg-white/95 p-2"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      )
    }
    case 'gallery': {
      const source = pickStr(block.source) ?? 'achievements'
      const title = pickStr(block.title)

      let images: Array<{ src: string; alt: string; caption?: string | null }> = []

      if (source === 'achievements') {
        const yearRaw = block.year
        const year = typeof yearRaw === 'number' ? yearRaw : null
        const docs = await fetchAchievements(year)
        images = docs.map((doc, i) => {
          const row = doc as unknown as Record<string, unknown>
          const { src, alt } = resolveImageSrc(row, 'image')
          const title = pickStr(row.title) || String((row.order as number | undefined) ?? i + 1)
          return { src, alt: alt || title, caption: title }
        })
      } else {
        const items = Array.isArray(block.items) ? block.items : []
        images = items.filter(isRecord).map((item) => {
          const { src, alt } = resolveImageSrc(item, 'image')
          return { src, alt, caption: pickStr(item.caption) }
        })
      }

      return (
        <section key={key} className="space-y-4">
          {title ? (
            <h2 className="text-2xl font-semibold tracking-tight text-stone-900">{title}</h2>
          ) : null}
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {images.map((img, i) =>
              img.src ? (
                <figure
                  key={`${key}-g-${i}`}
                  className="overflow-hidden rounded-lg border border-stone-200 bg-white shadow-sm"
                >
                  <Image
                    alt={img.alt || 'Изображение'}
                    className="aspect-[3/4] w-full object-contain"
                    height={400}
                    src={img.src}
                    unoptimized
                    width={300}
                  />
                  {img.caption && source !== 'achievements' ? (
                    <figcaption className="border-t border-stone-100 px-2 py-1 text-center text-xs text-stone-600">
                      {img.caption}
                    </figcaption>
                  ) : null}
                </figure>
              ) : null,
            )}
          </div>
        </section>
      )
    }
    case 'homeSlider': {
      const raw = await fetchHomeSliderSlides()
      const slides = parseSliderSlides(raw)
      if (!slides.length) return null
      return (
        <section key={key} className="space-y-4">
          <ImageSlider slides={slides} slidesPerView={3} variant="banner" />
        </section>
      )
    }
    case 'container': {
      const columns = String(block.columns ?? '2')
      const n = Math.min(6, Math.max(1, parseInt(columns, 10) || 2))
      const containerSlidesPerView: 1 | 3 = n <= 1 ? 3 : 1
      const column1 = normalizeBlocks(block.column1)
      const column2 = n >= 2 ? normalizeBlocks(block.column2) : []
      const column3 = n >= 3 ? normalizeBlocks(block.column3) : []
      const column4 = n >= 4 ? normalizeBlocks(block.column4) : []
      const column5 = n >= 5 ? normalizeBlocks(block.column5) : []
      const column6 = n >= 6 ? normalizeBlocks(block.column6) : []
      const columnBlocks = [column1, column2, column3, column4, column5, column6].filter(
        (list) => list.length > 0,
      )

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
          <div className={containerColumnsClass(String(n))}>
            {await Promise.all(
              columnBlocks.map(async (blocksInColumn, idx) => (
                <div
                  key={`${key}-col-${idx}`}
                  className="min-w-0 space-y-8 break-words [overflow-wrap:anywhere]"
                >
                  {await Promise.all(
                    blocksInColumn.map(async (innerBlock) => {
                      const innerKey =
                        innerBlock.id ??
                        `${key}-col-${idx}-${JSON.stringify(innerBlock).slice(0, 32)}`
                      return await renderBlock(innerBlock, String(innerKey), {
                        ...opts,
                        slidesPerView: containerSlidesPerView,
                      })
                    }),
                  )}
                </div>
              )),
            )}
          </div>
        </section>
      )
    }
    default:
      return null
  }
}

export async function BlockRenderer({
  blocks,
  pageSlug,
}: {
  blocks: BlockRendererBlock[] | null | undefined
  pageSlug?: string
}) {
  if (!blocks?.length) return null

  const normalized = normalizeBlocks(blocks)
  const rendered: React.ReactNode[] = []

  for (let i = 0; i < normalized.length; i++) {
    const block = normalized[i]
    const prev = i > 0 ? normalized[i - 1] : null
    const sectionTitle = pickStr(block.sectionTitle)
    const prevHeading =
      prev?.blockType === 'heading'
        ? pickStr(prev.text)
        : prev
          ? headingTextFromContentBlock(prev)
          : null
    const hideFileListTitle =
      block.blockType === 'fileList' &&
      Boolean(sectionTitle && prevHeading && sectionTitle === prevHeading)

    const key = block.id ?? JSON.stringify(block).slice(0, 40)
    rendered.push(
      await renderBlock(block, String(key), { hideFileListTitle, pageSlug }),
    )
  }

  return <div className="flex flex-col gap-12">{rendered}</div>
}
