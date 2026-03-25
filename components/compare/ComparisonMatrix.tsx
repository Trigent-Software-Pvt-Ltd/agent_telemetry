'use client'

import { WORKFLOWS, computeSummary, generateSparkline } from '@/lib/mock-data'
import { VerdictBadge } from '@/components/shared/VerdictBadge'
import { ResponsiveContainer, LineChart, Line } from 'recharts'
import Link from 'next/link'

export function ComparisonMatrix() {
  const summaries = WORKFLOWS.map(w => ({ workflow: w, summary: computeSummary(w.id) }))

  const metrics = [
    {
      label: 'Success Rate',
      getValue: (s: ReturnType<typeof computeSummary>) => `${Math.round(s.success_rate * 100)}%`,
      getRaw: (s: ReturnType<typeof computeSummary>) => s.success_rate,
      best: 'max' as const,
    },
    {
      label: 'Avg Latency',
      getValue: (s: ReturnType<typeof computeSummary>) => `${s.avg_duration_ms.toLocaleString()}ms`,
      getRaw: (s: ReturnType<typeof computeSummary>) => s.avg_duration_ms,
      best: 'min' as const,
    },
    {
      label: 'Cost/Outcome',
      getValue: (s: ReturnType<typeof computeSummary>) => `$${s.cost_per_success.toFixed(4)}`,
      getRaw: (s: ReturnType<typeof computeSummary>) => s.cost_per_success,
      best: 'min' as const,
    },
    {
      label: 'SLA Hit Rate',
      getValue: (s: ReturnType<typeof computeSummary>) => `${Math.round(s.sla_hit_rate * 100)}%`,
      getRaw: (s: ReturnType<typeof computeSummary>) => s.sla_hit_rate,
      best: 'max' as const,
    },
    {
      label: 'Consistency',
      getValue: (s: ReturnType<typeof computeSummary>) => `${s.consistency_score}/100`,
      getRaw: (s: ReturnType<typeof computeSummary>) => s.consistency_score,
      best: 'max' as const,
    },
  ]

  return (
    <div className="card overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr style={{ borderBottom: '2px solid #E2E8F0' }}>
            <th className="text-left py-3 px-4 text-[10px] uppercase font-semibold" style={{ color: '#64748B', letterSpacing: '0.05em', width: 140 }}>
              Metric
            </th>
            {summaries.map(({ workflow }) => (
              <th key={workflow.id} className="text-center py-3 px-4">
                <Link href={`/workflows/${workflow.id}`} className="text-sm font-semibold font-[var(--font-sora)] hover:underline" style={{ color: '#0A1628' }}>
                  {workflow.name.replace(' Agent', '')}
                </Link>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {metrics.map(metric => {
            const rawValues = summaries.map(({ summary }) => metric.getRaw(summary))
            const bestIdx = metric.best === 'max'
              ? rawValues.indexOf(Math.max(...rawValues))
              : rawValues.indexOf(Math.min(...rawValues))

            return (
              <tr key={metric.label} style={{ borderBottom: '1px solid #E2E8F0' }}>
                <td className="py-3 px-4 text-xs font-semibold" style={{ color: '#64748B' }}>
                  {metric.label}
                </td>
                {summaries.map(({ workflow, summary }, idx) => {
                  const sparkline = generateSparkline(workflow.id, 10)
                  const isBest = idx === bestIdx
                  return (
                    <td
                      key={workflow.id}
                      className="py-3 px-4 text-center"
                      style={{ background: isBest ? 'rgba(212,175,55,0.06)' : 'transparent' }}
                    >
                      <div className={`text-sm tabular-nums font-[var(--font-mono-jb)] ${isBest ? 'font-bold' : ''}`} style={{ color: '#0A1628' }}>
                        {metric.getValue(summary)}
                      </div>
                      <div style={{ width: '100%', height: 20 }} className="mt-1">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={sparkline}>
                            <Line type="monotone" dataKey="value" stroke={workflow.color} strokeWidth={1} dot={false} />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </td>
                  )
                })}
              </tr>
            )
          })}
          {/* Verdict row */}
          <tr style={{ borderBottom: '1px solid #E2E8F0', background: '#F7F9FC' }}>
            <td className="py-3 px-4 text-xs font-bold" style={{ color: '#0A1628' }}>Verdict</td>
            {summaries.map(({ workflow, summary }) => (
              <td key={workflow.id} className="py-3 px-4 text-center">
                <VerdictBadge verdict={summary.verdict} size="sm" />
              </td>
            ))}
          </tr>
        </tbody>
      </table>
    </div>
  )
}
