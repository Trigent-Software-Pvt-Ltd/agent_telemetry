'use client'

import { WorkflowSummary } from '@/types/telemetry'
import { useCountUp } from '@/hooks/useCountUp'

export function StatBanner({ summary }: { summary: WorkflowSummary }) {
  const totalRuns = useCountUp(summary.total_runs, 600, 0)
  const successRate = useCountUp(summary.success_rate * 100, 600, 1)
  const avgCost = useCountUp(summary.avg_cost, 600, 6)
  const p95 = useCountUp(summary.p95_duration_ms, 600, 0)

  const cells = [
    { label: 'Total Runs', value: totalRuns, bg: '#0A1628' },
    { label: 'Success Rate', value: `${successRate}%`, bg: '#0891B2' },
    { label: 'Avg Cost', value: `$${avgCost}`, bg: '#D4AF37', textColor: '#0A1628', mono: true },
    { label: 'P95 Latency', value: `${p95}ms`, bg: '#059669' },
  ]

  return (
    <div className="grid grid-cols-4 gap-0 rounded-xl overflow-hidden animate-fade-up">
      {cells.map(cell => (
        <div
          key={cell.label}
          className="px-5 py-4 text-center"
          style={{ background: cell.bg }}
        >
          <div
            className={`text-2xl font-bold tabular-nums ${cell.mono ? 'font-[var(--font-mono-jb)]' : 'font-[var(--font-sora)]'}`}
            style={{ color: cell.textColor || '#FFFFFF' }}
          >
            {cell.value}
          </div>
          <div className="text-xs font-medium mt-1" style={{ color: cell.textColor ? 'rgba(10,22,40,0.6)' : 'rgba(255,255,255,0.7)' }}>
            {cell.label}
          </div>
        </div>
      ))}
    </div>
  )
}
