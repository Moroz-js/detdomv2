import { NextResponse } from 'next/server'
import { getPayload } from 'payload'

import configPromise from '@payload-config'

const VALID_TYPES = new Set(['help_request', 'want_to_help', 'feedback'])

type Payload = {
  formType?: unknown
  name?: unknown
  phone?: unknown
  email?: unknown
  subject?: unknown
  message?: unknown
  pageSlug?: unknown
}

function asTrimmedString(value: unknown, max = 2000): string | null {
  if (typeof value !== 'string') return null
  const trimmed = value.trim()
  if (!trimmed) return null
  return trimmed.length > max ? trimmed.slice(0, max) : trimmed
}

export async function POST(request: Request) {
  let body: Payload
  try {
    body = (await request.json()) as Payload
  } catch {
    return NextResponse.json({ error: 'Некорректный JSON' }, { status: 400 })
  }

  const formType = asTrimmedString(body.formType, 50)
  if (!formType || !VALID_TYPES.has(formType)) {
    return NextResponse.json({ error: 'Неизвестный тип формы' }, { status: 400 })
  }

  const name = asTrimmedString(body.name, 200)
  const message = asTrimmedString(body.message, 5000)
  if (!name || !message) {
    return NextResponse.json(
      { error: 'Обязательны поля «Имя» и «Сообщение»' },
      { status: 400 },
    )
  }

  const phone = asTrimmedString(body.phone, 50)
  const email = asTrimmedString(body.email, 200)
  const subject = asTrimmedString(body.subject, 300)
  const pageSlug = asTrimmedString(body.pageSlug, 200)

  try {
    const payload = await getPayload({ config: configPromise })
    const doc = await payload.create({
      collection: 'form-submissions',
      data: {
        formType: formType as 'help_request' | 'want_to_help' | 'feedback',
        name,
        message,
        phone: phone ?? undefined,
        email: email ?? undefined,
        subject: subject ?? undefined,
        pageSlug: pageSlug ?? undefined,
        status: 'new',
      },
    })
    return NextResponse.json({ ok: true, id: doc.id }, { status: 201 })
  } catch (error) {
    console.error('form-submissions create failed:', error)
    return NextResponse.json({ error: 'Не удалось сохранить заявку' }, { status: 500 })
  }
}
