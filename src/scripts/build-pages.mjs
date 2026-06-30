/**
 * Собирает JSON-страницы из ./pages/*.mjs в ./parsed/pages/*.json.
 *
 *   node src/scripts/build-pages.mjs
 *
 * Каждый файл в ./pages/<slug>.mjs должен экспортировать default объект:
 *   { title: string, slug: string, blocks: [...] }
 */

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const PAGES_DIR = path.join(__dirname, 'pages')
const OUT_DIR = path.join(__dirname, 'parsed', 'pages')

if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true })
if (!fs.existsSync(PAGES_DIR)) {
  console.error('Нет папки src/scripts/pages — создаю пустую.')
  fs.mkdirSync(PAGES_DIR, { recursive: true })
}

const files = fs.readdirSync(PAGES_DIR).filter((f) => f.endsWith('.mjs'))
if (!files.length) {
  console.warn('Нет ни одного *.mjs в src/scripts/pages.')
  process.exit(0)
}

let ok = 0
for (const f of files.sort()) {
  const mod = await import(pathToFileURL(path.join(PAGES_DIR, f)).href)
  const page = mod.default
  if (!page || !page.slug || !page.title) {
    console.warn(`! ${f}: default export должен содержать { title, slug, blocks }. Пропуск.`)
    continue
  }
  if (!Array.isArray(page.blocks)) {
    console.warn(`! ${f}: blocks должен быть массивом. Пропуск.`)
    continue
  }
  const out = path.join(OUT_DIR, `${page.slug}.json`)
  fs.writeFileSync(out, JSON.stringify(page, null, 2))
  console.log(`  → ${path.relative(process.cwd(), out)}  [${page.blocks.length} блоков]`)
  ok++
}

console.log(`\nСобрано ${ok} страниц(ы).`)
