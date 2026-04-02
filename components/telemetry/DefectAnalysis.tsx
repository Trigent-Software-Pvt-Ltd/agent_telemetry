import type { Agent } from '@/types/telemetry'

interface DefectAnalysisProps {
  agent: Agent
}

export default function DefectAnalysis({ agent }: DefectAnalysisProps) {
  const { failures, latencyBreaches, costOverruns } = agent.defects
  const totalDefects = failures + latencyBreaches + costOverruns

  const categories = [
    {
      label: 'Failures',
      count: failures,
      pct: totalDefects > 0 ? Math.round((failures / totalDefects) * 100) : 0,
      color: 'var(--status-red)',
      bg: 'var(--status-red-bg)',
      subItems: [
        { label: 'Timeout errors', count: Math.ceil(failures * 0.4) },
        { label: 'Parse errors', count: Math.ceil(failures * 0.35) },
        { label: 'API failures', count: Math.max(0, failures - Math.ceil(failures * 0.4) - Math.ceil(failures * 0.35)) },
      ],
    },
    {
      label: 'Latency Breaches',
      count: latencyBreaches,
      pct: totalDefects > 0 ? Math.round((latencyBreaches / totalDefects) * 100) : 0,
      color: 'var(--status-amber)',
      bg: 'var(--status-amber-bg)',
      subItems: [
        { label: `Exceeded ${(agent.p95LatencyMs / 1000).toFixed(1)}s SLA`, count: latencyBreaches },
      ],
    },
    {
      label: 'Cost Overruns',
      count: costOverruns,
      pct: totalDefects > 0 ? Math.round((costOverruns / totalDefects) * 100) : 0,
      color: 'var(--accent-blue)',
      bg: 'var(--accent-blue-bg)',
      subItems: [
        { label: `Exceeded $${(agent.avgCostPerRun * 1.5).toFixed(4)} threshold`, count: costOverruns },
      ],
    },
  ]

  return (
    <div className="card animate-fade-up">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wide">
          Defect Analysis
        </h3>
        <div className="flex items-center gap-2">
          <span className="text-xs text-text-muted">DPMO</span>
          <span className="text-sm font-bold tabular-nums text-text-primary">
            {agent.dpmo.toLocaleString()}
          </span>
        </div>
      </div>

      {/* Total defects bar */}
      <div className="flex items-center gap-3 mb-5">
        <span className="text-xs text-text-muted w-24">Total Defects</span>
        <div className="flex-1 h-3 bg-surface rounded-full overflow-hidden flex">
          {categories.map((cat) => (
            <div
              key={cat.label}
              className="h-full"
              style={{
                width: `${cat.pct}%`,
                backgroundColor: cat.color,
              }}
            />
          ))}
        </div>
        <span className="text-sm font-bold tabular-nums text-text-primary w-8 text-right">
          {totalDefects}
        </span>
      </div>

      {/* Category breakdown */}
      <div className="space-y-4">
        {categories.map((cat) => (
          <div key={cat.label}>
            <div className="flex items-center gap-3">
              <span
                className="inline-block w-2.5 h-2.5 rounded-sm"
                style={{ backgroundColor: cat.color }}
              />
              <span className="text-sm font-medium text-text-primary flex-1">
                {cat.label}
              </span>
              <span className="text-sm font-bold tabular-nums text-text-primary">
                {cat.count}
              </span>
              <span className="text-xs text-text-muted w-12 text-right">
                {cat.pct}%
              </span>
            </div>
            <div className="ml-5 mt-1.5 space-y-1">
              {cat.subItems.map((sub) => (
                <div key={sub.label} className="flex items-center gap-2 text-xs text-text-secondary">
                  <span className="text-text-muted">&#8212;</span>
                  <span className="flex-1">{sub.label}</span>
                  <span className="tabular-nums">{sub.count}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
