/**
 * Меню шапки и подвала — content-map §2.1–2.2, header.php / footer.php.
 */

export type NavChild = { label: string; href: string }

export type HeaderNavItem = {
  label: string
  href: string
  children?: NavChild[]
}

export const headerNav: HeaderNavItem[] = [
  { label: 'Главная', href: '/' },
  { label: 'О нас', href: '/about' },
  {
    label: 'Сведения о образовательной организации',
    href: '/info',
    children: [
      { label: 'Основные сведения', href: '/info#main' },
      { label: 'Структура и органы управления', href: '/info#structure' },
      { label: 'Органы управления', href: '/info#control' },
      { label: 'Документы', href: '/info#documents' },
      { label: 'Образование', href: '/info#education' },
      { label: 'Образовательные стандарты', href: '/info#standarts' },
      { label: 'Руководство. Педагогический состав', href: '/info#personal' },
      { label: 'Материально-техническая база', href: '/info#base' },
      { label: 'Стипендии и иные меры социальной поддержки', href: '/info#scholarship' },
      { label: 'Платные образовательные услуги', href: '/info#paid-education' },
      { label: 'Финансово-хозяйственная деятельность', href: '/info#finance' },
      { label: 'Доступная среда', href: '/info#environment' },
      { label: 'Международное сотрудничество', href: '/info#cooperation' },
      { label: 'Организация питания', href: '/info#nutrition' },
    ],
  },
  { label: 'Контакты', href: '/contacts' },
  { label: 'Документы', href: '/documents' },
  { label: 'Новости', href: '/news' },
  { label: 'Безопасность', href: '/security' },
  {
    label:
      'Служба психолого-педагогического и социального сопровождения замещающих семей',
    href: '/psychology',
  },
  { label: 'Служба «Дети в семье»', href: '/sluzhba-deti-v-seme' },
  { label: 'Клуб «Устойчивая семья»', href: '/klub-ustojchivaya-semya' },
  { label: 'Служба медиации', href: '/mediation' },
  { label: 'Служба постинтернатного сопровождения', href: '/socials' },
  { label: '«Во имя добра»', href: '/goodness' },
  { label: 'Достижения', href: '/achievements' },
  { label: 'Семейный МФЦ', href: '/mfc' },
  { label: 'Противодействие коррупции', href: '/anticorruption' },
]

export const footerNav: NavChild[] = [
  { label: 'Главная', href: '/' },
  { label: 'Новости', href: '/news' },
  { label: 'Документы', href: '/documents' },
  { label: 'Безопасность', href: '/security' },
  { label: 'О нас', href: '/about' },
  { label: 'Контакты', href: '/contacts' },
  {
    label:
      'Служба психолого-педагогического и социального сопровождения замещающих семей',
    href: '/psychology',
  },
  { label: 'Сведения о образовательной организации', href: '/info' },
  { label: 'Служба постинтернатного сопровождения', href: '/socials' },
  { label: '«Во имя добра»', href: '/goodness' },
]
