/**
 * Хелперы для генерации Lexical SerializedEditorState — формата, который
 * Payload хранит в полях type:'richText' (например, ContentBlock.body, News.content).
 *
 * Это минимальный, валидный набор узлов: paragraph, heading h2/h3, list, link, text.
 * Достаточно для того, чтобы парсеры PHP/XML формировали блоки content.
 */

let _gid = 1
function gid() {
  return _gid++
}

/** @typedef {{ type: string; [k: string]: any }} LNode */

/** Создать корневой EditorState из массива blocks. */
export function lexicalRoot(children) {
  return {
    root: {
      type: 'root',
      format: '',
      indent: 0,
      version: 1,
      direction: 'ltr',
      children: children ?? [],
    },
  }
}

/** Текстовый узел. format: 1 = bold, 2 = italic. */
export function text(value, opts = {}) {
  return {
    type: 'text',
    text: String(value ?? ''),
    detail: 0,
    format: opts.bold ? 1 : opts.italic ? 2 : 0,
    mode: 'normal',
    style: '',
    version: 1,
  }
}

/** Линк-узел (внутренний или внешний). */
export function link(url, children, opts = {}) {
  return {
    type: 'link',
    version: 3,
    fields: {
      url: String(url ?? '#'),
      newTab: Boolean(opts.newTab),
      linkType: 'custom',
    },
    children: Array.isArray(children) ? children : [text(String(children ?? ''))],
    direction: 'ltr',
    format: '',
    indent: 0,
  }
}

/** Параграф. children — массив text/link/inline узлов. Принимает также строку. */
export function paragraph(children) {
  if (typeof children === 'string') children = [text(children)]
  return {
    type: 'paragraph',
    version: 1,
    direction: 'ltr',
    format: '',
    indent: 0,
    textFormat: 0,
    children: Array.isArray(children) ? children : [],
  }
}

/** Заголовок H2..H4. tag = 'h2'|'h3'|'h4'. */
export function heading(tag, children) {
  if (typeof children === 'string') children = [text(children)]
  return {
    type: 'heading',
    tag,
    version: 1,
    direction: 'ltr',
    format: '',
    indent: 0,
    children: Array.isArray(children) ? children : [],
  }
}

/** Маркированный список из массива строк или массивов inline-узлов. */
export function bullet(items) {
  return {
    type: 'list',
    listType: 'bullet',
    tag: 'ul',
    start: 1,
    version: 1,
    direction: 'ltr',
    format: '',
    indent: 0,
    children: items.map((item, i) => listItem(item, i + 1)),
  }
}

/** Нумерованный список. */
export function ordered(items) {
  return {
    type: 'list',
    listType: 'number',
    tag: 'ol',
    start: 1,
    version: 1,
    direction: 'ltr',
    format: '',
    indent: 0,
    children: items.map((item, i) => listItem(item, i + 1)),
  }
}

function listItem(item, value) {
  let kids
  if (typeof item === 'string') kids = [text(item)]
  else if (Array.isArray(item)) kids = item
  else kids = [item]
  return {
    type: 'listitem',
    version: 1,
    value,
    direction: 'ltr',
    format: '',
    indent: 0,
    children: kids,
  }
}

/**
 * Быстрый конструктор richText body из массива строк (каждая = параграф)
 * и/или объектов {h2|h3|h4: 'текст'} и {ul: ['...', '...']}.
 */
export function richText(blocks) {
  const children = []
  for (const block of blocks ?? []) {
    if (block == null) continue
    if (typeof block === 'string') {
      if (block.trim()) children.push(paragraph(block))
      continue
    }
    if (typeof block !== 'object') continue
    if ('h2' in block) children.push(heading('h2', block.h2))
    else if ('h3' in block) children.push(heading('h3', block.h3))
    else if ('h4' in block) children.push(heading('h4', block.h4))
    else if ('ul' in block) children.push(bullet(block.ul))
    else if ('ol' in block) children.push(ordered(block.ol))
    else if ('p' in block) {
      const v = block.p
      children.push(paragraph(Array.isArray(v) ? v : v))
    } else if ('node' in block) children.push(block.node)
  }
  return lexicalRoot(children)
}

