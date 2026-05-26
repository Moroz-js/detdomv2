'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'

import { formatRuPhoneMask, isRuPhoneComplete, RU_PHONE_PLACEHOLDER } from '@/lib/phoneMask'
import { cn } from '@/lib/utils'

export type FormType = 'help_request' | 'want_to_help' | 'feedback'

const TAB_LABELS: Record<FormType, string> = {
  help_request: 'Нужна помощь',
  want_to_help: 'Хочу помочь',
  feedback: 'Обратная связь',
}

const MESSAGE_PLACEHOLDER: Record<FormType, string> = {
  help_request: 'Опишите ситуацию и какая помощь нужна…',
  want_to_help: 'Расскажите, чем вы готовы помочь…',
  feedback: 'Ваше сообщение…',
}

const SUBJECT_PLACEHOLDER: Record<FormType, string> = {
  help_request: 'Тема обращения (необязательно)',
  want_to_help: 'Чем хотите помочь (необязательно)',
  feedback: 'Тема (необязательно)',
}

const inputClass =
  'w-full rounded-md border border-stone-300 bg-white px-3 py-2 text-sm text-stone-900 shadow-sm placeholder:text-stone-400 focus:border-stone-500 focus:outline-none focus:ring-1 focus:ring-stone-500'

export type FormTabsBlockProps = {
  title: string
  intro?: string | null
  tabs: FormType[]
  privacyHref?: string
  pageSlug?: string
}

function isFormType(v: unknown): v is FormType {
  return v === 'help_request' || v === 'want_to_help' || v === 'feedback'
}

