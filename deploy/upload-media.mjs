/* eslint-disable no-console */
/**
 * Локальная заливка папки uploads (с WP) в папку media на сервере по SFTP.
 *
 *   npm run deploy:media
 *
 * Конфиг берётся из переменных окружения или из файла deploy/.env.deploy:
 *
 *   DEPLOY_SSH_HOST=1.2.3.4
 *   DEPLOY_SSH_USER=detdom
 *   DEPLOY_SSH_PORT=22
 *   DEPLOY_SSH_KEY=C:\Users\lisof\.ssh\detdom_ed25519
 *   DEPLOY_SSH_PASSPHRASE=            # если ключ с паролем
 *   LOCAL_MEDIA_DIR=C:\путь\к\wp-content\uploads
 *   REMOTE_MEDIA_DIR=/var/www/detdom/media
 *   SITE_URL=https://example.ru
 *
 * Что делает:
 *   1) рекурсивно заливает файлы, существующие с тем же размером — пропускает
 *      (повторный запуск инкрементальный, ничего не перезаписывает зря);
 *   2) показывает прогресс-бар;
 *   3) после заливки проверяет, что новые URL отвечают 200 и что ключевые
 *      страницы (/, /news, /documents) и образцы медиа реально работают.
 */

import fs from 'node:fs'
import path from 'node:path'
import os from 'node:os'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// ---------- ssh2 ----------
let Client
try {
  ;({ Client } = await import('ssh2'))
} catch {
  console.error('Не найден пакет ssh2. Установи:  npm i -D ssh2')
  process.exit(1)
}

// ---------- конфиг ----------
function loadEnvFile(file) {
  if (!fs.existsSync(file)) return
  for (const raw of fs.readFileSync(file, 'utf8').split('\n')) {
    const line = raw.trim()
    if (!line || line.startsWith('#')) continue
    const eq = line.indexOf('=')
    if (eq === -1) continue
    const k = line.slice(0, eq).trim()
    const v = line.slice(eq + 1).trim()
    if (!(k in process.env)) process.env[k] = v
  }
}
loadEnvFile(path.join(__dirname, '.env.deploy'))

// Папка на сервере захардкожена — совпадает с bootstrap.sh и nginx.
const REMOTE_MEDIA_DIR = '/var/www/detdom/media'

const cfg = {
  host: process.env.DEPLOY_SSH_HOST,
  port: Number(process.env.DEPLOY_SSH_PORT || 22),
  username: process.env.DEPLOY_SSH_USER,
  keyPath: process.env.DEPLOY_SSH_KEY,
  passphrase: process.env.DEPLOY_SSH_PASSPHRASE || undefined,
  localDir: process.env.LOCAL_MEDIA_DIR,
  remoteDir: REMOTE_MEDIA_DIR,
  siteUrl: (process.env.SITE_URL || '').replace(/\/$/, ''),
}

const missing = []
if (!cfg.host) missing.push('DEPLOY_SSH_HOST')
if (!cfg.username) missing.push('DEPLOY_SSH_USER')
if (!cfg.keyPath) missing.push('DEPLOY_SSH_KEY')
if (!cfg.localDir) missing.push('LOCAL_MEDIA_DIR')
if (missing.length) {
  console.error('Не заданы переменные: ' + missing.join(', '))
  console.error('Создай deploy/.env.deploy (см. шапку файла) или экспортируй их.')
  process.exit(1)
}
if (!fs.existsSync(cfg.localDir)) {
  console.error(`Локальная папка не найдена: ${cfg.localDir}`)
  process.exit(1)
}

const keyFile = cfg.keyPath.replace(/^~(?=$|[/\\])/, os.homedir())
if (!fs.existsSync(keyFile)) {
  console.error(`Приватный ключ не найден: ${keyFile}`)
  process.exit(1)
}

// ---------- утилиты ----------
const C = {
  reset: '\x1b[0m',
  dim: '\x1b[2m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
}

function walk(dir, base = dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) walk(full, base, out)
    else if (entry.isFile()) {
      out.push({
        local: full,
        rel: path.relative(base, full).split(path.sep).join('/'),
        size: fs.statSync(full).size,
      })
    }
  }
  return out
}

function fmtBytes(n) {
  const u = ['B', 'KB', 'MB', 'GB']
  let i = 0
  while (n >= 1024 && i < u.length - 1) {
    n /= 1024
    i++
  }
  return `${n.toFixed(i ? 1 : 0)} ${u[i]}`
}

function renderBar(done, total, label) {
  const width = 28
  const ratio = total ? done / total : 0
  const filled = Math.round(ratio * width)
  const bar = '#'.repeat(filled) + '-'.repeat(width - filled)
  const pct = String(Math.round(ratio * 100)).padStart(3)
  const line = `\r[${bar}] ${pct}% ${label}`
  process.stdout.write(line.padEnd((process.stdout.columns || 80) - 1).slice(0, (process.stdout.columns || 80) - 1))
}

// ---------- ssh2 промис-обёртки ----------
function connect() {
  return new Promise((resolve, reject) => {
    const conn = new Client()
    conn
      .on('ready', () => resolve(conn))
      .on('error', reject)
      .connect({
        host: cfg.host,
        port: cfg.port,
        username: cfg.username,
        privateKey: fs.readFileSync(keyFile),
        passphrase: cfg.passphrase,
        readyTimeout: 20000,
      })
  })
}

