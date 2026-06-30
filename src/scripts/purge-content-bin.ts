import fs from 'node:fs'
import path from 'node:path'
import pg from 'pg'

const KEEP_TABLES = new Set(['users', 'users_sessions', 'payload_migrations'])

function loadEnvFile() {
  const envPath = path.resolve(process.cwd(), '.env')
  if (!fs.existsSync(envPath)) return
  for (const line of fs.readFileSync(envPath, 'utf8').split('\n')) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const eq = trimmed.indexOf('=')
    if (eq === -1) continue
    const key = trimmed.slice(0, eq).trim()
    const value = trimmed.slice(eq + 1).trim()
    if (!process.env[key]) process.env[key] = value
  }
}

export async function script() {
  loadEnvFile()
  const connectionString = process.env.DATABASE_URI || process.env.DATABASE_URL
  if (!connectionString) {
    throw new Error('DATABASE_URL или DATABASE_URI не задан')
  }

  console.log('Очистка контента в PostgreSQL (без schema push)…')
  const client = new pg.Client({
    connectionString,
    ssl: connectionString.includes('localhost') ? undefined : { rejectUnauthorized: false },
  })
  await client.connect()

  const { rows } = await client.query<{ tablename: string }>(
    `SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename`,
  )

  let truncated = 0
  for (const { tablename } of rows) {
    if (KEEP_TABLES.has(tablename)) continue
    await client.query(`TRUNCATE TABLE public."${tablename.replace(/"/g, '""')}" CASCADE`)
    console.log(`  ${tablename}`)
    truncated++
  }

  for (const globalTable of ['header_nav', 'footer_nav', 'footer_content']) {
    const { rows: countRows } = await client.query<{ n: number }>(
      `SELECT COUNT(*)::int AS n FROM public."${globalTable.replace(/"/g, '""')}"`,
    )
    if (countRows[0]?.n === 0) {
      await client.query(`INSERT INTO public."${globalTable.replace(/"/g, '""')}" DEFAULT VALUES`)
    }
  }

  await client.end()
  console.log(`Готово: очищено таблиц ${truncated}. Пользователи админки сохранены.`)
}
