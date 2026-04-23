'use client'

import { RefreshRouteOnSave } from '@payloadcms/live-preview-react'
import { useRouter } from 'next/navigation'

export function PreviewProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const serverURL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

  return (
    <>
      <RefreshRouteOnSave refresh={() => router.refresh()} serverURL={serverURL} />
      {children}
    </>
  )
}
