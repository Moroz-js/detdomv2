import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { hero, h2, fileList } from '../_blocks.mjs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const docs = JSON.parse(
  fs.readFileSync(path.join(__dirname, '..', 'parsed', 'documents-by-source.json'), 'utf8'),
)

export default {
  title: 'Клуб «Устойчивая семья»',
  slug: 'klub-ustojchivaya-semya',
  blocks: [
    hero({ heading: 'Клуб «Устойчивая семья»' }),

    h2('Документы', 'docs'),
    fileList('Документы', docs.fc_doc ?? []),

    h2('Положение', 'policy'),
    fileList('Положение', docs.fc_policy ?? []),

    h2('Программы', 'programs'),
    fileList('Программы', docs.fc_program ?? []),
  ],
}
