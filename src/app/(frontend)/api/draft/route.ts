import { draftMode } from 'next/headers'
import { redirect } from 'next/navigation'

import type { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const secret = request.nextUrl.searchParams.get('secret')
  const redirectParam = request.nextUrl.searchParams.get('redirect') || '/'

  if (!process.env.PREVIEW_SECRET || secret !== process.env.PREVIEW_SECRET) {
    return new Response('Недостаточно прав для превью', { status: 403 })
  }

  if (!redirectParam.startsWith('/')) {
    return new Response('Некорректный redirect', { status: 400 })
  }

  ;(await draftMode()).enable()
  redirect(redirectParam)
}
