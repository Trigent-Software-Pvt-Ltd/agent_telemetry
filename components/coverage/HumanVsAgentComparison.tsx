'use client'

import type { HumanBaseline } from '@/types/telemetry'
import { Bot, User, TrendingUp, TrendingDown, Minus } from 'lucide-react'

interface HumanVsAgentComparisonProps {
  baselines: HumanBaseline[]
}

function getVerdict(entry: HumanBaseline): { label: string; color: string; Icon: typeof TrendingUp } {
  const agentBetter = entry.agentErrorRate < entry.humanErrorRate && entry.agentAvgTimeMinutes < entry.humanAvgTimeMinutes
  const humanBetter = entry.humanErrorRate < entry.agentErrorRate && entry.humanAvgTimeMinutes < entry.agentAvgTimeMinutes
  if (agentBetter) return { label: 'Agent is better', color: 'var(--status-green)', Icon: TrendingUp }
  if (humanBetter) return { label: 'Human is better', color: 'var(--status-amber)', Icon: TrendingDown }
  return { label: 'Comparable', color: 'var(--text-muted)', Icon: Minus }
}

export function HumanVsAgentComparison({ baselines }: HumanVsAgentComparisonProps) {
  const agentWins = baselines.filter(b => {
    return b.agentErrorRate < b.humanErrorRate && b.agentAvgTimeMinutes < b.humanAvgTimeMinutes
  }).length
  const humanWins = baselines.filter(b => {
    return b.humanErrorRate < b.agentErrorRate && b.humanAvgTimeMinutes < b.agentAvgTimeMinutes
  }).length
  const humanBetterTasks = baselines.filter(b =>
    b.humanErrorRate < b.agentErrorRate && b.humanAvgTimeMinutes < b.agentAvgTimeMinutes
  )

  return (
    <div className="flex flex-col gap-4 animate-fade-up">
      {/* Summary */}
      <div
        className="card flex items-center gap-3"
        style={{ background: 'var(--vip-gold-subtle, #FBF5DC)', borderColor: 'var(--vip-gold)' }}
      >
        <Bot size={18} style={{ color: 'var(--vip-gold-hover, #A8891A)' }} />
        <p className="text-sm font-medium" style={{ color: 'var(--vip-navy)' }}>
          Agents outperform humans on {agentWins} of {baselines.length} tasks.
          {humanWins > 0 && (
            <> Humans are still better at &quot;{humanBetterTasks.map(t => t.task).join('", "')}&quot;</>
          )}
        </p>
      </div>

      {/* Comparison cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {baselines.map(entry => {
          const verdict = getVerdict(entry)
          const VerdictIcon = verdict.Icon
          return (
            <div key={entry.taskId} className="card">
              <p className="text-sm font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>{entry.task}</p>

              {/* Comparison grid */}
              <div className="grid grid-cols-3 gap-2 text-center mb-3">
                <div />
                <div className="flex items-center justify-center gap-1">
                  <Bot size={12} style={{ color: 'var(--status-green)' }} />
                  <span className="text-[10px] font-semibold" style={{ color: 'var(--text-muted)' }}>Agent</span>
                </div>
                <div className="flex items-center justify-center gap-1">
                  <User size={12} style={{ color: 'var(--vip-navy)' }} />
                  <span className="text-[10px] font-semibold" style={{ color: 'var(--text-muted)' }}>Human</span>
                </div>

                {/* Error rate */}
                <div className="text-xs text-left" style={{ color: 'var(--text-muted)' }}>Error rate</div>
                <div
                  className="text-sm font-bold tabular-nums"
                  style={{
                    color: entry.agentErrorRate <= entry.humanErrorRate ? 'var(--status-green)' : 'var(--status-red)',
                  }}
                >
                  {(entry.agentErrorRate * 100).toFixed(0)}%
                </div>
                <div
                  className="text-sm font-bold tabular-nums"
                  style={{
                    color: entry.humanErrorRate <= entry.agentErrorRate ? 'var(--status-green)' : 'var(--status-red)',
                  }}
                >
                  {(entry.humanErrorRate * 100).toFixed(0)}%
                </div>

                {/* Avg time */}
                <div className="text-xs text-left" style={{ color: 'var(--text-muted)' }}>Avg time</div>
                <div
                  className="text-sm font-bold tabular-nums"
                  style={{
                    color: entry.agentAvgTimeMinutes <= entry.humanAvgTimeMinutes ? 'var(--status-green)' : 'var(--status-red)',
                  }}
                >
                  {entry.agentAvgTimeMinutes}m
                </div>
                <div
                  className="text-sm font-bold tabular-nums"
                  style={{
                    color: entry.humanAvgTimeMinutes <= entry.agentAvgTimeMinutes ? 'var(--status-green)' : 'var(--status-red)',
                  }}
                >
                  {entry.humanAvgTimeMinutes}m
                </div>
              </div>

              {/* Verdict */}
              <div
                className="flex items-center justify-center gap-1.5 rounded-lg py-1.5"
                style={{ background: 'var(--surface)' }}
              >
                <VerdictIcon size={14} style={{ color: verdict.color }} />
                <span className="text-xs font-semibold" style={{ color: verdict.color }}>{verdict.label}</span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
