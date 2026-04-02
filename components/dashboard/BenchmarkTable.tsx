import type { ProcessBenchmark } from '@/types/telemetry'
import { Trophy } from 'lucide-react'

interface BenchmarkTableProps {
  benchmarks: ProcessBenchmark[]
}

function RankBadge({ rank }: { rank: number }) {
  const config: Record<number, { bg: string; color: string; label: string }> = {
    1: { bg: '#FEF3C7', color: '#92400E', label: '#1' },
    2: { bg: '#E5E7EB', color: '#374151', label: '#2' },
    3: { bg: '#FDE68A', color: '#78350F', label: '#3' },
  }
  const style = config[rank] ?? { bg: 'var(--surface)', color: 'var(--text-muted)', label: `#${rank}` }

  return (
    <span
      className="inline-flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold"
      style={{ background: style.bg, color: style.color }}
    >
      {style.label}
    </span>
  )
}

export function BenchmarkTable({ benchmarks }: BenchmarkTableProps) {
  return (
    <div className="card animate-fade-up">
      <div className="flex items-center gap-2 mb-4">
        <Trophy size={18} style={{ color: 'var(--status-amber)' }} />
        <h2 className="text-base font-semibold">Process Comparison</h2>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)' }}>
              <th className="text-left py-2 pr-3 text-xs font-semibold uppercase" style={{ color: 'var(--text-muted)' }}>Rank</th>
              <th className="text-left py-2 pr-4 text-xs font-semibold uppercase" style={{ color: 'var(--text-muted)' }}>Process</th>
              <th className="text-center py-2 pr-4 text-xs font-semibold uppercase" style={{ color: 'var(--text-muted)' }}>Avg Sigma</th>
              <th className="text-center py-2 pr-4 text-xs font-semibold uppercase" style={{ color: 'var(--text-muted)' }}>OEE</th>
              <th className="text-center py-2 pr-4 text-xs font-semibold uppercase" style={{ color: 'var(--text-muted)' }}>Agent Coverage</th>
              <th className="text-right py-2 pr-4 text-xs font-semibold uppercase" style={{ color: 'var(--text-muted)' }}>Net ROI/week</th>
              <th className="text-right py-2 text-xs font-semibold uppercase" style={{ color: 'var(--text-muted)' }}>Cost/Task</th>
            </tr>
          </thead>
          <tbody>
            {benchmarks.map(b => (
              <tr key={b.processId} className="row-hover" style={{ borderBottom: '1px solid var(--border)' }}>
                <td className="py-3 pr-3">
                  <RankBadge rank={b.maturityRank} />
                </td>
                <td className="py-3 pr-4 font-medium" style={{ color: 'var(--text-primary)' }}>
                  {b.processName}
                </td>
                <td className="py-3 pr-4 text-center tabular-nums">
                  <span
                    className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium"
                    style={{
                      background: b.avgSigma >= 4 ? 'var(--status-green-bg)' : b.avgSigma >= 3 ? 'var(--status-amber-bg)' : 'var(--status-red-bg)',
                      color: b.avgSigma >= 4 ? 'var(--status-green)' : b.avgSigma >= 3 ? 'var(--status-amber)' : 'var(--status-red)',
                    }}
                  >
                    {b.avgSigma.toFixed(1)}&sigma;
                  </span>
                </td>
                <td className="py-3 pr-4 text-center tabular-nums">
                  {Math.round(b.oee * 100)}%
                </td>
                <td className="py-3 pr-4 text-center tabular-nums">
                  {Math.round(b.agentCoveragePct * 100)}%
                </td>
                <td className="py-3 pr-4 text-right tabular-nums font-medium" style={{ color: 'var(--status-green)' }}>
                  ${b.netRoiWeekly.toLocaleString()}
                </td>
                <td className="py-3 text-right tabular-nums">
                  ${b.costPerTask.toFixed(4)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