/**
 * Конвертация очень простого HTML (как в WP-постах) в Lexical.
 * Поддерживает: <p>, <br>, <strong>/<b>, <em>/<i>, <a href>, <ul>/<li>, <ol>/<li>, <h2>, <h3>.
 * Всё остальное — выкидывает теги, оставляя текст.
 *
 * Не идеальный, но даёт читаемый результат для миграции 114 новостей.
 */
export function lexicalFromHtml(html) {
  if (!html || typeof html !== 'string') return lexicalRoot([])

  let src = String(html)
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/\r\n?/g, '\n')

  // WP делит абзацы двойным \n, если не оборачивает в <p>.
  if (!/<p[\s>]/i.test(src)) {
    src = src
      .split(/\n{2,}/)
      .map((chunk) => `<p>${chunk.trim()}</p>`)
      .join('\n')
  }

  const blocks = []

  // Разрезаем на блоки: <p>, <h2>, <h3>, <ul>, <ol>
  const blockRe = /<(p|h2|h3|h4|ul|ol)([^>]*)>([\s\S]*?)<\/\1>/gi
  let m
  while ((m = blockRe.exec(src))) {
    const tag = m[1].toLowerCase()
    const inner = m[3]
    if (tag === 'p') {
      blocks.push(paragraph(inlineFromHtml(inner)))
    } else if (tag === 'h2' || tag === 'h3' || tag === 'h4') {
      blocks.push(heading(tag, inlineFromHtml(inner)))
    } else if (tag === 'ul' || tag === 'ol') {
      const items = []
      const liRe = /<li[^>]*>([\s\S]*?)<\/li>/gi
      let li
      while ((li = liRe.exec(inner))) {
        items.push(inlineFromHtml(li[1]))
      }
      if (items.length) blocks.push(tag === 'ul' ? bullet(items) : ordered(items))
    }
  }

  if (!blocks.length) {
    // Совсем без тегов — одним параграфом
    const stripped = src.replace(/<[^>]+>/g, '').trim()
    if (stripped) blocks.push(paragraph(stripped))
  }

  return lexicalRoot(blocks)
}

/** Пробразование inline HTML в массив text/link/inline узлов. */
function inlineFromHtml(html) {
  const out = []
  const remaining = String(html ?? '')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/&nbsp;/g, ' ')

  // Простейший токенизатор по <a>, <strong>/<b>, <em>/<i>
  const tagRe = /<(a|strong|b|em|i)\b([^>]*)>([\s\S]*?)<\/\1>/i
  let rest = remaining
  let safety = 0
  while (rest && safety++ < 500) {
    const m = rest.match(tagRe)
    if (!m) {
      const tail = stripAndDecode(rest)
      if (tail) out.push(text(tail))
      break
    }
    const before = rest.slice(0, m.index)
    if (before) out.push(text(stripAndDecode(before)))
    const tag = m[1].toLowerCase()
    const attrs = m[2]
    const inner = stripAndDecode(m[3])
    if (tag === 'a') {
      const hrefMatch = attrs.match(/href\s*=\s*"([^"]*)"|href\s*=\s*'([^']*)'/i)
      const href = hrefMatch ? hrefMatch[1] || hrefMatch[2] || '#' : '#'
      out.push(link(href, [text(inner)]))
    } else if (tag === 'strong' || tag === 'b') {
      out.push(text(inner, { bold: true }))
    } else if (tag === 'em' || tag === 'i') {
      out.push(text(inner, { italic: true }))
    }
    rest = rest.slice(m.index + m[0].length)
  }

  return out.length ? out : [text('')]
}

function stripAndDecode(s) {
  return String(s ?? '')
    .replace(/<[^>]+>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\s+/g, ' ')
    .trim()
}

/** Сброс счётчика id (полезно перед prod-сборкой, чтобы был стабильный diff). */
export function resetIds() {
  _gid = 1
}
