'use client'

import { useAEOSDemo } from '@/components/aeos/layout/AEOSDemoProvider'
import { computeEAI, computeEAITimeSeries } from '@/lib/aeos/data'
import { EAIHero } from '@/components/aeos/eai/EAIHero'
import { EAISubMetrics } from '@/components/aeos/eai/EAISubMetrics'
import { RollingTimeSeries } from '@/components/aeos/eai/RollingTimeSeries'

export default function EAIBoardPage() {
  const { tenantId } = useAEOSDemo()
  const breakdown = computeEAI(tenantId)
  const series = computeEAITimeSeries(tenantId, 30)

  return (
    <div className="space-y-6">
      <header>
        <h1 style={{ fontSize: 'var(--aeos-fs-title)', fontWeight: 600 }}>EAI Board</h1>
        <p style={{ color: 'var(--aeos-fg-secondary)', marginTop: 4, fontSize: 14 }}>
          The board-level autonomy metric. Signed by FuzeBox + rPotential.
        </p>
      </header>

      <EAIHero breakdown={breakdown} />
      <EAISubMetrics breakdown={breakdown} />
      <RollingTimeSeries points={series} />
    </div>
  )
}
