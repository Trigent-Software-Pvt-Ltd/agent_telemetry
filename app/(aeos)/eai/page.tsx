'use client'

import { useAEOSDemo } from '@/components/aeos/layout/AEOSDemoProvider'
import { computeEAI, computeEAITimeSeries } from '@/lib/aeos/data'
import { EAIHero } from '@/components/aeos/eai/EAIHero'
import { EAISubMetrics } from '@/components/aeos/eai/EAISubMetrics'
import { EAIComputation } from '@/components/aeos/eai/EAIComputation'
import { RollingTimeSeries } from '@/components/aeos/eai/RollingTimeSeries'

export default function EAIBoardPage() {
  const { tenantId } = useAEOSDemo()
  const breakdown = computeEAI(tenantId)
  const series = computeEAITimeSeries(tenantId, 30)

  return (
    <div className="space-y-6">
      <header>
        <h1
          className="font-[var(--font-sora)]"
          style={{ fontSize: 22, fontWeight: 600, color: 'var(--text-primary)' }}
        >
          EAI Board
        </h1>
        <p style={{ color: 'var(--text-secondary)', marginTop: 4, fontSize: 14 }}>
          The board-level autonomy metric. Signed by FuzeBox + rPotential, computed live over the
          last 30 days of the ledger.
        </p>
      </header>

      <EAIHero breakdown={breakdown} />
      <EAISubMetrics breakdown={breakdown} />
      <EAIComputation breakdown={breakdown} />
      <RollingTimeSeries points={series} />
    </div>
  )
}
