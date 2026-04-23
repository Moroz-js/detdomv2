import { lexicalFromParagraphs } from './lexicalPlain.ts'

export const defaultFooterNavSectionTitle = 'Основные разделы'
export const defaultFooterContactsSectionTitle = 'Контакты'

export function defaultFooterContactsBody() {
  return lexicalFromParagraphs([
    '692524, Приморский край, г. Уссурийск, ул. Фадеева, 20.',
    'detskiydom2ussur@mail.ru',
    'График работы: с 9-00 до 18-00 выходной воскресенье',
    'Режим работы учреждения: круглосуточно, круглогодично',
  ])
}

export function defaultFooterExtraBody() {
  return lexicalFromParagraphs([
    'Местонахождение Учреждения: Приморский край, г. Уссурийск, ул. Фадеева, 20; ул. Комсомольская, 53.',
    'Тел./факс: 8(4234) 33-11-90; 8(4234) 33-26-24 (ул. Фадеева, 20) время доступа к телефону с 08.00 до 20.00 час.; 8(4234) 34-71-49; 8(4234) 34-64-49 (ул. Комсомольская, 53)',
    'Директор КГКУ «Комплексный центр помощи семье и детям г. Уссурийска»: Жовниренко Игорь Анатольевич',
  ])
}

export const defaultFooterCopyrightOrganization =
  'КГКУ «Комплексный центр помощи семье и детям г. Уссурийска»'

export const defaultFooterBusBadgeImageUrl =
  'https://detskiydomuss.ru/wp-content/themes/detdom/assets/img/footer-image.png'

export const defaultFooterBusBadgeImageAlt =
  'bus.gov.ru — результаты независимой оценки качества оказания услуг'
