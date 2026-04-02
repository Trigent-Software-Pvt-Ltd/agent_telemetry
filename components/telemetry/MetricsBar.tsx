interface MetricsBarProps {
  totalRuns: number
  successRate: number
  avgCost: number
  p95Latency: number
}

export default function MetricsBar({ totalRuns, successRate, avgCost, p95Latency }: MetricsBarProps) {
  const metrics = [
    { label: 'Total Runs', value: String(totalRuns), sub: 'last 30 days' },
    { label: 'Success Rate', value: `${Math.round(successRate * 100)}%`, sub: `${Math.round(totalRuns * successRate)}/${totalRuns} passed` },
    { label: 'Avg Cost', value: `$${avgCost.toFixed(4)}`, sub: 'per run' },
    { label: 'P95 Latency', value: `${(p95Latency / 1000).toFixed(1)}s`, sub: `${p95Latency.toLocaleString()}ms` },
  ]

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 animate-fade-up">
      {metrics.map((m) => (
        <div key={m.label} className="card !p-4">
          <p className="text-xs text-text-muted uppercase tracking-wide">{m.label}</p>
          <p className="text-2xl font-bold text-text-primary tabular-nums mt-1">{m.value}</p>
          <p className="text-xs text-text-secondary mt-0.5">{m.sub}</p>
        </div>
      ))}
    </div>
  )
}
