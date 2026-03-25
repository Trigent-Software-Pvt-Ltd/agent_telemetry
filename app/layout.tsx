import type { Metadata } from 'next'
import { Sora, DM_Sans, JetBrains_Mono } from 'next/font/google'
import { Toaster } from 'sonner'
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
  title: 'VIPPlay Agent Telemetry',
  description: 'Agentic AI Performance Telemetry Platform',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${sora.variable} ${dmSans.variable} ${jetbrainsMono.variable}`}>
      <body className="min-h-screen bg-[var(--vip-surface)] text-[var(--vip-text)] font-[var(--font-dm)]">
        {children}
        <Toaster position="bottom-right" richColors />
      </body>
    </html>
  )
}
