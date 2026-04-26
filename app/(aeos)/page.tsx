'use client'

import { useAEOSDemo } from '@/components/aeos/layout/AEOSDemoProvider'
import {
  computeEAI,
  getCoverageManifest,
  listLedgerRows,
  listRecentDecisions,
} from '@/lib/aeos/data'
import { HeroMetricsRow } from '@/components/aeos/landing/HeroMetricsRow'
import { CoverageManifestCard } from '@/components/aeos/landing/CoverageManifestCard'
import { LiveDecisionFeed } from '@/components/aeos/landing/LiveDecisionFeed'
import { PathMixDonut } from '@/components/aeos/landing/PathMixDonut'
import { RecentVarianceBreaches } from '@/components/aeos/landing/RecentVarianceBreaches'

export default function AEOSLandingPage() {
  const { tenantId } = useAEOSDemo()

  const breakdown = computeEAI(tenantId)
  const manifest = getCoverageManifest(tenantId)
  const decisions = listRecentDecisions(tenantId, 12)
  const rows = listLedgerRows(tenantId)

  return (
    <div className="space-y-6">
      <header className="flex items-end justify-between">
        <div>
          <h1 style={{ fontSize: 'var(--aeos-fs-title)', fontWeight: 600, letterSpacing: '-0.01em' }}>
            Mission Control
          </h1>
          <p style={{ color: 'var(--aeos-fg-secondary)', marginTop: 4, fontSize: 14 }}>
            Cross-vendor observation · Predictive Economic Ledger · Realtime injection on dual triggers.
          </p>
        </div>
        <div style={{ fontSize: 11, color: 'var(--aeos-fg-muted)' }}>
          Tenant snapshot · live · 30-day window
        </div>
      </header>

      <HeroMetricsRow breakdown={breakdown} />

      <CoverageManifestCard manifest={manifest} />

      <div className="grid grid-cols-3 gap-4">
        <div className="col-span-2">
          <LiveDecisionFeed decisions={decisions} />
        </div>
        <div className="space-y-4">
          <PathMixDonut rows={rows} />
          <RecentVarianceBreaches rows={rows} />
        </div>
      </div>
    </div>
  )
}
