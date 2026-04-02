import { PROCESSES, AGENTS, ROI_SNAPSHOTS } from '@/lib/mock-data'

function formatCurrency(value: number): string {
  return value.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 })
}

interface InsightCardProps {
  accentColor: string
  accentBg: string
  title: string
  value: string
  description: string
}

function InsightCard({ accentColor, accentBg, title, value, description }: InsightCardProps) {
  return (
    <div className="card relative overflow-hidden">
      {/* Accent left border */}
      <div
        className="absolute left-0 top-0 h-full w-1 rounded-l-xl"
        style={{ backgroundColor: accentColor }}
      />
      <div className="flex flex-col gap-1.5 pl-3">
        <span
          className="text-[11px] font-semibold uppercase tracking-[0.06em]"
          style={{ color: accentColor }}
        >
          {title}
        </span>
        <span
          className="text-xl font-bold tabular-nums"
          style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-sora)' }}
        >
          {value}
        </span>
        <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
          {description}
        </span>
      </div>
    </div>
  )
}

export function InsightCards() {
  // Total weekly savings across all processes
  const totalSavings = ROI_SNAPSHOTS.reduce((sum, s) => sum + s.netRoiWeekly, 0)

  // Best performing process: highest weeklyNetRoi
  const bestProcess = [...PROCESSES].sort((a, b) => b.weeklyNetRoi - a.weeklyNetRoi)[0]

  // Agent needing attention: lowest sigma with downward trend
  const decliningAgents = AGENTS.filter((a) => a.sigmaTrend === 'down')
  const needsAttention = decliningAgents.length > 0
    ? decliningAgents.sort((a, b) => a.sigmaScore - b.sigmaScore)[0]
    : AGENTS.filter((a) => a.sigmaScore < 3.5).sort((a, b) => a.sigmaScore - b.sigmaScore)[0]

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <InsightCard
        accentColor="var(--accent-blue)"
        accentBg="var(--accent-blue-bg)"
        title="Total Weekly Savings"
        value={`${formatCurrency(totalSavings)}/week`}
        description={`Across ${PROCESSES.length} processes and ${AGENTS.length} agents, net of all oversight and inference costs.`}
      />
      <InsightCard
        accentColor="var(--status-green)"
        accentBg="var(--status-green-bg)"
        title="Best Performing Process"
        value={bestProcess.name}
        description={`${formatCurrency(bestProcess.weeklyNetRoi)}/week net ROI with ${bestProcess.agents.length} agents at ${Math.round(bestProcess.agentCoverage * 100)}% automation coverage.`}
      />
      {needsAttention && (
        <InsightCard
          accentColor="var(--status-amber)"
          accentBg="var(--status-amber-bg)"
          title="Needs Attention"
          value={needsAttention.name}
          description={`Sigma at ${needsAttention.sigmaScore}σ${needsAttention.sigmaTrend === 'down' ? `, declining from ${needsAttention.sigmaPrev}σ` : ''}. Review configuration and recent failures.`}
        />
      )}
    </div>
  )
}
