import type { Agent } from '@/types/telemetry'

interface AgentHeaderProps {
  agent: Agent
  consistency: number
  slaHitRate: number
  costPerOutcome: string
}

const STATUS_CONFIG = {
  green: { label: 'Active', color: 'var(--status-green)', bg: 'var(--status-green-bg)', dotClass: 'status-dot-green' },
  amber: { label: 'Degraded', color: 'var(--status-amber)', bg: 'var(--status-amber-bg)', dotClass: 'status-dot-amber' },
  red:   { label: 'Critical', color: 'var(--status-red)',   bg: 'var(--status-red-bg)',   dotClass: 'status-dot-red' },
} as const

export default function AgentHeader({ agent, consistency, slaHitRate, costPerOutcome }: AgentHeaderProps) {
  const cfg = STATUS_CONFIG[agent.status]

  const stats = [
    { label: 'Consistency', value: `${consistency}%` },
    { label: 'SLA Hit Rate', value: `${Math.round(slaHitRate * 100)}%` },
    { label: 'Cost / Outcome', value: costPerOutcome },
    { label: 'Runs Analysed', value: String(agent.totalRuns) },
  ]

  return (
    <div className="card animate-fade-up">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        {/* Status + Name */}
        <div className="flex items-center gap-3 flex-1">
          <span
            className={`inline-block w-3 h-3 rounded-full ${cfg.dotClass}`}
            style={{ backgroundColor: cfg.color }}
          />
          <div>
            <h1 className="text-xl font-bold text-text-primary">{agent.name}</h1>
            <p className="text-sm text-text-secondary">
              {agent.model} &middot; {agent.framework}
            </p>
          </div>
          <span
            className="ml-2 px-2.5 py-0.5 rounded-full text-xs font-semibold"
            style={{ backgroundColor: cfg.bg, color: cfg.color }}
          >
            {cfg.label}
          </span>
        </div>

        {/* Sigma badge */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg" style={{ backgroundColor: cfg.bg }}>
          <span className="text-lg font-bold tabular-nums" style={{ color: cfg.color }}>
            {agent.sigmaScore.toFixed(1)}&sigma;
          </span>
          <span className="text-sm" style={{ color: cfg.color }}>
            {agent.sigmaTrend === 'up' ? '↑' : agent.sigmaTrend === 'down' ? '↓' : '→'}
          </span>
        </div>
      </div>

      {/* Stat boxes */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-5 pt-5 border-t border-border">
        {stats.map((s) => (
          <div key={s.label}>
            <p className="text-xs text-text-muted uppercase tracking-wide">{s.label}</p>
            <p className="text-lg font-bold text-text-primary tabular-nums mt-0.5">{s.value}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
