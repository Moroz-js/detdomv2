/**
 * Шорткаты для генерации Payload-блоков из страниц-сборщиков.
 * Используют единые имена полей, согласованные со схемой src/blocks/pageBlocks.ts.
 */

import { richText, lexicalRoot, paragraph, heading, bullet, text, link } from './_lexical.mjs'

export const lex = { richText, lexicalRoot, paragraph, heading, bullet, text, link }

export function hero({ heading, subtitle, imageUrl, alt } = {}) {
  return {
    blockType: 'hero',
    heading,
    subtitle: subtitle ?? null,
    imageUrl: imageUrl ?? null,
    alt: alt ?? null,
  }
}

export function banner({ imageUrl, href, alt } = {}) {
  return {
    blockType: 'banner',
    imageUrl: imageUrl ?? null,
    href: href ?? null,
    alt: alt ?? null,
  }
}

export function cta({ title, text, buttonLabel, buttonUrl } = {}) {
  return {
    blockType: 'cta',
    title,
    text: text ?? null,
    buttonLabel: buttonLabel ?? null,
    buttonUrl: buttonUrl ?? null,
  }
}

export function slider(slides) {
  return {
    blockType: 'slider',
    slides: (slides ?? []).map((s) => ({
      imageUrl: s.imageUrl ?? null,
      alt: s.alt ?? null,
      href: s.href ?? null,
    })),
  }
}

export function image({ imageUrl, alt, caption } = {}) {
  return {
    blockType: 'image',
    imageUrl: imageUrl ?? null,
    alt: alt ?? null,
    caption: caption ?? null,
  }
}

/** content из массива parts: строки → параграфы, объекты → специальные узлы (см. richText). */
export function content(parts) {
  return {
    blockType: 'content',
    body: richText(parts),
  }
}

export function contentRaw(editorState) {
  return { blockType: 'content', body: editorState }
}

export function formTabs({ title = 'Свяжитесь с нами', intro = null, tabs, privacyHref = '/privacy' } = {}) {
  return {
    blockType: 'formTabs',
    title,
    intro,
    tabs: tabs ?? ['help_request', 'want_to_help', 'feedback'],
    privacyHref,
  }
}

export function h2(text, anchorId) {
  return {
    blockType: 'heading',
    text,
    anchorId: anchorId ?? null,
  }
}

export function fileList(sectionTitle, items) {
  return {
    blockType: 'fileList',
    sectionTitle,
    items: (items ?? []).map((it) => ({
      title: it.title,
      fileUrl: it.fileUrl ?? null,
      fileExt: it.fileExt ?? 'pdf',
    })),
  }
}

export function embed(html, title = null) {
  return { blockType: 'embed', title, html }
}

export function gallery({ title = null, source = 'achievements', year = null, items = null } = {}) {
  return {
    blockType: 'gallery',
    title,
    source,
    year,
    items: Array.isArray(items) ? items : [],
  }
}

export function homeSlider(note = null) {
  return { blockType: 'homeSlider', note }
}

export function container({ title = null, subtitle = null, columns, columnsBlocks }) {
  const cols = String(columns)
  const block = { blockType: 'container', title, subtitle, columns: cols }
  for (let i = 0; i < 6; i++) {
    block[`column${i + 1}`] = Array.isArray(columnsBlocks[i]) ? columnsBlocks[i] : []
  }
  return block
}
