import type { CoverageMapEntry, Agent } from '@/types/telemetry'

interface TaskDetailPanelProps {
  entry: CoverageMapEntry
  agent: Agent | null
  onClose: () => void
}

const confidenceConfig: Record<string, { color: string; bg: string; label: string }> = {
  high: { color: 'var(--status-green)', bg: 'var(--status-green-bg)', label: 'High Confidence' },
  medium: { color: 'var(--status-amber)', bg: 'var(--status-amber-bg)', label: 'Medium Confidence' },
  low: { color: 'var(--status-red)', bg: 'var(--status-red-bg)', label: 'Low Confidence' },
}

export function TaskDetailPanel({ entry, agent, onClose }: TaskDetailPanelProps) {
  const conf = confidenceConfig[entry.confidence]

  return (
    <div className="card animate-fade-up" style={{ borderColor: 'var(--accent-blue)', borderWidth: 2 }}>
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>
            {entry.task}
          </h3>
          <div className="flex items-center gap-3 mt-1">
            <span
              className="text-[11px] font-semibold px-2 py-0.5 rounded-full capitalize"
              style={{
                backgroundColor:
                  entry.ownership === 'agent'
                    ? 'var(--status-green)'
                    : entry.ownership === 'collaborative'
                      ? 'var(--status-amber)'
                      : 'var(--text-muted)',
                color: '#FFFFFF',
              }}
            >
              {entry.ownership}
            </span>
            <span
              className="text-[11px] font-semibold px-2 py-0.5 rounded"
              style={{ color: conf.color, backgroundColor: conf.bg }}
            >
              {conf.label}
            </span>
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="text-text-muted hover:text-text-primary text-lg leading-none px-2 py-1 rounded hover:bg-surface transition-colors"
          aria-label="Close detail panel"
        >
          &times;
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left: Task info */}
        <div className="space-y-4">
          <div>
            <p className="text-[11px] uppercase tracking-wide font-semibold text-text-secondary mb-1">
              Ownership Notes
            </p>
            <p className="text-sm" style={{ color: 'var(--text-primary)' }}>
              {entry.notes}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-[11px] uppercase tracking-wide font-semibold text-text-secondary mb-1">
                Automation Score
              </p>
              <div className="flex items-center gap-2">
                <div className="flex-1 h-2 rounded-full" style={{ backgroundColor: 'var(--surface)' }}>
                  <div
                    className="h-2 rounded-full transition-all"
                    style={{
                      width: `${Math.round(entry.automationScore * 100)}%`,
                      backgroundColor: entry.automationScore >= 0.7
                        ? 'var(--status-green)'
                        : entry.automationScore >= 0.4
                          ? 'var(--status-amber)'
                          : 'var(--text-muted)',
                    }}
                  />
                </div>
                <span className="text-sm font-bold tabular-nums" style={{ color: 'var(--text-primary)' }}>
                  {Math.round(entry.automationScore * 100)}%
                </span>
              </div>
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-wide font-semibold text-text-secondary mb-1">
                Time Weight
              </p>
              <p className="text-sm font-bold tabular-nums" style={{ color: 'var(--text-primary)' }}>
                {Math.round(entry.timeWeight * 100)}%
              </p>
            </div>
          </div>
        </div>

        {/* Right: Agent metrics (if agent-owned) or context */}
        <div className="space-y-4">
          {entry.ownership === 'agent' && agent && (
            <>
              <div>
                <p className="text-[11px] uppercase tracking-wide font-semibold text-text-secondary mb-1">
                  Agent Performance
                </p>
                <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                  {agent.name}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <MetricCell
                  label="Sigma Score"
                  value={`${agent.sigmaScore.toFixed(1)}\u03C3`}
                  color={
                    agent.sigmaScore >= 4.0
                      ? 'var(--status-green)'
                      : agent.sigmaScore >= 3.0
                        ? 'var(--status-amber)'
                        : 'var(--status-red)'
                  }
                />
                <MetricCell
                  label="DPMO"
                  value={agent.dpmo.toLocaleString()}
                  color="var(--text-primary)"
                />
                <MetricCell
                  label="OEE"
                  value={`${Math.round(agent.oee * 100)}%`}
                  color="var(--text-primary)"
                />
                <MetricCell
                  label="Success Rate"
                  value={`${Math.round(agent.successRate * 100)}%`}
                  color={
                    agent.successRate >= 0.85
                      ? 'var(--status-green)'
                      : agent.successRate >= 0.70
                        ? 'var(--status-amber)'
                        : 'var(--status-red)'
                  }
                />
              </div>
            </>
          )}

          {entry.ownership === 'collaborative' && (
            <div>
              <p className="text-[11px] uppercase tracking-wide font-semibold text-text-secondary mb-1">
                Collaboration Context
              </p>
              <p className="text-sm" style={{ color: 'var(--text-primary)' }}>
                {entry.notes.includes('override')
                  ? `Override rate noted in this task. ${entry.notes}`
                  : entry.notes}
              </p>
              {agent && (
                <div className="mt-3 p-3 rounded-lg" style={{ backgroundColor: 'var(--status-amber-bg)' }}>
                  <p className="text-xs font-semibold" style={{ color: 'var(--status-amber)' }}>
                    Assisting Agent: {agent.name} ({agent.sigmaScore.toFixed(1)}&sigma;)
                  </p>
                </div>
              )}
            </div>
          )}

          {entry.ownership === 'human' && (
            <div>
              <p className="text-[11px] uppercase tracking-wide font-semibold text-text-secondary mb-1">
                Human Retention Rationale
              </p>
              <p className="text-sm" style={{ color: 'var(--text-primary)' }}>
                {entry.notes}
              </p>
              <div className="mt-3 p-3 rounded-lg" style={{ backgroundColor: 'var(--surface)' }}>
                <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                  This task requires human judgment and is not a candidate for automation at current maturity levels.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function MetricCell({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="p-2 rounded-lg" style={{ backgroundColor: 'var(--surface)' }}>
      <p className="text-[10px] uppercase tracking-wide text-text-secondary mb-0.5">{label}</p>
      <p className="text-sm font-bold tabular-nums" style={{ color }}>{value}</p>
    </div>
  )
}
