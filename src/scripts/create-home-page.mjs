import fs from 'node:fs'
import path from 'node:path'
import pg from 'pg'

const envPath = path.resolve(process.cwd(), '.env')
for (const line of fs.readFileSync(envPath, 'utf8').split('\n')) {
  const trimmed = line.trim()
  if (!trimmed || trimmed.startsWith('#')) continue
  const eq = trimmed.indexOf('=')
  if (eq === -1) continue
  const key = trimmed.slice(0, eq).trim()
  const value = trimmed.slice(eq + 1).trim()
  if (!process.env[key]) process.env[key] = value
}

const connectionString = process.env.DATABASE_URI || process.env.DATABASE_URL
const client = new pg.Client({
  connectionString,
  ssl: connectionString?.includes('localhost') ? undefined : { rejectUnauthorized: false },
})

await client.connect()

const exists = await client.query(`SELECT id FROM pages WHERE slug = 'home' LIMIT 1`)
if (exists.rows.length) {
  console.log(`Страница home уже есть (id=${exists.rows[0].id})`)
} else {
  const inserted = await client.query(
    `INSERT INTO pages (title, slug, _status, created_at, updated_at)
     VALUES ('Главная', 'home', 'published', NOW(), NOW())
     RETURNING id`,
  )
  console.log(`Создана пустая страница home (id=${inserted.rows[0].id})`)
}

await client.end()
