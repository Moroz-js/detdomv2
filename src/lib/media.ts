export function mediaSrc(url: string | null | undefined): string {
  if (!url) return ''
  if (url.startsWith('http')) return url
  const base = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
  return `${base.replace(/\/$/, '')}${url.startsWith('/') ? url : `/${url}`}`
}
