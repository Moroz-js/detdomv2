/* eslint-disable no-console */
/**
 * Локальная заливка папки uploads в /var/www/detdom/media по SFTP.
 *
 *   npm run deploy:media
 *
 * Структура LOCAL_MEDIA_DIR (всё заливается рекурсивно):
 *   2020/, 2024/, …           — wp-content/uploads (новости, галереи)
 *   documents/                — PDF/DOCX из themes/detdom/documents/
 *   assets/img/               — картинки из themes/detdom/assets/img/
 *
 * URL в БД после bootstrap: …/wp-content/themes/detdom/documents/x.pdf → /media/documents/x.pdf
 *
 * Конфиг: deploy/.env.deploy или переменные окружения.
 *   DEPLOY_CONCURRENCY=4   — параллельных SFTP-сессий (по умолчанию 4)
 *   DEPLOY_SSH_TIMEOUT=60000 — таймаут handshake, мс
 *   DEPLOY_SSH_RETRIES=5   — повторы подключения
 */

import fs from 'node:fs'
import path from 'node:path'
import os from 'node:os'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

let Client
try {
  ;({ Client } = await import('ssh2'))
} catch {
  console.error('Не найден пакет ssh2. Установи:  npm i -D ssh2')
  process.exit(1)
}

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

const REMOTE_MEDIA_DIR = '/var/www/detdom/media'
const CONCURRENCY = Math.max(1, Math.min(8, Number(process.env.DEPLOY_CONCURRENCY || 4)))
const SSH_READY_TIMEOUT = Math.max(10000, Number(process.env.DEPLOY_SSH_TIMEOUT || 60000))
const SSH_RETRIES = Math.max(1, Number(process.env.DEPLOY_SSH_RETRIES || 5))

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

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
  process.exit(1)
}
if (!fs.existsSync(cfg.localDir)) {
  console.error(`Локальная папка не найдена: ${cfg.localDir}`)
  process.exit(1)
}

