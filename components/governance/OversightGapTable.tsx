'use client'

import { ShieldPlus } from 'lucide-react'
import { toast } from 'sonner'
import { SigmaTooltip } from '@/components/shared/SigmaTooltip'
import type { OversightGap } from '@/lib/mock-data'

interface OversightGapTableProps {
  gaps: OversightGap[]
}

const riskStyles: Record<string, { bg: string; color: string }> = {
  High:   { bg: 'var(--status-red-bg)',   color: 'var(--status-red)' },
  Medium: { bg: 'var(--status-amber-bg)', color: 'var(--status-amber)' },
  Low:    { bg: 'var(--status-green-bg)', color: 'var(--status-green)' },
}

export function OversightGapTable({ gaps }: OversightGapTableProps) {
  function handleAddReviewGate(gap: OversightGap) {
    toast.success(
      `Review gate added for "${gap.task}"`,
      {
        description: `${gap.agentName} will now require human approval before execution.`,
      }
    )
  }

  return (
    <div className="card overflow-hidden" style={{ padding: 0 }}>
      <div className="overflow-x-auto">
        <table className="w-full text-sm" style={{ borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--surface)' }}>
              {['Task', 'Agent', 'Process', 'Automation', 'Sigma', 'Risk Level', 'Recommendation', ''].map(h => (
                <th
                  key={h}
                  className="text-left px-4 py-3 text-[10px] font-semibold uppercase tracking-[0.08em]"
                  style={{ color: '#64748B' }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {gaps.map(gap => {
              const risk = riskStyles[gap.riskLevel]
              return (
                <tr
                  key={gap.id}
                  className="row-hover"
                  style={{ borderBottom: '1px solid var(--border)' }}
                >
                  <td className="px-4 py-3 font-medium max-w-[200px]">
                    {gap.task}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap" style={{ color: 'var(--text-secondary)' }}>
                    {gap.agentName}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap" style={{ color: 'var(--text-secondary)' }}>
                    {gap.processName}
                  </td>
                  <td className="px-4 py-3 tabular-nums whitespace-nowrap">
                    {Math.round(gap.automationScore * 100)}%
                  </td>
                  <td className="px-4 py-3 tabular-nums whitespace-nowrap font-semibold">
                    <SigmaTooltip value={gap.sigmaScore}>
                      <span>{gap.sigmaScore.toFixed(1)}&sigma;</span>
                    </SigmaTooltip>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span
                      className="inline-block rounded-full px-2.5 py-0.5 text-[11px] font-bold"
                      style={{ background: risk.bg, color: risk.color }}
                    >
                      {gap.riskLevel}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs max-w-[260px]" style={{ color: 'var(--text-secondary)' }}>
                    {gap.recommendation}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <button
                      onClick={() => handleAddReviewGate(gap)}
                      className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer"
                      style={{
                        background: 'var(--accent-blue)',
                        color: '#fff',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.opacity = '0.85'
                        e.currentTarget.style.transform = 'translateY(-1px)'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.opacity = '1'
                        e.currentTarget.style.transform = 'translateY(0)'
                      }}
                    >
                      <ShieldPlus size={13} />
                      Add review gate
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
