import type { CoverageMapEntry } from '@/types/telemetry'

interface CoverageSummaryBarProps {
  entries: CoverageMapEntry[]
}

export function CoverageSummaryBar({ entries }: CoverageSummaryBarProps) {
  const agentTasks = entries.filter((e) => e.ownership === 'agent')
  const collabTasks = entries.filter((e) => e.ownership === 'collaborative')
  const humanTasks = entries.filter((e) => e.ownership === 'human')

  const agentPct = agentTasks.reduce((s, e) => s + e.timeWeight, 0)
  const collabPct = collabTasks.reduce((s, e) => s + e.timeWeight, 0)
  const humanPct = humanTasks.reduce((s, e) => s + e.timeWeight, 0)

  const weightedAutomation =
    entries.reduce((s, e) => s + e.automationScore * e.timeWeight, 0) /
    entries.reduce((s, e) => s + e.timeWeight, 0)

  const sections = [
    { label: 'Agent', count: agentTasks.length, pct: agentPct, color: 'var(--status-green)' },
    { label: 'Collaborative', count: collabTasks.length, pct: collabPct, color: 'var(--status-amber)' },
    { label: 'Human', count: humanTasks.length, pct: humanPct, color: 'var(--text-muted)' },
  ]

  return (
    <div className="card animate-fade-up">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wide">
          Coverage Distribution
        </h3>
        <div className="flex items-center gap-1.5 text-sm">
          <span className="text-text-secondary">Weighted Automation Score:</span>
          <span className="font-bold tabular-nums" style={{ color: 'var(--accent-blue)' }}>
            {Math.round(weightedAutomation * 100)}%
          </span>
        </div>
      </div>

      {/* Coverage bar */}
      <div className="flex w-full h-12 rounded-lg overflow-hidden">
        {sections.map((s) => (
          <div
            key={s.label}
            className="flex items-center justify-center gap-1.5 text-sm font-semibold transition-all"
            style={{
              width: `${Math.round(s.pct * 100)}%`,
              backgroundColor: s.color,
              color: '#FFFFFF',
            }}
          >
            <span>{Math.round(s.pct * 100)}%</span>
            <span className="hidden sm:inline font-normal">{s.label}</span>
          </div>
        ))}
      </div>

      {/* Legend with counts */}
      <div className="flex gap-8 mt-4">
        {sections.map((s) => (
          <div key={s.label} className="flex items-center gap-2">
            <span
              className="inline-block w-3 h-3 rounded-sm"
              style={{ backgroundColor: s.color }}
            />
            <span className="text-xs text-text-secondary">
              {s.label}
            </span>
            <span className="text-xs font-bold tabular-nums" style={{ color: 'var(--text-primary)' }}>
              {s.count} task{s.count !== 1 ? 's' : ''}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
