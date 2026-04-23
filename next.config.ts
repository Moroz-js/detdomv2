import type { NextConfig } from 'next'
import { withPayload } from '@payloadcms/next/withPayload'

const nextConfig: NextConfig = {
  reactCompiler: true,
  images: {
    dangerouslyAllowSVG: true,
    remotePatterns: [
      { protocol: 'http', hostname: '127.0.0.1', pathname: '/api/**' },
      { protocol: 'http', hostname: 'localhost', pathname: '/api/**' },
      {
        protocol: 'https',
        hostname: 'detskiydomuss.ru',
        pathname: '/wp-content/**',
      },
    ],
  },
}

export default withPayload(nextConfig)
