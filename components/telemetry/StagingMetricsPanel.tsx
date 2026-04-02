'use client'

import clsx from 'clsx'

interface Metrics {
  sigma: number
  successRate: number
  avgCost: number
  avgLatencyMs: number
}

interface StagingMetricsPanelProps {
  title: string
  model: string
  framework: string
  metrics: Metrics
  compareMetrics?: Metrics
  accent: string
}

function MetricRow({
  label,
  value,
  compareValue,
  format,
  higherIsBetter = true,
}: {
  label: string
  value: number
  compareValue?: number
  format: (v: number) => string
  higherIsBetter?: boolean
}) {
  const isWinner =
    compareValue !== undefined &&
    (higherIsBetter ? value > compareValue : value < compareValue)

  return (
    <div className="flex items-center justify-between py-2.5 border-b" style={{ borderColor: '#E2E8F0' }}>
      <span className="text-sm" style={{ color: '#64748B' }}>{label}</span>
      <span
        className={clsx('text-sm font-semibold font-[var(--font-mono-jb)]')}
        style={{ color: isWinner ? '#059669' : '#0A1628' }}
      >
        {format(value)}
        {isWinner && <span className="ml-1 text-xs">&#9650;</span>}
      </span>
    </div>
  )
}

export function StagingMetricsPanel({
  title,
  model,
  framework,
  metrics,
  compareMetrics,
  accent,
}: StagingMetricsPanelProps) {
  return (
    <div className="card flex-1">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-3 h-3 rounded-full" style={{ background: accent }} />
        <h3 className="text-base font-semibold font-[var(--font-sora)]" style={{ color: '#0A1628' }}>
          {title}
        </h3>
      </div>

      <div className="mb-4 px-3 py-2 rounded-lg" style={{ background: '#F7F9FC' }}>
        <div className="text-xs" style={{ color: '#64748B' }}>Model</div>
        <div className="text-sm font-semibold font-[var(--font-mono-jb)]" style={{ color: '#0A1628' }}>
          {model}
        </div>
        <div className="text-xs mt-1" style={{ color: '#64748B' }}>
          Framework: {framework}
        </div>
      </div>

      <div>
        <MetricRow
          label="Sigma Score"
          value={metrics.sigma}
          compareValue={compareMetrics?.sigma}
          format={v => `${v.toFixed(1)}σ`}
          higherIsBetter
        />
        <MetricRow
          label="Success Rate"
          value={metrics.successRate}
          compareValue={compareMetrics?.successRate}
          format={v => `${Math.round(v * 100)}%`}
          higherIsBetter
        />
        <MetricRow
          label="Avg Cost"
          value={metrics.avgCost}
          compareValue={compareMetrics?.avgCost}
          format={v => `$${v.toFixed(3)}`}
          higherIsBetter={false}
        />
        <MetricRow
          label="Avg Latency"
          value={metrics.avgLatencyMs}
          compareValue={compareMetrics?.avgLatencyMs}
          format={v => `${v.toLocaleString()}ms`}
          higherIsBetter={false}
        />
      </div>
    </div>
  )
}