export function FormTabsBlock({
  title,
  intro,
  tabs,
  privacyHref = '/privacy',
  pageSlug,
}: FormTabsBlockProps) {
  const availableTabs = useMemo(
    () => tabs.filter(isFormType),
    [tabs],
  )
  const [activeTab, setActiveTab] = useState<FormType>(
    () => availableTabs[0] ?? 'feedback',
  )
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [consent, setConsent] = useState(false)
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle')
  const [errorText, setErrorText] = useState<string | null>(null)

  const resetFields = () => {
    setName('')
    setPhone('')
    setEmail('')
    setSubject('')
    setMessage('')
    setConsent(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!consent) {
      setErrorText('Подтвердите согласие на обработку персональных данных')
      setStatus('error')
      return
    }

    if (phone && !isRuPhoneComplete(phone)) {
      setErrorText('Введите телефон полностью: +7 (XXX) XXX-XX-XX')
      setStatus('error')
      return
    }

    setStatus('submitting')
    setErrorText(null)

    try {
      const res = await fetch('/api/form-submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          formType: activeTab,
          name,
          phone: phone || undefined,
          email: email || undefined,
          subject: subject || undefined,
          message,
          pageSlug: pageSlug || undefined,
        }),
      })

      const data = (await res.json()) as { error?: string }

      if (!res.ok) {
        setErrorText(data.error ?? 'Не удалось отправить заявку')
        setStatus('error')
        return
      }

      resetFields()
      setStatus('success')
    } catch {
      setErrorText('Ошибка сети. Попробуйте позже.')
      setStatus('error')
    }
  }

  if (!availableTabs.length) return null

  return (
    <section className="rounded-xl border border-stone-200/90 bg-white/95 p-6 shadow-[0_2px_16px_-4px_rgba(28,25,23,0.08)] backdrop-blur-sm sm:p-8">
      <div className="mx-auto max-w-2xl space-y-6">
        <div className="space-y-2 text-center sm:text-left">
          <h2 className="text-2xl font-semibold tracking-tight text-stone-900">{title}</h2>
          {intro ? <p className="text-sm leading-relaxed text-stone-600">{intro}</p> : null}
        </div>

        {availableTabs.length > 1 ? (
          <div
            className="flex flex-wrap gap-2"
            role="tablist"
            aria-label="Тип обращения"
          >
            {availableTabs.map((tab) => (
              <button
                key={tab}
                type="button"
                role="tab"
                aria-selected={activeTab === tab}
                className={cn(
                  'rounded-md px-4 py-2 text-sm font-medium transition-colors',
                  activeTab === tab
                    ? 'bg-stone-900 text-white shadow-sm'
                    : 'border border-stone-300 bg-stone-50 text-stone-700 hover:bg-stone-100',
                )}
                onClick={() => {
                  setActiveTab(tab)
                  setStatus('idle')
                  setErrorText(null)
                }}
              >
                {TAB_LABELS[tab]}
              </button>
            ))}
          </div>
        ) : null}

        {status === 'success' ? (
          <div
            className="rounded-lg border border-teal-200 bg-teal-50 px-4 py-3 text-sm text-teal-900"
            role="status"
          >
            Спасибо! Заявка принята — мы свяжемся с вами в ближайшее время.
            <button
              type="button"
              className="mt-2 block text-sm font-medium text-teal-800 underline underline-offset-2 hover:text-teal-950"
              onClick={() => setStatus('idle')}
            >
              Отправить ещё одну заявку
            </button>
          </div>
        ) : (
          <form className="space-y-4" onSubmit={handleSubmit} noValidate>
            <input type="hidden" name="formType" value={activeTab} />

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-sm font-medium text-stone-800" htmlFor={`${activeTab}-name`}>
                  Имя <span className="text-red-600">*</span>
                </label>
                <input
                  id={`${activeTab}-name`}
                  className={inputClass}
                  name="name"
                  required
                  autoComplete="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-stone-800" htmlFor={`${activeTab}-phone`}>
                  Телефон
                </label>
                <input
                  id={`${activeTab}-phone`}
                  className={inputClass}
                  name="phone"
                  type="tel"
                  autoComplete="tel"
                  inputMode="tel"
                  placeholder={RU_PHONE_PLACEHOLDER}
                  maxLength={18}
                  value={phone}
                  onChange={(e) => {
                    setPhone(formatRuPhoneMask(e.target.value))
                    if (status === 'error') {
                      setErrorText(null)
                      setStatus('idle')
                    }
                  }}
                  onBlur={() => {
                    if (phone && !isRuPhoneComplete(phone)) {
                      setErrorText('Введите телефон полностью: +7 (XXX) XXX-XX-XX')
                      setStatus('error')
                    }
                  }}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-stone-800" htmlFor={`${activeTab}-email`}>
                  Email
                </label>
                <input
                  id={`${activeTab}-email`}
                  className={inputClass}
                  name="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-sm font-medium text-stone-800" htmlFor={`${activeTab}-subject`}>
                  Тема
                </label>
                <input
                  id={`${activeTab}-subject`}
                  className={inputClass}
                  name="subject"
                  placeholder={SUBJECT_PLACEHOLDER[activeTab]}
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                />
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-sm font-medium text-stone-800" htmlFor={`${activeTab}-message`}>
                  Сообщение <span className="text-red-600">*</span>
                </label>
                <textarea
                  id={`${activeTab}-message`}
                  className={cn(inputClass, 'min-h-[140px] resize-y')}
                  name="message"
                  required
                  rows={5}
                  placeholder={MESSAGE_PLACEHOLDER[activeTab]}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                />
              </div>
            </div>

            <label className="flex items-start gap-2 text-sm text-stone-600">
              <input
                className="mt-1 size-4 shrink-0 rounded border-stone-300"
                type="checkbox"
                checked={consent}
                onChange={(e) => setConsent(e.target.checked)}
              />
              <span>
                Я согласен(на) на обработку персональных данных в соответствии с{' '}
                <Link
                  className="font-medium text-stone-900 underline underline-offset-2 hover:text-stone-700"
                  href={privacyHref}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  политикой конфиденциальности
                </Link>
                .
              </span>
            </label>

            {status === 'error' && errorText ? (
              <p className="text-sm text-red-700" role="alert">
                {errorText}
              </p>
            ) : null}

            <button
              type="submit"
              disabled={status === 'submitting'}
              className="inline-flex h-11 w-full items-center justify-center rounded-md bg-stone-900 px-4 text-sm font-medium text-white shadow-sm transition-colors hover:bg-stone-800 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto sm:min-w-[200px]"
            >
              {status === 'submitting' ? 'Отправка…' : 'Отправить'}
            </button>
          </form>
        )}
      </div>
    </section>
  )
}
