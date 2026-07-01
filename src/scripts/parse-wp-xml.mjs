/**
 * Парсер WordPress XML экспорта в JSON-файлы под нашу схему Payload.
 *
 *   node src/scripts/parse-wp-xml.mjs [news.xml] [--attachments baseline.xml] [--only-new] [--only-news]
 *
 * news.xml по умолчанию: -.WordPress.2026-06-30.xml
 * baseline.xml по умолчанию: -.WordPress.2026-06-29.xml (вложения + diff для --only-new)
 */

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { lexicalFromHtml } from './_lexical.mjs'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const ROOT = path.resolve(__dirname, '..', '..')
const OUT_DIR = path.join(__dirname, 'parsed')
const WP_MEDIA_API = 'https://detskiydomuss.ru/wp-json/wp/v2/media'

const argv = process.argv.slice(2)
const flags = new Set(argv.filter((a) => a.startsWith('--')))
const positional = argv.filter((a) => !a.startsWith('--'))
const attachmentsFlagIdx = argv.indexOf('--attachments')
const attachmentsPathArg =
  attachmentsFlagIdx !== -1 ? argv[attachmentsFlagIdx + 1] : null

const NEWS_XML = path.resolve(ROOT, positional[0] || '-.WordPress.2026-06-30.xml')
const ATTACHMENTS_XML = path.resolve(
  ROOT,
  attachmentsPathArg || positional[1] || '-.WordPress.2026-06-29.xml',
)
const ONLY_NEW = flags.has('--only-new')
const ONLY_NEWS = flags.has('--only-news')

if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true })

// ---------- 1. Чтение XML ----------

function readXmlItems(xmlPath) {
  const xml = fs.readFileSync(xmlPath, 'utf8')
  return xml.split('<item>').slice(1).map((chunk) => '<item>' + chunk.split('</item>')[0])
}

function indexItems(rawItems) {
  const attachmentsById = new Map()
  const byType = new Map()

  for (const raw of rawItems) {
    const t = postType(raw)
    if (!t) continue
    const id = postId(raw)
    if (t === 'attachment') {
      const url = attachmentUrl(raw)
      if (id && url) attachmentsById.set(id, url)
      continue
    }
    if (!byType.has(t)) byType.set(t, [])
    byType.get(t).push(raw)
  }

  return { attachmentsById, byType }
}

function publishedPostSlugs(rawItems) {
  const slugs = new Set()
  for (const raw of rawItems) {
    if (postType(raw) !== 'post' || postStatus(raw) !== 'publish') continue
    const slug = postName(raw)
    if (slug) slugs.add(slug)
  }
  return slugs
}

async function resolveAttachmentUrl(id, attachmentsById) {
  const cached = attachmentsById.get(id)
  if (cached) return cached

  try {
    const res = await fetch(`${WP_MEDIA_API}/${id}`)
    if (!res.ok) return null
    const data = await res.json()
    const url = data.source_url || data.guid?.rendered || null
    if (url) attachmentsById.set(id, url)
    return url
  } catch {
    return null
  }
}

async function resolveAttachmentUrls(ids, attachmentsById) {
  const unique = [...new Set(ids.filter(Boolean))]
  for (const id of unique) {
    if (!attachmentsById.has(id)) {
      await resolveAttachmentUrl(id, attachmentsById)
    }
  }
}

const baselineItems = ONLY_NEW ? readXmlItems(ATTACHMENTS_XML) : []
const baselineSlugs = ONLY_NEW ? publishedPostSlugs(baselineItems) : null

const attachmentItems = readXmlItems(ATTACHMENTS_XML)
const { attachmentsById } = indexItems(attachmentItems)

const newsItems_raw = readXmlItems(NEWS_XML)
const { byType } = indexItems(newsItems_raw)

// ---------- 2. Утилиты ----------

