'use client'

import Link from 'next/link'
import { useCallback, useEffect, useId, useState } from 'react'

import { cn } from '@/lib/utils'

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
    <span className="flex w-5 flex-col justify-center gap-[5px]" aria-hidden>
      <span className="block h-0.5 w-full rounded-full bg-current" />
      <span className="block h-0.5 w-full rounded-full bg-current" />
      <span className="block h-0.5 w-full rounded-full bg-current" />
    </span>
  )
}

function CloseMenuIcon() {
  return (
    <span className="relative flex h-5 w-5 items-center justify-center" aria-hidden>
      <span className="absolute block h-0.5 w-5 rotate-45 rounded-full bg-current" />
      <span className="absolute block h-0.5 w-5 -rotate-45 rounded-full bg-current" />
    </span>
  )
}

const SOCIAL = [
  { label: 'Одноклассники', href: 'https://ok.ru/group/70000002291664', short: 'OK' },
  { label: 'ВКонтакте', href: 'https://vk.com/public219812778', short: 'VK' },
  { label: 'Telegram', href: 'https://t.me/Kgkydduss', short: 'TG' },
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

export function SiteHeader({ items }: { items: NavItem[] | null | undefined }) {
  const [open, setOpen] = useState(false)
  const panelId = useId()
  const close = useCallback(() => setOpen(false), [])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close()
    }
    document.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
    }
  }, [open, close])

  if (!items?.length) return null

  return (
    <>
      <div className="sticky top-0 z-50">
        {/* Верхняя полоса контактов */}
        <div className="border-b border-stone-200/90 bg-white text-stone-700">
          <div className="mx-auto grid w-full max-w-5xl grid-cols-2 gap-x-3 gap-y-2.5 px-4 py-2 text-xs sm:grid-cols-4 sm:gap-x-0 sm:text-sm">
            <div className="flex min-h-9 items-center justify-center gap-2 sm:min-h-0">
              {SOCIAL.map(({ label, href, short }) => (
                <a
                  key={href}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-stone-600 underline-offset-2 transition-colors hover:text-stone-900 hover:underline"
                  aria-label={label}
                >
                  {short}
                </a>
              ))}
            </div>
            <span className="flex min-h-9 items-center justify-center gap-1.5 text-center text-stone-600 sm:min-h-0">
              <MapPinIcon className="h-4 w-4 shrink-0 text-stone-500" />
              Уссурийск
            </span>
            <Link
              href="/contacts"
              className="flex min-h-9 items-center justify-center gap-1.5 text-center text-stone-700 underline-offset-2 transition-colors hover:text-stone-950 hover:underline sm:min-h-0"
            >
              <MailIcon className="h-4 w-4 shrink-0 text-stone-500" />
              Написать нам
            </Link>
            <span className="flex min-h-9 items-center justify-center text-center text-stone-600 tabular-nums sm:min-h-0 sm:whitespace-nowrap">
              Пн–Сб 9:00–18:00
            </span>
          </div>
          <div className="flex h-1 w-full">
            <div className="flex-1 bg-teal-500" aria-hidden />
            <div className="flex-1 bg-stone-700" aria-hidden />
            <div className="flex-1 bg-amber-400" aria-hidden />
          </div>
        </div>

        <header className="border-b border-stone-900/10 bg-[#f6f5f1]/90 shadow-[0_6px_28px_-8px_rgba(28,25,23,0.18),0_1px_0_rgba(255,255,255,0.6)_inset] backdrop-blur-md supports-[backdrop-filter]:bg-[#f6f5f1]/80">
          <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-3.5">
            <button
              type="button"
              className="inline-flex h-10 shrink-0 items-center gap-2 rounded-md border border-stone-400/60 bg-white/90 px-3 text-stone-800 shadow-sm transition-colors hover:border-stone-500 hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stone-800"
              aria-expanded={open}
              aria-controls={panelId}
              aria-label={open ? 'Закрыть меню' : 'Открыть меню'}
              onClick={() => setOpen((v) => !v)}
            >
              {open ? <CloseMenuIcon /> : <BurgerIcon />}
              <span className="text-sm font-medium">Меню</span>
            </button>
            <button
              type="button"
              className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-md border border-dashed border-stone-400/70 bg-white/70 text-stone-600 shadow-sm transition-colors hover:border-stone-500 hover:bg-white hover:text-stone-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stone-800 disabled:cursor-not-allowed disabled:opacity-60"
              title="Версия для слабовидящих — в разработке"
              aria-label="Версия для слабовидящих. Раздел в разработке."
              disabled
            >
              <GlassesIcon className="h-6 w-6" />
            </button>
          </div>
        </header>
      </div>

      <button
        type="button"
        aria-label="Закрыть меню"
        className={cn(
          'fixed inset-0 z-[60] bg-stone-950/45 transition-opacity duration-300',
          open ? 'opacity-100' : 'pointer-events-none opacity-0',
        )}
        onClick={close}
      />

      <div
        id={panelId}
        className={cn(
          'fixed left-0 top-0 z-[70] flex h-full w-full max-w-sm flex-col border-r border-stone-200/90 bg-[#f4f3ef] shadow-[8px_0_32px_-8px_rgba(28,25,23,0.2)] transition-transform duration-300 ease-out',
          open ? 'translate-x-0' : 'pointer-events-none -translate-x-full',
        )}
        role="dialog"
        aria-modal={open}
        aria-hidden={!open}
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
        <nav className="flex-1 overflow-y-auto px-2 py-4">
          <ul className="flex flex-col gap-1 text-[15px]">
            {items.map((item, i) => (
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
    </>
  )
}
