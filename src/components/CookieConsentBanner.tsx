'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'

const STORAGE_KEY = 'detdom-cookie-consent'

const CONSULTANT_ARTICLE_URL =
  'https://www.consultant.ru/document/cons_doc_LAW_61801/6c94959bc017ac80140621762d2ac59f6006b08c/'

export function CookieConsentBanner() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    try {
      if (typeof window !== 'undefined' && localStorage.getItem(STORAGE_KEY) !== '1') {
        setVisible(true)
      }
    } catch {
      setVisible(true)
    }
  }, [])

  useEffect(() => {
    if (!visible) {
      document.body.classList.remove('pb-[8.5rem]')
      return
    }
    document.body.classList.add('pb-[8.5rem]')
    return () => document.body.classList.remove('pb-[8.5rem]')
  }, [visible])

  const accept = () => {
    try {
      localStorage.setItem(STORAGE_KEY, '1')
    } catch {
      /* ignore */
    }
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div
      className="fixed inset-x-0 bottom-0 z-[100] border-t border-teal-600/80 bg-[#141414] px-4 py-4 text-stone-300 shadow-[0_-8px_32px_rgba(0,0,0,0.35)] md:px-6 md:py-5"
      role="dialog"
      aria-label="Согласие на обработку cookie"
    >
      <div className="mx-auto flex max-w-5xl flex-col gap-4 lg:flex-row lg:items-end lg:gap-6">
        <div className="max-h-[min(42vh,20rem)] flex-1 overflow-y-auto text-xs leading-relaxed sm:text-sm sm:leading-relaxed">
          <p>
            Продолжая использовать наш сайт, вы даете согласие на обработку файлов cookie, пользовательских данных (тип
            и версия ОС; тип и версия Браузера; тип устройства и разрешение его экрана; источник откуда пришел на сайт
            пользователь; с какого сайта или по какой рекламе; язык ОС и Браузера; какие страницы открывает и на какие
            кнопки нажимает пользователь; ip-адрес) в целях функционирования сайта, проведения ретаргетинга и
            проведения статистических исследований и обзоров. Если вы не хотите, чтобы ваши данные обрабатывались,
            покиньте сайт.
          </p>
          <p className="mt-2">
            <Link
              href={CONSULTANT_ARTICLE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-teal-400 underline-offset-2 hover:text-teal-300 hover:underline"
            >
              (требование ФЗ №152. Статья 9 &quot;Согласие субъекта персональных данных на обработку его персональных
              данных&quot;)
            </Link>
          </p>
        </div>
        <button
          type="button"
          className="shrink-0 rounded-md bg-teal-600 px-6 py-2.5 text-sm font-semibold text-white shadow-md transition-colors hover:bg-teal-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          onClick={accept}
        >
          Принять
        </button>
      </div>
    </div>
  )
}
