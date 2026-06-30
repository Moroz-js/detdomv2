import type { NextConfig } from 'next'
import { withPayload } from '@payloadcms/next/withPayload'

type RemotePatterns = NonNullable<NonNullable<NextConfig['images']>['remotePatterns']>

const remotePatterns: RemotePatterns = [
  { protocol: 'http', hostname: '127.0.0.1', pathname: '/api/**' },
  { protocol: 'http', hostname: 'localhost', pathname: '/api/**' },
  { protocol: 'https', hostname: 'detskiydomuss.ru', pathname: '/wp-content/**' },
]

// Прод-домен: разрешаем отдачу медиа (/media/**) и файлов Payload (/api/**)
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL
if (siteUrl) {
  try {
    const { protocol, hostname } = new URL(siteUrl)
    const proto = protocol.replace(':', '') as 'http' | 'https'
    remotePatterns.push({ protocol: proto, hostname, pathname: '/media/**' })
    remotePatterns.push({ protocol: proto, hostname, pathname: '/api/**' })
  } catch {
    // некорректный NEXT_PUBLIC_SITE_URL — игнорируем
  }
}

const nextConfig: NextConfig = {
  reactCompiler: true,
  images: {
    dangerouslyAllowSVG: true,
    remotePatterns,
  },
}

export default withPayload(nextConfig)
