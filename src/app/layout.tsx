import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from '@/components/providers'
import { CookieConsent } from '@/components/CookieConsent'
import Analytics from '@/components/Analytics'

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: {
    default: 'UçuşTazminat - Uçuş Gecikmesi Tazminatı',
    template: '%s | UçuşTazminat',
  },
  description:
    'Uçuş gecikmesi veya iptali mi yaşadınız? €600\'a kadar tazminat alabilirsiniz. Ücretsiz başvurun, başarısız olursak ücret yok.',
  keywords: [
    'uçuş gecikmesi',
    'uçuş tazminatı',
    'havayolu tazminatı',
    'uçuş iptali',
    'SHY-YOLCU',
    'yolcu hakları',
  ],
  authors: [{ name: 'UçuşTazminat' }],
  creator: 'UçuşTazminat',
  openGraph: {
    type: 'website',
    locale: 'tr_TR',
    url: 'https://ucustazminat.com',
    siteName: 'UçuşTazminat',
    title: 'UçuşTazminat - Uçuş Gecikmesi Tazminatı',
    description:
      'Uçuş gecikmesi veya iptali mi yaşadınız? €600\'a kadar tazminat alabilirsiniz.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'UçuşTazminat - Uçuş Gecikmesi Tazminatı',
    description:
      'Uçuş gecikmesi veya iptali mi yaşadınız? €600\'a kadar tazminat alabilirsiniz.',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="tr">
      <body className={`${inter.variable} font-sans antialiased`}>
        <Providers>{children}</Providers>
        <CookieConsent />
        <Analytics />
      </body>
    </html>
  )
}
