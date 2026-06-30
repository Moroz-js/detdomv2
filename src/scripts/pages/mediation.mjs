import { hero, h2, fileList } from '../_blocks.mjs'

export default {
  title: 'Служба медиации',
  slug: 'mediation',
  blocks: [
    hero({
      heading: 'Служба медиации',
      subtitle: 'Документы по работе службы медиации.',
    }),
    h2('Документы'),
    fileList('Документы службы медиации', [
      {
        title: 'Положение по службе медиации 2026',
        fileUrl: '/assets/documents/mediation/polozhenie-po-sluzhbe-mediacii-2026.pdf',
        fileExt: 'pdf',
      },
      {
        title: 'Приказ о создании службы медаиции',
        fileUrl: '/assets/documents/mediation/prikaz-o-sozdanii-sluzhby-mediaicii.pdf',
        fileExt: 'pdf',
      },
      {
        title: 'Приказ по службе медиации 2026',
        fileUrl: '/assets/documents/mediation/prikaz-po-sluzhbe-mediacii-2026.pdf',
        fileExt: 'pdf',
      },
    ]),
  ],
}