function getSftp(conn) {
  return new Promise((resolve, reject) =>
    conn.sftp((err, sftp) => (err ? reject(err) : resolve(sftp))),
  )
}

function sftpStat(sftp, p) {
  return new Promise((resolve) => sftp.stat(p, (err, st) => resolve(err ? null : st)))
}

function sftpMkdir(sftp, p) {
  return new Promise((resolve) => sftp.mkdir(p, () => resolve()))
}

async function ensureRemoteDir(sftp, dir, cache) {
  if (dir === '.' || dir === '/' || cache.has(dir)) return
  const parent = dir.split('/').slice(0, -1).join('/')
  if (parent) await ensureRemoteDir(sftp, parent, cache)
  await sftpMkdir(sftp, dir)
  cache.add(dir)
}

function sftpPut(sftp, local, remote, onChunk) {
  return new Promise((resolve, reject) => {
    sftp.fastPut(local, remote, { step: (transferred) => onChunk(transferred) }, (err) =>
      err ? reject(err) : resolve(),
    )
  })
}

// ---------- recheck ----------
async function head(url) {
  try {
    let res = await fetch(url, { method: 'HEAD', redirect: 'follow' })
    if (res.status === 405 || res.status === 501) {
      res = await fetch(url, { method: 'GET', headers: { Range: 'bytes=0-0' }, redirect: 'follow' })
    }
    return res.status
  } catch (e) {
    return `ERR ${e.code || e.message}`
  }
}

function sample(arr, n) {
  if (arr.length <= n) return arr
  const step = Math.floor(arr.length / n)
  const out = []
  for (let i = 0; i < arr.length && out.length < n; i += step) out.push(arr[i])
  return out
}

// ---------- main ----------
async function main() {
  console.log(`${C.cyan}Источник:${C.reset} ${cfg.localDir}`)
  console.log(`${C.cyan}Сервер:  ${C.reset} ${cfg.username}@${cfg.host}:${cfg.remoteDir}\n`)

  console.log('Сканирую файлы…')
  const files = walk(cfg.localDir)
  const totalBytes = files.reduce((s, f) => s + f.size, 0)
  console.log(`Найдено ${files.length} файлов, ${fmtBytes(totalBytes)}\n`)
  if (!files.length) {
    console.log('Нечего заливать.')
    return
  }

  const conn = await connect()
  const sftp = await getSftp(conn)
  const dirCache = new Set()
  await ensureRemoteDir(sftp, cfg.remoteDir, new Set())

  let uploaded = 0
  let skipped = 0
  let doneBytes = 0
  let baseBytes = 0

  for (let i = 0; i < files.length; i++) {
    const f = files[i]
    const remote = `${cfg.remoteDir}/${f.rel}`
    const remoteParent = remote.split('/').slice(0, -1).join('/')
    await ensureRemoteDir(sftp, remoteParent, dirCache)

    const st = await sftpStat(sftp, remote)
    if (st && st.size === f.size) {
      skipped++
      doneBytes += f.size
      baseBytes = doneBytes
      renderBar(doneBytes, totalBytes, `${C.dim}skip${C.reset} ${f.rel}`)
      continue
    }

    baseBytes = doneBytes
    await sftpPut(sftp, f.local, remote, (transferred) => {
      renderBar(baseBytes + transferred, totalBytes, `${f.rel}`)
    })
    uploaded++
    doneBytes = baseBytes + f.size
    renderBar(doneBytes, totalBytes, `${f.rel}`)
  }

  process.stdout.write('\n\n')
  conn.end()
  console.log(`${C.green}Заливка завершена${C.reset}: загружено ${uploaded}, пропущено ${skipped}.\n`)

  // ---------- recheck ----------
  if (!cfg.siteUrl) {
    console.log(`${C.yellow}SITE_URL не задан — пропускаю проверку доступности.${C.reset}`)
    return
  }

  console.log(`${C.cyan}Проверяю доступность (${cfg.siteUrl})…${C.reset}`)
  const mediaSample = sample(
    files.filter((f) => /\.(jpe?g|png|webp|gif|svg|pdf|docx?|xlsx?)$/i.test(f.rel)),
    8,
  )

  const checks = []
  for (const f of mediaSample) {
    const url = `${cfg.siteUrl}/media/${f.rel.split('/').map(encodeURIComponent).join('/')}`
    checks.push({ label: `media/${f.rel}`, status: await head(url) })
  }
  for (const p of ['/', '/news', '/documents']) {
    checks.push({ label: `страница ${p}`, status: await head(`${cfg.siteUrl}${p}`) })
  }

  let ok = 0
  for (const c of checks) {
    const good = c.status === 200 || c.status === 206
    if (good) ok++
    const mark = good ? `${C.green}OK${C.reset}` : `${C.red}FAIL${C.reset}`
    console.log(`  [${mark}] ${String(c.status).padEnd(6)} ${c.label}`)
  }

  console.log(`\n${ok === checks.length ? C.green : C.yellow}Проверки: ${ok}/${checks.length} успешно.${C.reset}`)
  if (ok !== checks.length) {
    console.log(
      `${C.dim}Если media отдаёт не 200 — проверь nginx location /media/ и что дамп переписал URL на /media. ` +
        `Если страницы не 200 — проверь сервис detdom и сертификат.${C.reset}`,
    )
    process.exitCode = 1
  }
}

main().catch((e) => {
  console.error(`\n${C.red}Ошибка:${C.reset}`, e.message || e)
  process.exit(1)
})
