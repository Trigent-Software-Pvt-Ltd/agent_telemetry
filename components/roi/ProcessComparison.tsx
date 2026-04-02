'use client'

import type { RoiSnapshot } from '@/types/telemetry'
import { PROCESSES } from '@/lib/mock-data'

interface Props {
  snapshots: RoiSnapshot[]
  manualCost: number
}

export function ProcessComparison({ snapshots, manualCost }: Props) {
  return (
    <div className="card overflow-hidden" style={{ padding: 0 }}>
      <table className="w-full text-sm" style={{ borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--surface)' }}>
            {['Process', 'Agent cost', 'Gross saving', 'Net ROI', 'Multiple'].map((h) => (
              <th
                key={h}
                className="text-left px-5 py-3 text-[10px] font-semibold uppercase tracking-[0.08em]"
                style={{ color: '#64748B' }}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {snapshots.map((s) => {
            const process = PROCESSES.find((p) => p.id === s.processId)
            const ratio = manualCost / s.manualCostPerTask
            const gross = Math.round(s.grossSavingWeekly * ratio)
            const agentCost = s.inferenceCostWeekly + s.oversightCostWeekly + s.governanceOverheadWeekly
            const net = gross - agentCost
            const multiple = agentCost > 0 ? (net / agentCost).toFixed(1) : '---'

            return (
              <tr
                key={s.processId}
                className="row-hover"
                style={{ borderBottom: '1px solid var(--border)' }}
              >
                <td className="px-5 py-3 font-medium">{process?.name ?? s.processId}</td>
                <td className="px-5 py-3 tabular-nums">${agentCost}/wk</td>
                <td className="px-5 py-3 tabular-nums" style={{ color: 'var(--status-green)' }}>
                  ${gross.toLocaleString()}/wk
                </td>
                <td
                  className="px-5 py-3 tabular-nums font-semibold"
                  style={{ color: net >= 0 ? 'var(--accent-blue)' : 'var(--status-red)' }}
                >
                  ${net.toLocaleString()}/wk
                </td>
                <td className="px-5 py-3 tabular-nums font-bold">{multiple}x</td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
