import type { Metadata } from 'next'
import { AEOSDemoProvider } from '@/components/aeos/layout/AEOSDemoProvider'
import { AEOSSidebar } from '@/components/aeos/layout/AEOSSidebar'
import { AEOSTopBar } from '@/components/aeos/layout/AEOSTopBar'

export const metadata: Metadata = {
  title: {
    template: '%s — AEOS',
    default: 'AEOS · FuzeBox + rPotential',
  },
  description: 'Cross-vendor observation, predictive economic ledger, realtime injection — AEOS demo',
}

export default function AEOSLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      data-theme="aeos-dark"
      className="min-h-screen"
      style={{
        background: 'var(--aeos-bg-canvas)',
        color: 'var(--aeos-fg-primary)',
        fontFamily: 'var(--font-dm), Inter, system-ui, sans-serif',
        fontSize: 'var(--aeos-fs-body)',
      }}
    >
      <AEOSDemoProvider>
        <div className="flex min-h-screen">
          <AEOSSidebar />
          <div className="flex-1 flex flex-col" style={{ marginLeft: 260 }}>
            <AEOSTopBar />
            <main className="flex-1 px-8 py-6">{children}</main>
          </div>
        </div>
      </AEOSDemoProvider>
    </div>
  )
}
