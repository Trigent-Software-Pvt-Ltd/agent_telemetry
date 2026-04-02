'use client'

import type { WorkforceProjection } from '@/types/telemetry'

interface WorkforceSummaryProps {
  projection: WorkforceProjection
  currentHeadcount: number
}

export function WorkforceSummary({ projection, currentHeadcount }: WorkforceSummaryProps) {
  const last = projection.months[projection.months.length - 1]
  const redeployable = currentHeadcount - last.headcount
  const totalSaving = projection.months.reduce((s, m) => s + m.netSaving, 0)

  const cards = [
    { label: 'Current Headcount', value: String(currentHeadcount), color: 'var(--vip-navy)' },
    { label: 'Projected (12 mo)', value: String(last.headcount), color: '#0891B2' },
    { label: 'Redeployable Staff', value: String(redeployable), color: 'var(--vip-gold)' },
    { label: 'Net Savings (12 mo)', value: `$${(totalSaving / 1000).toFixed(0)}k`, color: 'var(--v-green)' },
  ]

  return (
    <div className="grid grid-cols-4 gap-4">
      {cards.map(c => (
        <div key={c.label} className="card text-center">
          <div
            className="text-2xl font-bold tabular-nums font-[var(--font-sora)]"
            style={{ color: c.color }}
          >
            {c.value}
          </div>
          <div className="text-xs mt-1" style={{ color: 'var(--vip-muted)' }}>
            {c.label}
          </div>
        </div>
      ))}
    </div>
  )
}
