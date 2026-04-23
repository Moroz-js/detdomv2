import Image from 'next/image'
import Link from 'next/link'
import { RichText } from '@payloadcms/richtext-lexical/react'
import type { SerializedEditorState } from 'lexical'

import { CookieConsentBanner } from '@/components/CookieConsentBanner'
import { ScrollToTopButton } from '@/components/ScrollToTopButton'
import {
  defaultFooterBusBadgeImageAlt,
  defaultFooterBusBadgeImageUrl,
  defaultFooterContactsBody,
  defaultFooterContactsSectionTitle,
  defaultFooterCopyrightOrganization,
  defaultFooterExtraBody,
  defaultFooterNavSectionTitle,
} from '@/lib/footerContentDefaults'

type NavItem = {
  label?: string | null
  href?: string | null
}

const BUS_GOV_HREF = 'https://bus.gov.ru/info-card/291569'

export type FooterContentProps = {
  navSectionTitle?: string | null
  contactsSectionTitle?: string | null
  contactsBody?: unknown
  extraBody?: unknown
  copyrightOrganization?: string | null
  busBadgeImageUrl?: string | null
  busBadgeImageAlt?: string | null
}

function splitFooterNav(items: NavItem[] | null | undefined) {
  if (!items?.length) return { left: [] as NavItem[], right: [] as NavItem[], busGov: null as NavItem | null }
  const busGov = items.find((i) => String(i.href || '').toLowerCase().includes('bus.gov')) ?? null
  const main = items.filter((i) => i !== busGov)
  const mid = Math.ceil(main.length / 2)
  return {
    left: main.slice(0, mid),
    right: main.slice(mid),
    busGov,
  }
}

export function SiteFooter({
  items,
  footer,
}: {
  items: NavItem[] | null | undefined
  footer: FooterContentProps | null | undefined
}) {
  const { left, right, busGov } = splitFooterNav(items)
  const busHref = busGov?.href || BUS_GOV_HREF

  const navTitle = footer?.navSectionTitle || defaultFooterNavSectionTitle
  const contactsTitle = footer?.contactsSectionTitle || defaultFooterContactsSectionTitle
  const contactsBody = (footer?.contactsBody ?? defaultFooterContactsBody()) as unknown as SerializedEditorState
  const extraBody = (footer?.extraBody ?? defaultFooterExtraBody()) as unknown as SerializedEditorState
  const copyrightOrg = footer?.copyrightOrganization || defaultFooterCopyrightOrganization
  const badgeUrl = footer?.busBadgeImageUrl || defaultFooterBusBadgeImageUrl
  const badgeAlt = footer?.busBadgeImageAlt || defaultFooterBusBadgeImageAlt

  const proseFooterContacts =
    'prose prose-invert max-w-none text-[11px] leading-snug text-zinc-300 prose-p:my-1.5 prose-p:text-[11px] prose-p:leading-snug prose-p:text-zinc-300 prose-li:text-[11px] prose-a:text-teal-300 prose-a:text-[11px] prose-a:no-underline hover:prose-a:underline'

  const proseFooterExtra =
    'prose prose-invert max-w-none text-[11px] leading-snug text-zinc-300 prose-p:my-1.5 prose-p:text-[11px] prose-p:leading-snug prose-p:text-zinc-300 prose-li:text-[11px] prose-a:text-teal-300 prose-a:text-[11px] prose-a:no-underline hover:prose-a:underline'

  return (
    <>
      <footer className="mt-auto bg-[#1a1a1a] text-white">
        <div className="h-2 w-full shrink-0 bg-teal-500" aria-hidden />
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3 lg:gap-10 xl:gap-12">
            <section>
              <h2 className="mb-3 text-sm font-bold tracking-tight text-white">{navTitle}</h2>
              <div className="grid grid-cols-2 gap-x-5 gap-y-1.5 text-xs leading-snug">
                <ul className="space-y-1.5">
                  {left.map((item, i) => (
                    <li key={`fl-${item.href}-${i}`}>
                      <Link
                        href={String(item.href || '#')}
                        className="text-zinc-300 transition-colors hover:text-white"
                      >
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
                <ul className="space-y-1.5">
                  {right.map((item, i) => (
                    <li key={`fr-${item.href}-${i}`}>
                      <Link
                        href={String(item.href || '#')}
                        className="text-zinc-300 transition-colors hover:text-white"
                      >
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </section>

            <section>
              <h2 className="mb-3 text-sm font-bold tracking-tight text-white">{contactsTitle}</h2>
              <div className={proseFooterContacts}>
                <RichText data={contactsBody} />
              </div>
            </section>

            <section className="lg:pt-6">
              <div className={proseFooterExtra}>
                <RichText data={extraBody} />
              </div>
            </section>
          </div>

          <div className="mt-8 border-t border-white/10 pt-6">
            <div className="flex flex-col items-center gap-5 md:flex-row md:items-center md:justify-between md:gap-6">
              <p className="max-w-md text-center text-[11px] leading-snug text-zinc-400 md:text-left">
                {copyrightOrg}, {new Date().getFullYear()} г.
              </p>
              <div className="flex shrink-0 justify-center md:flex-1">
                <a
                  href={String(busHref)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block rounded-md bg-white p-1.5 shadow-md ring-1 ring-black/5 transition-opacity hover:opacity-95"
                  aria-label="Результаты независимой оценки качества оказания услуг на bus.gov.ru"
                >
                  <Image
                    src={badgeUrl}
                    alt={badgeAlt}
                    width={260}
                    height={88}
                    className="h-auto w-full max-w-[220px] object-contain sm:max-w-[240px]"
                    unoptimized
                  />
                </a>
              </div>
            </div>
          </div>
        </div>
      </footer>
      <ScrollToTopButton />
      <CookieConsentBanner />
    </>
  )
}
