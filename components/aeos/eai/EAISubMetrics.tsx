'use client'

import type { EAIBreakdown } from '@/types/aeos'

interface Props {
  breakdown: EAIBreakdown
}

const METRICS: Array<{
  key: keyof EAIBreakdown
  label: string
  full: string
  format: (n: number) => string
  good: (n: number) => boolean
}> = [
  { key: 'ucs', label: 'UCS', full: 'Unit Cost of Skill', format: n => `$${n.toFixed(2)}`, good: n => n < 50 },
  { key: 'sy', label: 'SY', full: 'Skill Yield (success rate)', format: n => `${(n * 100).toFixed(1)}%`, good: n => n > 0.85 },
  { key: 'ser', label: 'SER', full: 'Skill Efficiency Ratio', format: n => n.toFixed(3), good: n => n > 0.02 },
  { key: 'eroi', label: 'EROI', full: 'Execution ROI', format: n => `$${n.toFixed(2)}`, good: n => n > 50 },
  { key: 'hpi', label: 'HPI', full: 'Human Preservation Index', format: n => n.toFixed(3), good: n => n > 0.5 },
  { key: 'hlr', label: 'HLR', full: 'Hybrid Leverage Rate', format: n => `${n.toFixed(2)}×`, good: n => n > 1 },
]

export function EAISubMetrics({ breakdown }: Props) {
  return (
    <div className="grid grid-cols-3 gap-3">
      {METRICS.map(m => {
        const value = breakdown[m.key] as number
        const isGood = m.good(value)
        return (
          <div key={m.key} className="aeos-card" style={{ padding: 16 }}>
            <div className="flex items-center gap-2 mb-1">
              <span
                className="aeos-mono"
                style={{ fontSize: 11, color: 'var(--aeos-accent-primary)', textTransform: 'uppercase' }}
              >
                {m.label}
              </span>
              <span style={{ fontSize: 10, color: 'var(--aeos-fg-muted)' }}>{m.full}</span>
            </div>
            <div
              className="aeos-mono"
              style={{
                fontSize: 24,
                color: isGood ? 'var(--aeos-accent-ok)' : 'var(--aeos-fg-primary)',
                fontWeight: 500,
                marginTop: 4,
              }}
            >
              {m.format(value)}
            </div>
          </div>
        )
      })}
    </div>
  )
}
