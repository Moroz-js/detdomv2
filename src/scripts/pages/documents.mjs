import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { hero, h2, fileList } from '../_blocks.mjs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const docs = JSON.parse(
  fs.readFileSync(path.join(__dirname, '..', 'parsed', 'documents-by-source.json'), 'utf8'),
)

const PRESCHOOL_BASE =
  'https://detskiydomuss.ru/wp-content/themes/detdom/documents/documents/'

const PRESCHOOL = [
  ['Вводная часть', 'int.pdf'],
  ['Физическая культура', 'physical.pdf'],
  ['Комплексно-тематическое планирование', 'tematic.pdf'],
  ['Безопасность', 'security.pdf'],
  ['Труд', 'work.pdf'],
  ['Познание', 'cognition.pdf'],
  ['Коммуникация', 'communication.pdf'],
  ['Художественное творчество', 'creation.pdf'],
  ['Музыка', 'music.pdf'],
].map(([title, fname]) => ({
  title,
  fileUrl: PRESCHOOL_BASE + fname,
  fileExt: 'pdf',
}))

export default {
  title: 'Планы, программы, отчёты',
  slug: 'documents',
  blocks: [
    hero({ heading: 'Планы, программы, отчёты' }),

    h2('Планы', 'plans'),
    fileList('Планы', docs.plan ?? []),

    h2('Программы', 'programs'),
    fileList('Программы', docs.program ?? []),

    h2('Программы дошкольного образования', 'preschool'),
    fileList('Программы дошкольного образования', PRESCHOOL),
  ],
}