const keyFile = cfg.keyPath.replace(/^~(?=$|[/\\])/, os.homedir())
const privateKey = fs.readFileSync(keyFile)

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
      const st = fs.statSync(full)
      out.push({
        local: full,
        rel: path.relative(base, full).split(path.sep).join('/'),
        size: st.size,
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

function connectOnce() {
  return new Promise((resolve, reject) => {
    const conn = new Client()
    conn
      .on('ready', () => resolve(conn))
      .on('error', reject)
      .connect({
        host: cfg.host,
        port: cfg.port,
        username: cfg.username,
        privateKey,
        passphrase: cfg.passphrase,
        readyTimeout: SSH_READY_TIMEOUT,
        keepaliveInterval: 15000,
        keepaliveCountMax: 4,
      })
  })
}

async function connect(label = '') {
  let lastErr
  for (let attempt = 1; attempt <= SSH_RETRIES; attempt++) {
    try {
      return await connectOnce()
    } catch (e) {
      lastErr = e
      if (attempt < SSH_RETRIES) {
        const wait = attempt * 2000
        console.error(
          `\n${C.yellow}SSH${label} ${attempt}/${SSH_RETRIES}: ${e.message}. Повтор через ${wait / 1000}s…${C.reset}`,
        )
        await sleep(wait)
      }
    }
  }
  throw lastErr
}

function getSftp(conn) {
  return new Promise((resolve, reject) =>
    conn.sftp((err, sftp) => (err ? reject(err) : resolve(sftp))),
  )
}

function exec(conn, cmd) {
  return new Promise((resolve, reject) => {
    conn.exec(cmd, (err, stream) => {
      if (err) return reject(err)
      let out = ''
      let errOut = ''
      stream.on('data', (d) => {
        out += d
      })
      stream.stderr.on('data', (d) => {
        errOut += d
      })
      stream.on('close', (code) => {
        if (code === 0) resolve(out)
        else reject(new Error(errOut.trim() || `exit ${code}`))
      })
    })
  })
}

function shellQuote(s) {
  return `'${s.replace(/'/g, `'\\''`)}'`
}

function sftpPut(sftp, local, remote) {
  return new Promise((resolve, reject) => {
    sftp.fastPut(local, remote, (err) => (err ? reject(err) : resolve()))
  })
}

async function sftpPutRetry(sftp, local, remote) {
  let lastErr
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      await sftpPut(sftp, local, remote)
      return
    } catch (e) {
      lastErr = e
      if (attempt < 3) await sleep(attempt * 1000)
    }
  }
  throw lastErr
}

/** Один find на сервере вместо тысяч stat по SFTP. */
async function fetchRemoteIndex(conn) {
  const map = new Map()
  try {
    const out = await exec(
      conn,
      `find ${cfg.remoteDir} -type f -printf '%s\\t%P\\n' 2>/dev/null || true`,
    )
    for (const line of out.split('\n')) {
      if (!line.trim()) continue
      const tab = line.indexOf('\t')
      if (tab === -1) continue
      const size = Number(line.slice(0, tab))
      const rel = line.slice(tab + 1)
      if (!Number.isNaN(size) && rel) map.set(rel, size)
    }
  } catch {
    // пустая media/ — нормально
  }
  return map
}

function collectRemoteDirs(files) {
  const dirs = new Set([cfg.remoteDir])
  for (const f of files) {
    const parts = f.rel.split('/')
    parts.pop()
    let cur = cfg.remoteDir
    for (const part of parts) {
      cur = `${cur}/${part}`
      dirs.add(cur)
    }
  }
  return [...dirs].sort((a, b) => a.split('/').length - b.split('/').length)
}

/** mkdir -p пачками по SSH — быстрее тысяч SFTP-mkdir. */
async function ensureAllDirs(conn, dirs) {
  const chunk = 400
  for (let i = 0; i < dirs.length; i += chunk) {
    const batch = dirs.slice(i, i + chunk)
    const cmd = batch.map((d) => `mkdir -p ${shellQuote(d)}`).join(' ')
    await exec(conn, cmd)
    process.stdout.write(`\rСоздаю каталоги… ${Math.min(i + batch.length, dirs.length)}/${dirs.length}`)
  }
  process.stdout.write('\n')
}

function makeProgress(totalBytes) {
  let doneBytes = 0
  let currentLabel = ''
  let lastRender = 0
  return {
    add(bytes, label) {
      doneBytes += bytes
      if (label) currentLabel = label
    },
    tick(label) {
      if (label) currentLabel = label
      const now = Date.now()
      if (now - lastRender < 120) return
      lastRender = now
      const width = 28
      const ratio = totalBytes ? doneBytes / totalBytes : 0
      const filled = Math.round(ratio * width)
      const bar = '#'.repeat(filled) + '-'.repeat(width - filled)
      const pct = String(Math.round(ratio * 100)).padStart(3)
      const line = `\r[${bar}] ${pct}% ${fmtBytes(doneBytes)}/${fmtBytes(totalBytes)} ${currentLabel}`
      const cols = process.stdout.columns || 100
      process.stdout.write(line.padEnd(cols - 1).slice(0, cols - 1))
    },
    finish() {
      process.stdout.write('\n')
    },
  }
}

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
  const step = Math.max(1, Math.floor(arr.length / n))
  const out = []
  for (let i = 0; i < arr.length && out.length < n; i += step) out.push(arr[i])
  return out
}

/** Статистика по «теме» (documents/, assets/) vs годам uploads. */
function summarize(files) {
  let themeDocs = 0
  let themeAssets = 0
  let uploads = 0
  for (const f of files) {
    if (f.rel.startsWith('documents/')) themeDocs++
    else if (f.rel.startsWith('assets/')) themeAssets++
    else if (/^\d{4}\//.test(f.rel)) uploads++
  }
  return { themeDocs, themeAssets, uploads }
}

function themeSamples(files, n = 4) {
  const theme = files.filter(
    (f) => f.rel.startsWith('documents/') || f.rel.startsWith('assets/'),
  )
  return sample(theme, n)
}

async function main() {
  console.log(`${C.cyan}Источник:${C.reset} ${cfg.localDir}`)
  console.log(`${C.cyan}Сервер:  ${C.reset} ${cfg.username}@${cfg.host}:${cfg.remoteDir}`)
  console.log(`${C.cyan}Потоков: ${C.reset} ${CONCURRENCY}\n`)

  console.log('Сканирую локальные файлы…')
  const files = walk(cfg.localDir)
  const totalBytes = files.reduce((s, f) => s + f.size, 0)
  const { themeDocs, themeAssets, uploads } = summarize(files)
  console.log(`Найдено ${files.length} файлов, ${fmtBytes(totalBytes)}`)
  console.log(
    `  uploads (год/…): ${uploads}, тема documents/: ${themeDocs}, тема assets/: ${themeAssets}`,
  )
  if (themeDocs === 0 && themeAssets === 0) {
    console.log(
      `${C.yellow}  Подсказка:${C.reset} положи в uploads/ папки documents/ и assets/img/ из themes/detdom`,
    )
  }

  if (!files.length) {
    console.log('Нечего заливать.')
    return
  }

  const mainConn = await connect()
  console.log('Индекс файлов на сервере…')
  const remoteIndex = await fetchRemoteIndex(mainConn)

  const toUpload = []
  let skipped = 0
  let skippedBytes = 0
  for (const f of files) {
    const remoteSize = remoteIndex.get(f.rel)
    if (remoteSize === f.size) {
      skipped++
      skippedBytes += f.size
      continue
    }
    toUpload.push(f)
  }
  console.log(
    `К загрузке: ${toUpload.length} (${fmtBytes(totalBytes - skippedBytes)}), пропуск: ${skipped}\n`,
  )

  if (!toUpload.length) {
    console.log(`${C.green}Всё уже на сервере.${C.reset}`)
    mainConn.end()
    return
  }

  const remoteDirs = collectRemoteDirs(toUpload)
  console.log(`Создаю каталоги (${remoteDirs.length})…`)
  await ensureAllDirs(mainConn, remoteDirs)

  const sftpMain = await getSftp(mainConn)

  const progress = makeProgress(totalBytes)
  progress.add(skippedBytes, `${C.dim}skip${C.reset}`)

  let uploaded = 0
  let nextIdx = 0
  let uploadError = null

  async function worker(workerId) {
    let conn
    let sftp
    try {
      if (workerId === 0) {
        conn = mainConn
        sftp = sftpMain
      } else {
        await sleep(workerId * 1000)
        conn = await connect(` #${workerId}`)
        sftp = await getSftp(conn)
      }
      while (true) {
        const i = nextIdx++
        if (i >= toUpload.length) break
        const f = toUpload[i]
        const remote = `${cfg.remoteDir}/${f.rel}`
        progress.tick(f.rel)
        await sftpPutRetry(sftp, f.local, remote)
        uploaded++
        progress.add(f.size)
        progress.tick(f.rel)
      }
    } catch (e) {
      uploadError = e
    } finally {
      if (workerId !== 0 && conn) conn.end()
    }
  }

  const t0 = Date.now()
  await Promise.all(Array.from({ length: CONCURRENCY }, (_, i) => worker(i)))
  progress.finish()

  if (uploadError) throw uploadError

  console.log(`\n${C.green}Заливка завершена${C.reset}: ${uploaded} файлов за ${((Date.now() - t0) / 1000).toFixed(0)}s, пропущено ${skipped}.`)

  await exec(mainConn, `chown -R detdom:detdom ${cfg.remoteDir}`)
  mainConn.end()

  if (!cfg.siteUrl) return

  console.log(`\n${C.cyan}Проверяю доступность…${C.reset}`)
  const mediaSample = [
    ...themeSamples(files, 4),
    ...sample(
      files.filter(
        (f) =>
          /^\d{4}\//.test(f.rel) &&
          /\.(jpe?g|png|webp|gif|svg|pdf|docx?|xlsx?)$/i.test(f.rel),
      ),
      4,
    ),
  ].slice(0, 8)
  const checks = await Promise.all([
    ...mediaSample.map(async (f) => ({
      label: `media/${f.rel}`,
      status: await head(`${cfg.siteUrl}/media/${f.rel.split('/').map(encodeURIComponent).join('/')}`),
    })),
    ...['/', '/news', '/documents'].map(async (p) => ({
      label: `страница ${p}`,
      status: await head(`${cfg.siteUrl}${p}`),
    })),
  ])

  let ok = 0
  for (const c of checks) {
    const good = c.status === 200 || c.status === 206
    if (good) ok++
    const mark = good ? `${C.green}OK${C.reset}` : `${C.red}FAIL${C.reset}`
    console.log(`  [${mark}] ${String(c.status).padEnd(6)} ${c.label}`)
  }
  console.log(`\n${ok === checks.length ? C.green : C.yellow}Проверки: ${ok}/${checks.length}.${C.reset}`)
  if (ok !== checks.length) process.exitCode = 1
}

main().catch((e) => {
  console.error(`\n${C.red}Ошибка:${C.reset}`, e.message || e)
  process.exit(1)
})
