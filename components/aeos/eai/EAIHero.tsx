'use client'

import type { EAIBreakdown } from '@/types/aeos'
import { TwoPartySignaturePill } from '@/components/aeos/shared/TwoPartySignaturePill'
import { TrendingUp } from 'lucide-react'

interface Props {
  breakdown: EAIBreakdown
}

export function EAIHero({ breakdown }: Props) {
  return (
    <div className="aeos-card flex items-end justify-between" style={{ minHeight: 180 }}>
      <div>
        <div style={{ fontSize: 11, color: 'var(--aeos-fg-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          Enterprise Autonomy Index
        </div>
        <div className="flex items-baseline gap-3 mt-2">
          <span
            className="aeos-mono"
            style={{
              fontSize: 56,
              color: 'var(--aeos-accent-primary)',
              fontWeight: 500,
              letterSpacing: '-0.02em',
              lineHeight: 1,
            }}
          >
            {breakdown.eai.toFixed(3)}
          </span>
          <TrendingUp size={24} style={{ color: 'var(--aeos-accent-ok)', marginBottom: 8 }} />
        </div>
        <div style={{ fontSize: 13, color: 'var(--aeos-fg-secondary)', marginTop: 8 }}>
          across {breakdown.row_count} executions · last 30 days
        </div>
        <div className="mt-3">
          <TwoPartySignaturePill size="md" />
        </div>
      </div>
      <div className="text-right" style={{ fontSize: 11, color: 'var(--aeos-fg-muted)' }}>
        <div>Formula</div>
        <div className="aeos-mono mt-1" style={{ fontSize: 11, color: 'var(--aeos-fg-secondary)', maxWidth: 320, lineHeight: 1.5 }}>
          (ai_share × success × govern × econ)<br />
          + (hybrid × preserve)<br />
          − (control_failures + risk)
        </div>
      </div>
    </div>
  )
}
