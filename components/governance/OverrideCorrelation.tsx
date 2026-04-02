'use client'

import { AlertTriangle, ArrowRight } from 'lucide-react'
import type { OverrideTrendWeek } from '@/lib/mock-data'
import { AGENTS } from '@/lib/mock-data'

interface OverrideCorrelationProps {
  trends: OverrideTrendWeek[]
}

export function OverrideCorrelation({ trends }: OverrideCorrelationProps) {
  // Calculate overall override rate
  const totalDecisions = trends.reduce((s, w) => s + w.totalDecisions, 0)
  const totalOverrides = trends.reduce((s, w) => s + w.overrides, 0)
  const overallRate = totalDecisions > 0 ? (totalOverrides / totalDecisions * 100).toFixed(1) : '0'

  // Find the task with highest override rate
  const taskAgg: Record<string, { overrides: number; total: number }> = {}
  for (const w of trends) {
    for (const t of w.byTask) {
      if (!taskAgg[t.taskName]) taskAgg[t.taskName] = { overrides: 0, total: 0 }
      taskAgg[t.taskName].overrides += t.overrides
      taskAgg[t.taskName].total += t.total
    }
  }
  const highestOverrideTask = Object.entries(taskAgg)
    .map(([name, data]) => ({ name, rate: data.total > 0 ? (data.overrides / data.total * 100) : 0 }))
    .sort((a, b) => b.rate - a.rate)[0]

  // Find the agent with lowest sigma (likely correlated)
  const lowSigmaAgent = [...AGENTS].sort((a, b) => a.sigmaScore - b.sigmaScore)[0]

  // Calculate trend direction
  const firstHalfRate = trends.slice(0, 4).reduce((s, w) => s + w.overrideRate, 0) / 4
  const secondHalfRate = trends.slice(4).reduce((s, w) => s + w.overrideRate, 0) / 4
  const isIncreasing = secondHalfRate > firstHalfRate

  return (
    <div
      className="card"
      style={{
        borderLeft: '4px solid var(--status-amber)',
        background: 'linear-gradient(135deg, var(--status-amber-bg) 0%, #FFFFFF 100%)',
      }}
    >
      <div className="flex items-start gap-3">
        <div
          className="flex-shrink-0 w-9 h-9 rounded-lg flex items-center justify-center"
          style={{ background: 'var(--status-amber)', color: '#fff' }}
        >
          <AlertTriangle size={18} />
        </div>
        <div className="flex-1">
          <h3 className="text-sm font-bold font-[var(--font-sora)]" style={{ color: 'var(--text-primary)' }}>
            Correlation Insight
          </h3>
          <p className="text-xs mt-2 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
            High override rate on <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>
              {highestOverrideTask?.name ?? 'recommendation tasks'}
            </span>{' '}
            ({highestOverrideTask?.rate.toFixed(0)}% override rate) correlates with{' '}
            <span className="font-semibold" style={{ color: 'var(--status-red)' }}>
              {lowSigmaAgent.name}&apos;s {lowSigmaAgent.sigmaScore.toFixed(1)}&sigma; score
            </span>.
          </p>

          <div className="flex flex-wrap gap-4 mt-4">
            <div className="flex items-center gap-2">
              <div className="text-xs" style={{ color: 'var(--text-muted)' }}>Overall override rate</div>
              <div className="text-sm font-bold tabular-nums" style={{ color: 'var(--status-amber)' }}>
                {overallRate}%
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="text-xs" style={{ color: 'var(--text-muted)' }}>8-week trend</div>
              <div className="text-sm font-bold" style={{ color: isIncreasing ? 'var(--status-red)' : 'var(--status-green)' }}>
                {isIncreasing ? 'Increasing' : 'Decreasing'}
              </div>
            </div>
          </div>

          <div
            className="mt-4 p-3 rounded-lg text-xs leading-relaxed"
            style={{ background: 'rgba(0,0,0,0.03)', color: 'var(--text-secondary)' }}
          >
            <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>Recommendation:</span>{' '}
            Consider moving {lowSigmaAgent.name} tasks to <span className="font-semibold">Collaborative</span> mode
            until agent quality improves above {4.0}&sigma;. Current declining trend ({lowSigmaAgent.sigmaTrend})
            suggests ongoing quality issues.
          </div>
        </div>
      </div>
    </div>
  )
}
