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
    <div className="min-h-screen" style={{ background: 'var(--surface)' }}>
      <AEOSDemoProvider>
        <aside data-sidebar>
          <AEOSSidebar />
        </aside>
        <div style={{ marginLeft: 260 }} data-main>
          <div data-topbar>
            <AEOSTopBar />
          </div>
          <main className="p-6">{children}</main>
        </div>
      </AEOSDemoProvider>
    </div>
  )
}