function cdata(raw, tag) {
  const m = raw.match(new RegExp(`<${tag}><!\\[CDATA\\[([\\s\\S]*?)\\]\\]></${tag}>`))
  return m ? m[1] : null
}
function tagText(raw, tag) {
  const m = raw.match(new RegExp(`<${tag}>([\\s\\S]*?)</${tag}>`))
  return m ? m[1] : null
}
function postId(raw) {
  const m = raw.match(/<wp:post_id>(\d+)<\/wp:post_id>/)
  return m ? parseInt(m[1], 10) : null
}
function postParent(raw) {
  const m = raw.match(/<wp:post_parent>(\d+)<\/wp:post_parent>/)
  return m ? parseInt(m[1], 10) : null
}
function postType(raw) {
  return cdata(raw, 'wp:post_type')
}
function postStatus(raw) {
  return cdata(raw, 'wp:status')
}
function postName(raw) {
  return cdata(raw, 'wp:post_name')
}
function postTitle(raw) {
  return cdata(raw, 'title')
}
function postContent(raw) {
  return cdata(raw, 'content:encoded')
}
function postExcerpt(raw) {
  return cdata(raw, 'excerpt:encoded')
}
function postDate(raw) {
  const gmt = cdata(raw, 'wp:post_date_gmt')
  const local = cdata(raw, 'wp:post_date')
  return gmt && gmt !== '0000-00-00 00:00:00' ? gmt : local && local !== '0000-00-00 00:00:00' ? local : null
}
function attachmentUrl(raw) {
  return cdata(raw, 'wp:attachment_url')
}
function postMetas(raw) {
  const out = {}
  const re = /<wp:postmeta>\s*<wp:meta_key><!\[CDATA\[([\s\S]*?)\]\]><\/wp:meta_key>\s*<wp:meta_value><!\[CDATA\[([\s\S]*?)\]\]><\/wp:meta_value>\s*<\/wp:postmeta>/g
  let m
  while ((m = re.exec(raw))) {
    const k = m[1]
    const v = m[2]
    if (k in out) {
      const cur = out[k]
      if (Array.isArray(cur)) cur.push(v)
      else out[k] = [cur, v]
    } else {
      out[k] = v
    }
  }
  return out
}

function decodeSerializedIds(raw) {
  if (!raw) return []
  // a:N:{i:0;s:Y:"123";i:1;s:Y:"456";}  или  a:N:{i:0;i:123;...}
  const out = []
  const reS = /s:\d+:"(\d+)"/g
  let m
  while ((m = reS.exec(raw))) out.push(parseInt(m[1], 10))
  if (out.length) return out
  const reI = /i:(\d+)/g
  while ((m = reI.exec(raw))) {
    const n = parseInt(m[1], 10)
    if (!Number.isNaN(n) && n > 100) out.push(n)
  }
  return out
}

function toIsoDate(s) {
  if (!s) return null
  const d = new Date(s.replace(' ', 'T') + 'Z')
  if (Number.isNaN(d.getTime())) return null
  return d.toISOString()
}

// ---------- 3. Индексация вложений (из baseline XML + WP API для новых id) ----------

