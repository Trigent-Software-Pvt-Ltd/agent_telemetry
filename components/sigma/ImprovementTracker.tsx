'use client'

import { TrendingUp, TrendingDown, Minus, Calendar } from 'lucide-react'
import type { SigmaHistoryEntry } from '@/lib/mock-data'

interface ImprovementTrackerProps {
  history: SigmaHistoryEntry[]
  sigmaTarget: number
}

const trendConfig = {
  improving: {
    label: 'Improving',
    color: 'var(--status-green)',
    bg: 'var(--status-green-bg)',
    Icon: TrendingUp,
  },
  flat: {
    label: 'Flat',
    color: 'var(--status-amber)',
    bg: 'var(--status-amber-bg)',
    Icon: Minus,
  },
  declining: {
    label: 'Declining',
    color: 'var(--status-red)',
    bg: 'var(--status-red-bg)',
    Icon: TrendingDown,
  },
}

export function ImprovementTracker({ history, sigmaTarget }: ImprovementTrackerProps) {
  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-sm font-bold font-[var(--font-sora)]" style={{ color: 'var(--text-primary)' }}>
            Improvement Tracker
          </h2>
          <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
            30-day sigma progression per agent &middot; Target: {sigmaTarget.toFixed(1)}&sigma;
          </p>
        </div>
        <Calendar size={16} style={{ color: 'var(--text-muted)' }} />
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm" style={{ borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--surface)' }}>
              {['Agent', '30 days ago', '14 days ago', 'Today', 'Trend', 'Weekly rate', 'Target projection'].map(h => (
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
            {history.map(entry => {
              const config = trendConfig[entry.trend]
              const Icon = config.Icon
              return (
                <tr
                  key={entry.agentId}
                  className="row-hover"
                  style={{ borderBottom: '1px solid var(--border)' }}
                >
                  <td className="px-4 py-3 font-medium whitespace-nowrap">
                    {entry.agentName}
                  </td>
                  <td className="px-4 py-3 tabular-nums" style={{ color: 'var(--text-secondary)' }}>
                    {entry.sigma30d.toFixed(1)}&sigma;
                  </td>
                  <td className="px-4 py-3 tabular-nums" style={{ color: 'var(--text-secondary)' }}>
                    {entry.sigma14d.toFixed(1)}&sigma;
                  </td>
                  <td className="px-4 py-3 tabular-nums font-semibold">
                    {entry.sigmaToday.toFixed(1)}&sigma;
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span
                      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-bold"
                      style={{ background: config.bg, color: config.color }}
                    >
                      <Icon size={12} />
                      {config.label}
                    </span>
                  </td>
                  <td className="px-4 py-3 tabular-nums whitespace-nowrap" style={{ color: config.color }}>
                    {entry.weeklyRate > 0 ? '+' : ''}{entry.weeklyRate.toFixed(2)}&sigma;/week
                  </td>
                  <td className="px-4 py-3 text-xs whitespace-nowrap">
                    {entry.targetDate === 'Achieved' ? (
                      <span style={{ color: 'var(--status-green)' }} className="font-semibold">
                        Achieved
                      </span>
                    ) : entry.targetDate ? (
                      <span style={{ color: 'var(--text-secondary)' }}>
                        Reaches {sigmaTarget.toFixed(1)}&sigma; by{' '}
                        <span className="font-medium" style={{ color: 'var(--text-primary)' }}>
                          {entry.targetDate}
                        </span>
                      </span>
                    ) : (
                      <span style={{ color: 'var(--status-red)' }} className="font-semibold">
                        Never (declining)
                      </span>
                    )}
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
