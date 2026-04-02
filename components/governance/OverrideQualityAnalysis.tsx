'use client'

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import type { OverrideQualityData } from '@/lib/mock-data'
import { AlertTriangle } from 'lucide-react'

interface OverrideQualityAnalysisProps {
  data: OverrideQualityData
}

export function OverrideQualityAnalysis({ data }: OverrideQualityAnalysisProps) {
  const hourlyData = data.hourlyDistribution.map((d) => ({
    hour: `${d.hour}:00`,
    overrides: d.overrides,
  }))

  // Find the top overrider for the insight callout
  const topReviewer = data.reviewers.reduce((top, r) =>
    r.overrides > top.overrides ? r : top
  , data.reviewers[0])

  return (
    <div className="card">
      <div className="mb-4">
        <h2
          className="text-sm font-bold"
          style={{ fontFamily: 'var(--font-sora)', color: 'var(--text-primary)' }}
        >
          Override Quality
        </h2>
        <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
          How effective are human overrides? Not all corrections improve outcomes.
        </p>
      </div>

      {/* Insight callout */}
      <div
        className="rounded-lg px-4 py-3 mb-5 text-sm flex items-start gap-2"
        style={{
          background: 'var(--status-amber-bg)',
          border: '1px solid var(--status-amber)',
          color: 'var(--text-primary)',
        }}
      >
        <AlertTriangle size={16} style={{ color: 'var(--status-amber)', flexShrink: 0, marginTop: 2 }} />
        <span>{data.insight}</span>
      </div>

      {/* Per-reviewer table */}
      <div className="mb-6">
        <h3
          className="text-xs font-semibold mb-3 uppercase tracking-wider"
          style={{ color: 'var(--text-secondary)' }}
        >
          Per-Reviewer Breakdown
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: '2px solid var(--border)' }}>
                <th className="text-left py-2 px-3 text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>
                  Reviewer
                </th>
                <th className="text-right py-2 px-3 text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>
                  Overrides
                </th>
                <th className="text-right py-2 px-3 text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>
                  Helpful %
                </th>
                <th className="text-right py-2 px-3 text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>
                  Avg Review Time
                </th>
              </tr>
            </thead>
            <tbody>
              {data.reviewers.map((r) => {
                const helpfulColor =
                  r.helpfulPct >= 75
                    ? 'var(--status-green)'
                    : r.helpfulPct >= 60
                      ? 'var(--status-amber)'
                      : 'var(--status-red)'

                return (
                  <tr
                    key={r.reviewer}
                    className="row-hover"
                    style={{ borderBottom: '1px solid var(--border)' }}
                  >
                    <td className="py-2.5 px-3">
                      <span className="font-medium" style={{ color: 'var(--text-primary)' }}>
                        {r.reviewer}
                      </span>
                      {r.reviewer === topReviewer.reviewer && (
                        <span
                          className="ml-2 text-[10px] font-bold uppercase px-1.5 py-0.5 rounded"
                          style={{ background: 'var(--status-amber-bg)', color: 'var(--status-amber)' }}
                        >
                          Most active
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-right tabular-nums font-semibold" style={{ color: 'var(--text-primary)' }}>
                      {r.overrides}
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <span className="tabular-nums font-semibold" style={{ color: helpfulColor }}>
                        {r.helpfulPct}%
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right tabular-nums" style={{ color: 'var(--text-secondary)' }}>
                      {r.avgReviewTimeMin.toFixed(1)} min
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Hourly distribution chart */}
      <div>
        <h3
          className="text-xs font-semibold mb-3 uppercase tracking-wider"
          style={{ color: 'var(--text-secondary)' }}
        >
          Overrides by Hour of Day
        </h3>
        <div style={{ width: '100%', height: 200 }}>
          <ResponsiveContainer>
            <BarChart data={hourlyData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis
                dataKey="hour"
                tick={{ fontSize: 11, fill: '#6B7280' }}
                axisLine={{ stroke: 'var(--border)' }}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: '#6B7280' }}
                axisLine={false}
                tickLine={false}
                allowDecimals={false}
              />
              <Tooltip
                contentStyle={{
                  background: '#fff',
                  border: '1px solid var(--border)',
                  borderRadius: 8,
                  fontSize: 12,
                  boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                }}
              />
              <Bar
                dataKey="overrides"
                name="Overrides"
                fill="var(--status-amber)"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
