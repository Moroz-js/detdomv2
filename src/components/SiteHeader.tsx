'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useCallback, useEffect, useId, useState } from 'react'
import { createPortal } from 'react-dom'

import { cn } from '@/lib/utils'

import { useVisionAccessibility } from '@/components/VisionAccessibilityProvider'
import { VisionAccessibilityToolbar } from '@/components/VisionAccessibilityToolbar'

type NavItem = {
  label?: string | null
  href?: string | null
  children?: NavItem[] | null
}

function GlassesIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <circle cx="7" cy="14" r="3.25" />
      <circle cx="17" cy="14" r="3.25" />
      <path d="M3.5 14h0.75M19.75 14H21M10.25 14h3.5" />
      <path d="M3.5 13.5 5 8.5c.5-1 1.2-1.75 2.75-1.75h8.5c1.55 0 2.25.75 2.75 1.75l1.5 5" />
    </svg>
  )
}

function BurgerIcon() {
  return (
    <span className="flex w-4 flex-col justify-center gap-[4px]" aria-hidden>
      <span className="block h-0.5 w-full rounded-full bg-current" />
      <span className="block h-0.5 w-full rounded-full bg-current" />
      <span className="block h-0.5 w-full rounded-full bg-current" />
    </span>
  )
}

function CloseMenuIcon() {
  return (
    <span className="relative flex h-4 w-4 items-center justify-center" aria-hidden>
      <span className="absolute block h-0.5 w-4 rotate-45 rounded-full bg-current" />
      <span className="absolute block h-0.5 w-4 -rotate-45 rounded-full bg-current" />
    </span>
  )
}

const headerShell = 'mx-auto w-full max-w-[1440px] px-6'
const headerBarClass = `${headerShell} flex items-center justify-between gap-3`

const SOCIAL = [
  { label: 'Одноклассники', href: 'https://ok.ru/group/70000002291664', icon: '/icons/ok.png' },
  { label: 'ВКонтакте', href: 'https://vk.com/public219812778', icon: '/icons/vk.png' },
  { label: 'Telegram', href: 'https://t.me/Kgkydduss', icon: '/icons/tg.png' },
] as const

function MapPinIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <path d="M12 21s7-4.35 7-11a7 7 0 1 0-14 0c0 6.65 7 11 7 11Z" strokeLinejoin="round" />
      <circle cx="12" cy="10" r="2.25" />
    </svg>
  )
}

function MailIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <path d="M4 6h16v12H4z" strokeLinejoin="round" />
      <path d="m4 7 8 6 8-6" />
    </svg>
  )
}

function lockBodyScroll() {
  document.documentElement.classList.add('site-menu-open')
}

function unlockBodyScroll() {
  document.documentElement.classList.remove('site-menu-open')
}

