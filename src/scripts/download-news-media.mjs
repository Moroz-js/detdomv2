/**
 * Скачивает фото новостей (thumbnail + gallery) в uploads/ для deploy:media.
 *
 *   node src/scripts/download-news-media.mjs [slug ...]
 *   node src/scripts/download-news-media.mjs --from news.json --limit 2
 *
 * Без аргументов — все URL из news.json.
 */

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..', '..')
const PARSED = path.join(__dirname, 'parsed', 'news.json')
const UPLOADS = path.resolve(ROOT, process.env.LOCAL_MEDIA_DIR || 'uploads')

const WP_UPLOADS = /https?:\/\/detskiydomuss\.ru\/wp-content\/uploads\//i

const argv = process.argv.slice(2)
const limitFlag = argv.indexOf('--limit')
const limit = limitFlag !== -1 ? Number(argv[limitFlag + 1]) : null
const slugs =
  limitFlag !== -1
    ? null
    : argv.filter((a) => !a.startsWith('--'))

function wpPath(url) {
  if (!url || !WP_UPLOADS.test(url)) return null
  return url.replace(WP_UPLOADS, '').split('?')[0]
}

function collectUrls(items) {
  const set = new Set()
  for (const item of items) {
    const p = wpPath(item.thumbnailUrl)
    if (p) set.add(p)
    for (const g of item.galleryUrls ?? []) {
      const gp = wpPath(g?.url)
      if (gp) set.add(gp)
    }
  }
  return [...set]
}

async function download(rel) {
  const local = path.join(UPLOADS, rel.split('/').join(path.sep))
  if (fs.existsSync(local)) {
    return { rel, status: 'skip' }
  }
  fs.mkdirSync(path.dirname(local), { recursive: true })
  const url = `https://detskiydomuss.ru/wp-content/uploads/${rel}`
  const res = await fetch(url)
  if (!res.ok) return { rel, status: `fail ${res.status}` }
  fs.writeFileSync(local, Buffer.from(await res.arrayBuffer()))
  return { rel, status: 'ok' }
}

function rewriteMediaUrl(url) {
  if (!url) return url
  return url.replace(WP_UPLOADS, '/media/')
}

const news = JSON.parse(fs.readFileSync(PARSED, 'utf8'))
let items = news
if (slugs?.length) {
  items = news.filter((n) => slugs.includes(n.slug))
} else if (limit) {
  items = news.slice(0, limit)
}

if (!items.length) {
  console.error('Нет новостей для загрузки медиа.')
  process.exit(1)
}

console.log(`Новости: ${items.map((i) => i.slug).join(', ')}`)
const paths = collectUrls(items)
console.log(`Файлов: ${paths.length}, папка: ${UPLOADS}\n`)

let ok = 0
let skip = 0
let fail = 0
for (const rel of paths) {
  const r = await download(rel)
  if (r.status === 'ok') ok++
  else if (r.status === 'skip') skip++
  else fail++
  console.log(`  ${r.status === 'ok' ? '+' : r.status === 'skip' ? '○' : '✗'} ${rel}`)
}

for (const item of items) {
  item.thumbnailUrl = rewriteMediaUrl(item.thumbnailUrl)
  item.galleryUrls = (item.galleryUrls ?? []).map((g) => ({
    ...g,
    url: rewriteMediaUrl(g.url),
  }))
}

const outFiltered = path.join(__dirname, 'parsed', 'news-media-update.json')
fs.writeFileSync(outFiltered, JSON.stringify(items, null, 2))
console.log(`\n→ ${path.relative(ROOT, outFiltered)} (URL → /media/)`)
console.log(`Готово: ${ok} скачано, ${skip} уже были, ${fail} ошибок.`)
