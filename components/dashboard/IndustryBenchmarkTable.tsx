'use client'

import type { IndustryBenchmark } from '@/types/telemetry'

function statusColor(yourValue: number, industryAvg: number, top10Pct: number, metric: string): { color: string; bg: string; label: string } {
  // For "Cost / Run", lower is better
  const lowerIsBetter = metric === 'Cost / Run'
  const beating = lowerIsBetter ? yourValue <= industryAvg : yourValue >= industryAvg
  const close = lowerIsBetter
    ? yourValue <= industryAvg * 1.15 && yourValue > industryAvg
    : yourValue >= industryAvg * 0.9 && yourValue < industryAvg

  if (beating) return { color: '#059669', bg: '#ECFDF5', label: 'Above Avg' }
  if (close) return { color: '#D97706', bg: '#FFFBEB', label: 'Near Avg' }
  return { color: '#DC2626', bg: '#FFF5F5', label: 'Below Avg' }
}

function formatValue(value: number, unit: string): string {
  if (unit === '$/wk') return `$${value}`
  if (unit === '$') return `$${value}`
  if (unit === 'σ') return `${value}σ`
  if (unit === '%') return `${value}%`
  return `${value}${unit}`
}

export function IndustryBenchmarkTable({ benchmarks }: { benchmarks: IndustryBenchmark[] }) {
  return (
    <div className="card">
      <h3 className="text-sm font-semibold font-[var(--font-sora)] mb-4" style={{ color: '#0A1628' }}>
        Benchmark Comparison
      </h3>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr style={{ borderBottom: '2px solid #E2E8F0' }}>
              <th className="text-left py-3 px-3 text-xs font-semibold uppercase" style={{ color: '#64748B', letterSpacing: '0.05em' }}>Metric</th>
              <th className="text-right py-3 px-3 text-xs font-semibold uppercase" style={{ color: '#64748B', letterSpacing: '0.05em' }}>Your Org</th>
              <th className="text-right py-3 px-3 text-xs font-semibold uppercase" style={{ color: '#64748B', letterSpacing: '0.05em' }}>Industry Avg</th>
              <th className="text-right py-3 px-3 text-xs font-semibold uppercase" style={{ color: '#64748B', letterSpacing: '0.05em' }}>Top 10%</th>
              <th className="text-center py-3 px-3 text-xs font-semibold uppercase" style={{ color: '#64748B', letterSpacing: '0.05em' }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {benchmarks.map((b) => {
              const status = statusColor(b.yourValue, b.industryAvg, b.top10Pct, b.metric)
              return (
                <tr key={b.metric} className="row-hover" style={{ borderBottom: '1px solid #E2E8F0' }}>
                  <td className="py-3 px-3 font-medium" style={{ color: '#0A1628' }}>{b.metric}</td>
                  <td className="py-3 px-3 text-right font-bold font-[var(--font-mono-jb)] tabular-nums" style={{ color: status.color }}>
                    {formatValue(b.yourValue, b.unit)}
                  </td>
                  <td className="py-3 px-3 text-right font-[var(--font-mono-jb)] tabular-nums" style={{ color: '#64748B' }}>
                    {formatValue(b.industryAvg, b.unit)}
                  </td>
                  <td className="py-3 px-3 text-right font-[var(--font-mono-jb)] tabular-nums" style={{ color: '#0A1628' }}>
                    {formatValue(b.top10Pct, b.unit)}
                  </td>
                  <td className="py-3 px-3 text-center">
                    <span
                      className="inline-block px-2 py-0.5 rounded-full text-xs font-semibold"
                      style={{ background: status.bg, color: status.color }}
                    >
                      {status.label}
                    </span>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
