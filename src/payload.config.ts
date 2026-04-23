import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
import sharp from 'sharp'

import { Media } from './collections/Media.ts'
import { News } from './collections/News.ts'
import { Pages } from './collections/Pages.ts'
import { Users } from './collections/Users.ts'
import { FooterContent } from './globals/FooterContent.ts'
import { FooterNav } from './globals/FooterNav.ts'
import { HeaderNav } from './globals/HeaderNav.ts'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  bin: [
    {
      key: 'seed',
      scriptPath: path.resolve(dirname, 'scripts/seed-bin.ts'),
    },
  ],
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
    livePreview: {
      breakpoints: [
        { label: 'Мобильный', name: 'mobile', width: 375, height: 667 },
        { label: 'Планшет', name: 'tablet', width: 768, height: 1024 },
        { label: 'Десктоп', name: 'desktop', width: 1440, height: 900 },
      ],
    },
  },
  collections: [Users, Media, Pages, News],
  globals: [HeaderNav, FooterNav, FooterContent],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: postgresAdapter({
    migrationDir: path.resolve(dirname, 'migrations'),
    pool: {
      connectionString: process.env.DATABASE_URI || process.env.DATABASE_URL || '',
    },
  }),
  sharp,
  plugins: [],
})
