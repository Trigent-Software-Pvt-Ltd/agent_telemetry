'use client'

import { WorkflowSummary, Workflow } from '@/types/telemetry'
import { VerdictBadge } from '@/components/shared/VerdictBadge'
import { StatusDot } from '@/components/shared/StatusDot'
import { useCountUp } from '@/hooks/useCountUp'

const VERDICT_STYLES = {
  GREEN: { bg: '#ECFDF5', border: '#059669' },
  AMBER: { bg: '#FFFBEB', border: '#D97706' },
  RED:   { bg: '#FFF5F5', border: '#DC2626' },
}

interface VerdictCardProps {
  summary: WorkflowSummary
  workflow: Workflow
}

export function VerdictCard({ summary, workflow }: VerdictCardProps) {
  const style = VERDICT_STYLES[summary.verdict]
  const consistencyDisplay = useCountUp(summary.consistency_score, 600, 0)
  const slaDisplay = useCountUp(summary.sla_hit_rate * 100, 600, 0)
  const costDisplay = useCountUp(summary.cost_per_success, 600, 4)
  const runsDisplay = useCountUp(summary.total_runs, 600, 0)
  const verdictDot = summary.verdict === 'GREEN' ? 'green' : summary.verdict === 'AMBER' ? 'amber' : 'red'

  return (
    <div
      className="animate-fade-up rounded-xl p-6 flex flex-col lg:flex-row gap-6"
      style={{
        background: style.bg,
        borderLeft: `4px solid ${style.border}`,
      }}
    >
      {/* Zone 1: Status */}
      <div className="flex flex-col gap-3 lg:w-[240px] shrink-0">
        <VerdictBadge verdict={summary.verdict} size="lg" />
        <h2 className="text-lg font-bold font-[var(--font-sora)]" style={{ color: '#0A1628' }}>
          {workflow.name}
        </h2>
        <div className="flex items-center gap-2 flex-wrap">
          <span className="px-2 py-0.5 rounded text-xs font-semibold" style={{ background: '#FBF5DC', color: '#A8891A' }}>
            {workflow.framework}
          </span>
          <span className="px-2 py-0.5 rounded text-xs font-semibold" style={{ background: '#E8EEF5', color: '#1E3A5F' }}>
            {workflow.model}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <StatusDot status={verdictDot} />
          <span className="text-xs font-medium" style={{ color: '#64748B' }}>Active</span>
        </div>
        <div className="text-xs font-semibold" style={{ color: summary.hypothesis_proven ? '#059669' : '#D97706' }}>
          {summary.hypothesis_proven ? '✓ Hypothesis proven' : '◌ Not yet proven'}
        </div>
        <div className="text-xs font-semibold" style={{ color: summary.roi_positive ? '#059669' : '#DC2626' }}>
          {summary.roi_positive ? '↑ ROI positive' : '↓ ROI negative'}
        </div>
      </div>

      {/* Zone 2: Verdict text */}
      <div className="flex-1 flex items-center">
        <div className="bg-white rounded-lg p-5 w-full" style={{ border: '1px solid rgba(0,0,0,0.06)' }}>
          <p className="text-base leading-relaxed" style={{ color: '#0A1628' }}>
            {summary.verdict_text}
          </p>
        </div>
      </div>

      {/* Zone 3: Mini metrics */}
      <div className="grid grid-cols-2 gap-3 lg:w-[240px] shrink-0">
        <div className="bg-white rounded-lg p-3 text-center" style={{ border: '1px solid rgba(0,0,0,0.06)' }}>
          <div className="text-[10px] uppercase font-semibold" style={{ color: '#64748B', letterSpacing: '0.05em' }}>Consistency</div>
          <div className="text-xl font-bold tabular-nums font-[var(--font-sora)]" style={{ color: '#0A1628' }}>{consistencyDisplay}<span className="text-sm text-[#64748B]">/100</span></div>
        </div>
        <div className="bg-white rounded-lg p-3 text-center" style={{ border: '1px solid rgba(0,0,0,0.06)' }}>
          <div className="text-[10px] uppercase font-semibold" style={{ color: '#64748B', letterSpacing: '0.05em' }}>SLA Hit Rate</div>
          <div className="text-xl font-bold tabular-nums font-[var(--font-sora)]" style={{ color: '#0A1628' }}>{slaDisplay}%</div>
        </div>
        <div className="bg-white rounded-lg p-3 text-center" style={{ border: '1px solid rgba(0,0,0,0.06)' }}>
          <div className="text-[10px] uppercase font-semibold" style={{ color: '#64748B', letterSpacing: '0.05em' }}>Cost/Outcome</div>
          <div className="text-lg font-bold tabular-nums font-[var(--font-mono-jb)]" style={{ color: '#0A1628' }}>${costDisplay}</div>
        </div>
        <div className="bg-white rounded-lg p-3 text-center" style={{ border: '1px solid rgba(0,0,0,0.06)' }}>
          <div className="text-[10px] uppercase font-semibold" style={{ color: '#64748B', letterSpacing: '0.05em' }}>Runs Analysed</div>
          <div className="text-xl font-bold tabular-nums font-[var(--font-sora)]" style={{ color: '#0A1628' }}>{runsDisplay}</div>
        </div>
      </div>
    </div>
  )
}
