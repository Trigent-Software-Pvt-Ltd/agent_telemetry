import type { Metadata } from 'next'
import { Sora, DM_Sans, JetBrains_Mono } from 'next/font/google'
import { Toaster } from 'sonner'
import { LanguageModeProvider } from '@/hooks/useLanguageModeProvider'
import { OrganisationProvider } from '@/hooks/useOrganisationProvider'
import './globals.css'

const sora = Sora({
  variable: '--font-sora',
  subsets: ['latin'],
  display: 'swap',
})

const dmSans = DM_Sans({
  variable: '--font-dm',
  subsets: ['latin'],
  display: 'swap',
})

const jetbrainsMono = JetBrains_Mono({
  variable: '--font-mono-jb',
  subsets: ['latin'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    template: '%s — r-Potential',
    default: 'r-Potential | Agent Quality Platform',
  },
  description: 'Agent Quality & Process ROI Platform powered by FuzeBox',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${sora.variable} ${dmSans.variable} ${jetbrainsMono.variable}`}>
      <body className="min-h-screen bg-[var(--surface)] text-[var(--text-primary)] font-[var(--font-dm)]">
        <OrganisationProvider>
          <LanguageModeProvider>
            {children}
          </LanguageModeProvider>
        </OrganisationProvider>
        <Toaster position="bottom-right" richColors />
      </body>
    </html>
  )
}
