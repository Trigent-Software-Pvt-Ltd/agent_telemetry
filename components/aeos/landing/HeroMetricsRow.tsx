'use client'

import type { EAIBreakdown } from '@/types/aeos'
import { TwoPartySignaturePill } from '@/components/aeos/shared/TwoPartySignaturePill'
import { ArrowUpRight } from 'lucide-react'

interface Props {
  breakdown: EAIBreakdown
}

export function HeroMetricsRow({ breakdown }: Props) {
  return (
    <div className="grid grid-cols-3 gap-4">
      <HeroTile
        label="Enterprise Autonomy Index"
        value={breakdown.eai.toFixed(3)}
        sub={`across ${breakdown.row_count} executions · last 30d`}
        showSig
        emphasis
      />
      <HeroTile
        label="Human Preservation Index"
        value={breakdown.hpi.toFixed(3)}
        sub={`${(breakdown.hybrid_execution_share * 100).toFixed(0)}% hybrid · ${(breakdown.preservation_factor * 100).toFixed(0)}% strategic preserved`}
        showSig={false}
        gauge={breakdown.hpi}
      />
      <HeroTile
        label="Hybrid Leverage Rate"
        value={breakdown.hlr.toFixed(2) + '×'}
        sub={breakdown.hlr >= 1 ? 'Above 1.0 — hybrid outperforming pure paths' : 'Below 1.0 — pure paths outperforming hybrid'}
        showSig={false}
        warn={breakdown.hlr < 1}
      />
    </div>
  )
}

function HeroTile({
  label,
  value,
  sub,
  showSig,
  gauge,
  warn,
  emphasis,
}: {
  label: string
  value: string
  sub: string
  showSig: boolean
  gauge?: number
  warn?: boolean
  emphasis?: boolean
}) {
  return (
    <div className="aeos-card flex flex-col gap-2 relative overflow-hidden">
      <div
        style={{
          fontSize: 11,
          color: 'var(--aeos-fg-muted)',
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
        }}
      >
        {label}
      </div>
      <div className="flex items-baseline gap-3">
        <span
          className="aeos-mono"
          style={{
            fontSize: emphasis ? 'var(--aeos-fs-hero)' : 28,
            color: warn ? 'var(--aeos-accent-warn)' : 'var(--aeos-accent-primary)',
            fontWeight: 500,
            letterSpacing: '-0.01em',
          }}
        >
          {value}
        </span>
        {emphasis && <ArrowUpRight size={20} style={{ color: 'var(--aeos-accent-ok)' }} />}
      </div>
      {gauge !== undefined && (
        <div
          style={{
            height: 4,
            background: 'var(--aeos-bg-nested)',
            borderRadius: 999,
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              width: `${clamp01(gauge) * 100}%`,
              height: '100%',
              background: 'var(--aeos-accent-primary)',
              transition: 'width var(--aeos-motion)',
            }}
          />
        </div>
      )}
      <div style={{ fontSize: 12, color: 'var(--aeos-fg-secondary)' }}>{sub}</div>
      {showSig && (
        <div className="mt-1">
          <TwoPartySignaturePill />
        </div>
      )}
    </div>
  )
}

function clamp01(n: number): number {
  return Math.max(0, Math.min(1, n))
}