export function SiteHeader({ items }: { items: NavItem[] | null | undefined }) {
  const [open, setOpen] = useState(false)
  const [portalReady, setPortalReady] = useState(false)
  const panelId = useId()
  const close = useCallback(() => setOpen(false), [])
  const { enabled: visionEnabled, toggleEnabled: toggleVision } = useVisionAccessibility()

  useEffect(() => {
    setPortalReady(true)
  }, [])

  useEffect(() => {
    if (!open) return

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close()
    }
    document.addEventListener('keydown', onKey)
    const preventTouchScroll = (e: TouchEvent) => {
      const panel = document.getElementById(panelId)
      if (panel?.contains(e.target as Node)) return
      e.preventDefault()
    }
    document.addEventListener('touchmove', preventTouchScroll, { passive: false })
    lockBodyScroll()

    return () => {
      document.removeEventListener('keydown', onKey)
      document.removeEventListener('touchmove', preventTouchScroll)
      unlockBodyScroll()
    }
  }, [open, close, panelId])

  const navItems = items ?? []

  return (
    <>
      <div data-site-header-sticky className="sticky top-0 z-50 w-full">
        <div data-site-header-top className="border-b border-stone-200/90 bg-white text-stone-700">
          <div className={`${headerBarClass} hidden py-1.5 text-[11px] sm:flex sm:text-xs`}>
            <div className="flex shrink-0 items-center gap-0.5">
              {SOCIAL.map(({ label, href, icon }) => (
                <a
                  key={href}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-7 w-7 items-center justify-center rounded text-stone-600 transition-opacity hover:opacity-80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stone-800"
                  aria-label={label}
                >
                  <Image
                    src={icon}
                    alt=""
                    width={18}
                    height={18}
                    className="h-[18px] w-[18px]"
                    data-vision-keep
                  />
                </a>
              ))}
            </div>
            <div className="flex min-w-0 flex-1 items-center justify-center gap-3 px-2 text-stone-600 sm:gap-5">
              <span className="inline-flex items-center gap-1 whitespace-nowrap">
                <MapPinIcon className="h-3.5 w-3.5 shrink-0 text-stone-500" />
                Уссурийск
              </span>
              <Link
                href="/contacts"
                className="inline-flex items-center gap-1 whitespace-nowrap text-stone-700 underline-offset-2 transition-colors hover:text-stone-950 hover:underline"
              >
                <MailIcon className="h-3.5 w-3.5 shrink-0 text-stone-500" />
                Написать нам
              </Link>
            </div>
            <span className="shrink-0 whitespace-nowrap tabular-nums text-stone-600">Пн–Сб 9:00–18:00</span>
          </div>
          <div className={`${headerShell} grid grid-cols-2 gap-x-3 gap-y-1 py-1.5 text-[11px] sm:hidden`}>
            <div className="flex items-center justify-start gap-0.5">
              {SOCIAL.map(({ label, href, icon }) => (
                <a
                  key={href}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-7 w-7 items-center justify-center rounded text-stone-600 transition-opacity hover:opacity-80"
                  aria-label={label}
                >
                  <Image
                    src={icon}
                    alt=""
                    width={18}
                    height={18}
                    className="h-[18px] w-[18px]"
                    data-vision-keep
                  />
                </a>
              ))}
            </div>
            <span className="flex items-center justify-end whitespace-nowrap tabular-nums text-stone-600">
              Пн–Сб 9:00–18:00
            </span>
            <span className="inline-flex items-center justify-start gap-1 text-stone-600">
              <MapPinIcon className="h-3.5 w-3.5 shrink-0 text-stone-500" />
              Уссурийск
            </span>
            <Link
              href="/contacts"
              className="inline-flex items-center justify-end gap-1 text-stone-700 underline-offset-2 hover:underline"
            >
              <MailIcon className="h-3.5 w-3.5 shrink-0 text-stone-500" />
              Написать нам
            </Link>
          </div>
          <div className="flex h-0.5 w-full">
            <div className="flex-1 bg-teal-500" aria-hidden />
            <div className="flex-1 bg-stone-700" aria-hidden />
            <div className="flex-1 bg-amber-400" aria-hidden />
          </div>
        </div>

        <header
          data-site-header-main
          className="border-b border-stone-900/10 bg-[#f6f5f1]/90 shadow-[0_4px_20px_-8px_rgba(28,25,23,0.16),0_1px_0_rgba(255,255,255,0.6)_inset] backdrop-blur-md supports-[backdrop-filter]:bg-[#f6f5f1]/80"
        >
          <div className={`${headerBarClass} py-2`}>
            <button
              type="button"
              className="inline-flex h-8 shrink-0 items-center gap-1.5 rounded-md border border-stone-400/60 bg-white/90 px-2.5 text-stone-800 shadow-sm transition-colors hover:border-stone-500 hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stone-800"
              aria-expanded={open}
              aria-controls={panelId}
              aria-label={open ? 'Закрыть меню' : 'Открыть меню'}
              onClick={() => setOpen((v) => !v)}
            >
              {open ? <CloseMenuIcon /> : <BurgerIcon />}
              <span className="text-xs font-medium">Меню</span>
            </button>
            <button
              type="button"
              className={cn(
                'inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md border bg-white/90 text-stone-800 shadow-sm transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stone-800',
                visionEnabled
                  ? 'border-stone-900 bg-stone-900 text-white hover:bg-stone-800'
                  : 'border-dashed border-stone-400/70 text-stone-600 hover:border-stone-500 hover:bg-white hover:text-stone-800',
              )}
              title={visionEnabled ? 'Выключить версию для слабовидящих' : 'Включить версию для слабовидящих'}
              aria-label={
                visionEnabled ? 'Выключить версию для слабовидящих' : 'Включить версию для слабовидящих'
              }
              aria-pressed={visionEnabled}
              onClick={toggleVision}
            >
              <GlassesIcon className="h-[18px] w-[18px]" />
            </button>
          </div>
        </header>
        <VisionAccessibilityToolbar />
      </div>

      {portalReady && open
        ? createPortal(
            <>
              <button
                type="button"
                aria-label="Закрыть меню"
                className="site-menu-overlay z-[100]"
                onClick={close}
              />

              <div
                id={panelId}
                className="site-menu-panel z-[110]"
                role="dialog"
                aria-modal
                aria-label="Навигация по сайту"
              >
                <div className="flex items-center justify-between border-b border-stone-200/80 px-4 py-3">
                  <span className="text-sm font-semibold uppercase tracking-wide text-stone-500">Меню</span>
                  <button
                    type="button"
                    className="inline-flex h-9 w-9 items-center justify-center rounded-md text-stone-600 transition-colors hover:bg-stone-200/60 hover:text-stone-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stone-800"
                    aria-label="Закрыть"
                    onClick={close}
                  >
                    <CloseMenuIcon />
                  </button>
                </div>
                <nav className="flex-1 overflow-y-auto overscroll-contain px-2 py-4">
                  {navItems.length === 0 ? (
                    <p className="px-3 py-2 text-sm text-stone-500">
                      Пункты меню настраиваются в админке Payload.
                    </p>
                  ) : null}
                  <ul className="flex flex-col gap-1 text-[15px]">
                    {navItems.map((item, i) => (
                      <li key={`${item.href}-${i}`} className="rounded-lg">
                        <Link
                          className="block rounded-md px-3 py-2.5 font-medium text-stone-800 transition-colors hover:bg-stone-200/50 hover:text-stone-950"
                          href={String(item.href || '#')}
                          onClick={close}
                        >
                          {item.label}
                        </Link>
                        {item.children?.length ? (
                          <ul className="ml-2 border-l border-stone-300/90 py-1 pl-2">
                            {item.children.map((ch, j) => (
                              <li key={`${ch.href}-${j}`}>
                                <Link
                                  className="block rounded-md px-3 py-2 text-stone-600 transition-colors hover:bg-stone-200/40 hover:text-stone-900"
                                  href={String(ch.href || '#')}
                                  onClick={close}
                                >
                                  {ch.label}
                                </Link>
                              </li>
                            ))}
                          </ul>
                        ) : null}
                      </li>
                    ))}
                  </ul>
                </nav>
              </div>
            </>,
            document.body,
          )
        : null}
    </>
  )
}
