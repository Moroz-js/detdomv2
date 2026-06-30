import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { hero, h2, content, slider, container, image, fileList } from '../_blocks.mjs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const BASE = 'https://detskiydomuss.ru/wp-content/themes/detdom/'
const DOCS = BASE + 'documents/security/'

const slides = JSON.parse(
  fs.readFileSync(path.join(__dirname, '..', 'parsed', 'security-slider.json'), 'utf8'),
)

const slideItems = slides.map((s) => ({ imageUrl: s.imageUrl, alt: s.title }))

export default {
  title: 'Безопасность',
  slug: 'security',
  blocks: [
    hero({ heading: 'Безопасность' }),

    container({
      columns: '2',
      columnsBlocks: [
        [
          h2('Всероссийский телефон доверия', 'trust-phone'),
          image({
            imageUrl: BASE + 'assets/img/security-1.png',
            alt: 'Всероссийский телефон доверия',
          }),
        ],
        [
          h2('Осторожно, мошенники!', 'scammers'),
          slider(slideItems),
        ],
      ],
    }),

    h2(
      'Куда обращаться в случае совершения противоправных действий в отношении несовершеннолетних',
      'contacts',
    ),
    container({
      columns: '3',
      columnsBlocks: [
        [
          content([
            `Телефонная линия «Ребенок в опасности» — 121/123 (для любых операторов мобильной связи) 8 (950) 295-21-10`,
            `Горячая линия уполномоченного по правам ребенка в Приморском крае — 8 (423) 249-72-68`,
          ]),
        ],
        [
          content([
            `Социально-реабилитационный центр для несовершеннолетних «Парус надежды» — 8 (423) 220-65-73`,
            `Кризисный адаптационный центр «Мир ребенка» — 8-800-2000-122`,
            `Детский телефон доверия 8-800-100-12-60`,
          ]),
        ],
        [
          content([
            `Школьники так часто сталкиваются со множеством вызовов: учёба, друзья, отношения…`,
            `Иногда сложно справиться с трудностями в одиночку. Для этого существует «Детский телефон доверия» – служба психологической поддержки, где всегда готовы выслушать и помочь.`,
            `Получить совет, поддержку и помощь можно по телефонам — 8-800-2000-122. Короткий номер — 124.`,
            `Звонки бесплатные, анонимные и конфиденциальные.`,
          ]),
        ],
      ],
    }),

    h2('Памятки', 'memos'),
    fileList('Памятки', [
      {
        title: 'Памятка о видах преступных посягательств',
        fileUrl: DOCS + 'security-2.pdf',
        fileExt: 'pdf',
      },
      {
        title: 'Памятка о безопасности в интернете',
        fileUrl: DOCS + 'security-3.pdf',
        fileExt: 'pdf',
      },
      {
        title: 'Доверенный контакт',
        fileUrl: encodeURI(DOCS + 'Сайт доверительный контакт.docx'),
        fileExt: 'docx',
      },
    ]),
  ],
}