function attachmentIdsForMeta(meta) {
  const ids = []
  const thumb = meta._thumbnail_id
  if (thumb) ids.push(parseInt(Array.isArray(thumb) ? thumb[0] : thumb, 10))

  for (const [k, v] of Object.entries(meta)) {
    const m = k.match(/^дополнительные_фотографии_(\d+)_(?:фото|image|photo)$/)
    if (!m) continue
    const val = Array.isArray(v) ? v[0] : v
    if (!val) continue
    if (/^https?:\/\//.test(val)) continue
    const id = parseInt(val, 10)
    if (!Number.isNaN(id)) ids.push(id)
  }

  const gallery = meta['дополнительные_фотографии']
  if (gallery) {
    ids.push(...decodeSerializedIds(Array.isArray(gallery) ? gallery[0] : gallery))
  }

  return ids.filter((id) => !Number.isNaN(id) && id > 0)
}

// ---------- 4. Резолверы изображений из meta ----------

function thumbnailUrlFor(meta) {
  const thumb = meta._thumbnail_id
  if (!thumb) return null
  const id = parseInt(Array.isArray(thumb) ? thumb[0] : thumb, 10)
  if (!id) return null
  return attachmentsById.get(id) ?? null
}

async function thumbnailUrlForAsync(meta) {
  const thumb = meta._thumbnail_id
  if (!thumb) return null
  const id = parseInt(Array.isArray(thumb) ? thumb[0] : thumb, 10)
  if (!id) return null
  return (await resolveAttachmentUrl(id, attachmentsById)) ?? null
}

function galleryUrlsFor(meta) {
  // 1) ACF repeater: дополнительные_фотографии_<idx>_фото|image = id (или URL)
  const repeater = []
  for (const [k, v] of Object.entries(meta)) {
    const m = k.match(/^дополнительные_фотографии_(\d+)_(?:фото|image|photo)$/)
    if (!m) continue
    repeater.push({ idx: parseInt(m[1], 10), value: Array.isArray(v) ? v[0] : v })
  }
  if (repeater.length) {
    repeater.sort((a, b) => a.idx - b.idx)
    return repeater
      .map(({ value }) => {
        if (!value) return null
        if (/^https?:\/\//.test(value)) return value
        const id = parseInt(value, 10)
        return attachmentsById.get(id) ?? null
      })
      .filter(Boolean)
  }

  // 2) ACF gallery: одно поле дополнительные_фотографии = serialized array of ids
  const gallery = meta['дополнительные_фотографии']
  if (gallery) {
    const ids = decodeSerializedIds(Array.isArray(gallery) ? gallery[0] : gallery)
    return ids.map((id) => attachmentsById.get(id)).filter(Boolean)
  }

  return []
}

async function galleryUrlsForAsync(meta) {
  const repeater = []
  for (const [k, v] of Object.entries(meta)) {
    const m = k.match(/^дополнительные_фотографии_(\d+)_(?:фото|image|photo)$/)
    if (!m) continue
    repeater.push({ idx: parseInt(m[1], 10), value: Array.isArray(v) ? v[0] : v })
  }
  if (repeater.length) {
    repeater.sort((a, b) => a.idx - b.idx)
    const urls = []
    for (const { value } of repeater) {
      if (!value) continue
      if (/^https?:\/\//.test(value)) {
        urls.push(value)
        continue
      }
      const id = parseInt(value, 10)
      const url = await resolveAttachmentUrl(id, attachmentsById)
      if (url) urls.push(url)
    }
    return urls
  }

  const gallery = meta['дополнительные_фотографии']
  if (gallery) {
    const ids = decodeSerializedIds(Array.isArray(gallery) ? gallery[0] : gallery)
    const urls = []
    for (const id of ids) {
      const url = await resolveAttachmentUrl(id, attachmentsById)
      if (url) urls.push(url)
    }
    return urls
  }

  return []
}

function fileUrlFor(meta) {
  // ACF поля файла в разных CPT называются по-разному: `file`, `family_file`, `document`.
  const candidates = ['file', 'family_file', 'document', 'attached_file', 'pdf']
  for (const key of candidates) {
    const v = meta[key]
    if (!v) continue
    const val = Array.isArray(v) ? v[0] : v
    if (/^https?:\/\//.test(val)) return val
    const id = parseInt(val, 10)
    if (!Number.isNaN(id)) {
      const url = attachmentsById.get(id)
      if (url) return url
    }
  }
  return null
}

function inferFileExt(url) {
  if (!url) return 'pdf'
  const m = url.toLowerCase().match(/\.([a-z0-9]+)(?:\?|$)/)
  const ext = m ? m[1] : 'pdf'
  if (['pdf', 'docx', 'doc', 'xlsx', 'xls', 'zip'].includes(ext)) return ext
  return 'other'
}

function customDateFor(meta) {
  // ACF поле custom_date (есть на постах news)
  const v = meta.custom_date
  if (!v) return null
  const val = Array.isArray(v) ? v[0] : v
  // Формат WP/ACF: 'YYYYMMDD' либо 'YYYY-MM-DD'
  if (/^\d{8}$/.test(val)) {
    return `${val.slice(0, 4)}-${val.slice(4, 6)}-${val.slice(6, 8)}T00:00:00.000Z`
  }
  const d = new Date(val)
  if (!Number.isNaN(d.getTime())) return d.toISOString()
  return null
}

// ---------- 5. Сборка ----------

function writeJson(name, data) {
  const file = path.join(OUT_DIR, name)
  fs.writeFileSync(file, JSON.stringify(data, null, 2))
  console.log(`  → ${path.relative(ROOT, file)} (${Array.isArray(data) ? data.length + ' items' : 'object'})`)
}

console.log('Парсю WordPress XML...')
console.log(`  news: ${path.basename(NEWS_XML)}`)
console.log(`  attachments: ${path.basename(ATTACHMENTS_XML)} (${attachmentsById.size} из XML)`)
if (ONLY_NEW) console.log(`  режим: только новые новости (baseline ${baselineSlugs.size} slug)`)

// 5.1 News (post_type='post')
const newsRaw = (byType.get('post') ?? []).filter((raw) => postStatus(raw) === 'publish')
const newsFiltered = ONLY_NEW
  ? newsRaw.filter((raw) => {
      const slug = postName(raw) || `news-${postId(raw)}`
      return !baselineSlugs.has(slug)
    })
  : newsRaw

const attachmentIdsNeeded = newsFiltered.flatMap((raw) => attachmentIdsForMeta(postMetas(raw)))
await resolveAttachmentUrls(attachmentIdsNeeded, attachmentsById)
console.log(`  attachments resolved: ${attachmentsById.size}`)

const newsItems = []
for (const raw of newsFiltered) {
  const meta = postMetas(raw)
  const slug = postName(raw) || `news-${postId(raw)}`
  const thumbnailUrl = await thumbnailUrlForAsync(meta)
  const gallery = await galleryUrlsForAsync(meta)
  newsItems.push({
    title: postTitle(raw) ?? '',
    slug,
    publishedAt: customDateFor(meta) ?? toIsoDate(postDate(raw)),
    excerpt: (postExcerpt(raw) || '').replace(/\s+/g, ' ').trim() || null,
    thumbnailUrl,
    galleryUrls: gallery.map((u) => ({ url: u, alt: '' })),
    content: lexicalFromHtml(postContent(raw) || ''),
    _source: { id: postId(raw) },
  })
}
newsItems.sort((a, b) => (b.publishedAt || '').localeCompare(a.publishedAt || ''))

writeJson('news.json', newsItems)

if (ONLY_NEWS) {
  console.log('Готово (только news.json).')
  process.exit(0)
}

// 5.2 main_slider
const mainSlides = (byType.get('main_slider') ?? []).map((raw, i) => {
  const meta = postMetas(raw)
  return {
    order: i + 1,
    title: postTitle(raw) ?? '',
    imageUrl: thumbnailUrlFor(meta),
    href: (meta.link ? (Array.isArray(meta.link) ? meta.link[0] : meta.link) : null) || null,
  }
})
writeJson('main-slider.json', mainSlides)

// 5.3 security_slider
const securitySlides = (byType.get('security_slider') ?? []).map((raw, i) => {
  const meta = postMetas(raw)
  return {
    order: i + 1,
    title: postTitle(raw) ?? String(i + 1),
    imageUrl: thumbnailUrlFor(meta),
  }
})
writeJson('security-slider.json', securitySlides)

// 5.4 cs_slider (Дети в семье)
const csSlides = (byType.get('cs_slider') ?? []).map((raw, i) => {
  const meta = postMetas(raw)
  return {
    order: i + 1,
    title: postTitle(raw) ?? String(i + 1),
    imageUrl: thumbnailUrlFor(meta),
  }
})
writeJson('cs-slider.json', csSlides)

// 5.5 achievements (29) — title=1..29, imageUrl, order
const achievements = (byType.get('achievements') ?? [])
  .map((raw) => {
    const meta = postMetas(raw)
    const num = parseInt(postTitle(raw) || '0', 10)
    return {
      order: Number.isNaN(num) ? 999 : num,
      title: postTitle(raw) || '',
      imageUrl: thumbnailUrlFor(meta),
    }
  })
  .sort((a, b) => a.order - b.order)

writeJson('achievements.json', achievements)

// 5.6 documents by source (plans, programms, cs_docs, cs_policy, fc_docs, fc_policy, fc_programs)
const DOC_TYPES = {
  plans: 'plan',
  programms: 'program',
  cs_docs: 'cs_doc',
  cs_policy: 'cs_policy',
  fc_docs: 'fc_doc',
  fc_policy: 'fc_policy',
  fc_programs: 'fc_program',
}

const documentsBySource = {}
for (const [type, key] of Object.entries(DOC_TYPES)) {
  documentsBySource[key] = (byType.get(type) ?? []).map((raw) => {
    const meta = postMetas(raw)
    const fileUrl = fileUrlFor(meta)
    return {
      title: postTitle(raw) ?? '',
      fileUrl,
      fileExt: inferFileExt(fileUrl),
    }
  })
}
writeJson('documents-by-source.json', documentsBySource)

// 5.7 attachments (на будущее — для миграции медиа)
writeJson(
  'attachments.json',
  Array.from(attachmentsById.entries()).map(([id, url]) => ({ id, url })),
)

console.log('Готово.')
