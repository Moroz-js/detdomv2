import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'

import { PreviewProvider } from '@/components/PreviewProvider'
import { Container } from '@/components/Container'
import { SiteFooter } from '@/components/SiteFooter'
import { SiteHeader } from '@/components/SiteHeader'
import { fetchFooterContent, fetchFooterNav, fetchHeaderNav } from '@/lib/fetchGlobals'

import '../globals.css'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'Детский дом',
  description: 'Официальный сайт',
}

export default async function FrontendLayout({ children }: { children: React.ReactNode }) {
  const [header, footer, footerContent] = await Promise.all([
    fetchHeaderNav(),
    fetchFooterNav(),
    fetchFooterContent(),
  ])

  return (
    <html
      lang="ru"
      className={`${geistSans.variable} ${geistMono.variable} h-full text-stone-900 antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col text-stone-900">
        <PreviewProvider>
          <SiteHeader items={header.items} />
          <Container className="flex-1 py-10">{children}</Container>
          <SiteFooter items={footer.items} footer={footerContent} />
        </PreviewProvider>
      </body>
    </html>
  )
}
