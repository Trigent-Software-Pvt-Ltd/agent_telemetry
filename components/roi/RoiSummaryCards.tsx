'use client'

import { useCountUp } from '@/hooks/useCountUp'
import type { RoiSnapshot } from '@/types/telemetry'

interface Props {
  snapshots: RoiSnapshot[]
  manualCost: number
}

export function RoiSummaryCards({ snapshots, manualCost }: Props) {
  // Compute totals across all processes, scaling gross saving by manual cost ratio
  const totals = snapshots.reduce(
    (acc, s) => {
      const ratio = manualCost / s.manualCostPerTask
      const gross = s.grossSavingWeekly * ratio
      const agentCost = s.inferenceCostWeekly + s.oversightCostWeekly + s.governanceOverheadWeekly
      const net = gross - agentCost
      acc.agentCost += agentCost
      acc.manualEquiv += gross
      acc.grossSaving += gross
      acc.netRoi += net
      return acc
    },
    { agentCost: 0, manualEquiv: 0, grossSaving: 0, netRoi: 0 },
  )

  const cards = [
    { label: 'Agent total cost', value: totals.agentCost, prefix: '$' },
    { label: 'Manual equivalent', value: totals.manualEquiv, prefix: '$' },
    { label: 'Gross savings', value: totals.grossSaving, prefix: '$' },
    { label: 'Net ROI', value: totals.netRoi, prefix: '$' },
  ]

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
      {cards.map((c) => (
        <RoiCard key={c.label} label={c.label} value={c.value} prefix={c.prefix} />
      ))}
    </div>
  )
}

function RoiCard({ label, value, prefix }: { label: string; value: number; prefix: string }) {
  const animated = useCountUp(Math.round(value), 600, 0)
  const isNegative = value < 0

  return (
    <div className="card flex flex-col gap-1">
      <span
        className="text-[10px] font-semibold uppercase tracking-[0.08em]"
        style={{ color: '#64748B' }}
      >
        {label}
      </span>
      <span
        className="text-2xl font-bold tabular-nums font-[var(--font-sora)]"
        style={{ color: isNegative ? 'var(--status-red)' : '#0A1628' }}
      >
        {prefix}{animated}/wk
      </span>
    </div>
  )
}
