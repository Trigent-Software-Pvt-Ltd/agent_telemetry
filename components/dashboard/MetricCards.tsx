import { PROCESSES, AGENTS, ROI_SNAPSHOTS, ORGANISATION } from '@/lib/mock-data'

function formatCurrency(value: number): string {
  return value.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 })
}

interface MetricCardProps {
  label: string
  value: string
  accent?: string
  subtitle?: string
}

function MetricCard({ label, value, accent, subtitle }: MetricCardProps) {
  return (
    <div className="card flex flex-col gap-1">
      <span
        className="text-[11px] font-semibold uppercase tracking-[0.06em]"
        style={{ color: 'var(--text-secondary)' }}
      >
        {label}
      </span>
      <span
        className="text-2xl font-bold tabular-nums"
        style={{ color: accent ?? 'var(--text-primary)', fontFamily: 'var(--font-sora)' }}
      >
        {value}
      </span>
      {subtitle && (
        <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
          {subtitle}
        </span>
      )}
    </div>
  )
}

export function MetricCards() {
  const processCount = PROCESSES.length

  // Healthy = all agents in that process have sigma >= org target
  const sigmaTarget = ORGANISATION.sigmaTarget
  const healthyCount = PROCESSES.filter((proc) => {
    const processAgents = AGENTS.filter((a) => a.processId === proc.id)
    return processAgents.length > 0 && processAgents.every((a) => a.sigmaScore >= sigmaTarget)
  }).length

  // Weekly net ROI across all processes
  const weeklyNetRoi = ROI_SNAPSHOTS.reduce((sum, s) => sum + s.netRoiWeekly, 0)

  // Agents needing attention: sigma < 3.5
  const agentsNeedingAttention = AGENTS.filter((a) => a.sigmaScore < 3.5).length

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <MetricCard
        label="Processes Monitored"
        value={String(processCount)}
        subtitle={`across ${AGENTS.length} agents`}
      />
      <MetricCard
        label="Healthy Processes"
        value={`${healthyCount} / ${processCount}`}
        accent={healthyCount === processCount ? 'var(--status-green)' : 'var(--status-amber)'}
        subtitle={`all agents above ${sigmaTarget}σ target`}
      />
      <MetricCard
        label="Weekly Net ROI"
        value={formatCurrency(weeklyNetRoi)}
        accent="var(--status-green)"
        subtitle="after oversight + inference costs"
      />
      <MetricCard
        label="Agents Needing Attention"
        value={String(agentsNeedingAttention)}
        accent={agentsNeedingAttention > 0 ? 'var(--status-red)' : 'var(--status-green)'}
        subtitle="sigma below 3.5"
      />
    </div>
  )
}
