import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { hero, h2, slider, fileList } from '../_blocks.mjs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const slides = JSON.parse(
  fs.readFileSync(path.join(__dirname, '..', 'parsed', 'cs-slider.json'), 'utf8'),
)
const docs = JSON.parse(
  fs.readFileSync(path.join(__dirname, '..', 'parsed', 'documents-by-source.json'), 'utf8'),
)

export default {
  title: 'Служба «Дети в семье»',
  slug: 'sluzhba-deti-v-seme',
  blocks: [
    hero({ heading: 'Служба «Дети в семье»' }),

    slider(slides.map((s) => ({ imageUrl: s.imageUrl, alt: s.title }))),

    h2('Документы', 'docs'),
    fileList('Документы', docs.cs_doc ?? []),

    h2('Положение', 'policy'),
    fileList('Положение', docs.cs_policy ?? []),
  ],
}
