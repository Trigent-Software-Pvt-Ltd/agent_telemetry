'use client'

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  ComposedChart,
  Bar,
} from 'recharts'
import type { OverrideTrendWeek } from '@/lib/mock-data'

interface OverrideTrendChartProps {
  trends: OverrideTrendWeek[]
}

export function OverrideTrendChart({ trends }: OverrideTrendChartProps) {
  const chartData = trends.map(w => ({
    week: w.weekLabel,
    totalDecisions: w.totalDecisions,
    overrides: w.overrides,
    overrideRate: w.overrideRate,
  }))

  // Get unique task names across all weeks
  const taskNames = Array.from(
    new Set(trends.flatMap(w => w.byTask.map(t => t.taskName)))
  )

  const taskColors: Record<string, string> = {
    'Review automated recommendations': '#378ADD',
    'Escalate unusual market movements': '#BA7517',
  }

  const taskBreakdownData = trends.map(w => {
    const row: Record<string, string | number> = { week: w.weekLabel }
    for (const t of w.byTask) {
      row[t.taskName] = t.total > 0 ? Math.round((t.overrides / t.total) * 100) : 0
    }
    return row
  })

  return (
    <div className="card">
      <div className="mb-4">
        <h2 className="text-sm font-bold font-[var(--font-sora)]" style={{ color: 'var(--text-primary)' }}>
          Override Trend Analysis
        </h2>
        <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
          Weekly override rates over the last 8 weeks
        </p>
      </div>

      {/* Main override rate chart */}
      <div className="mb-6">
        <h3 className="text-xs font-semibold mb-3 uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>
          Decisions vs Overrides
        </h3>
        <div style={{ width: '100%', height: 260 }}>
          <ResponsiveContainer>
            <ComposedChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis
                dataKey="week"
                tick={{ fontSize: 11, fill: '#6B7280' }}
                axisLine={{ stroke: 'var(--border)' }}
                tickLine={false}
              />
              <YAxis
                yAxisId="count"
                orientation="left"
                tick={{ fontSize: 11, fill: '#6B7280' }}
                axisLine={false}
                tickLine={false}
                label={{ value: 'Count', angle: -90, position: 'insideLeft', style: { fontSize: 10, fill: '#9CA3AF' } }}
              />
              <YAxis
                yAxisId="rate"
                orientation="right"
                tick={{ fontSize: 11, fill: '#6B7280' }}
                axisLine={false}
                tickLine={false}
                domain={[0, 40]}
                label={{ value: 'Rate %', angle: 90, position: 'insideRight', style: { fontSize: 10, fill: '#9CA3AF' } }}
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
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar yAxisId="count" dataKey="totalDecisions" name="Total decisions" fill="var(--accent-blue-bg)" radius={[4, 4, 0, 0]} />
              <Bar yAxisId="count" dataKey="overrides" name="Overrides" fill="var(--status-amber)" radius={[4, 4, 0, 0]} />
              <Line
                yAxisId="rate"
                type="monotone"
                dataKey="overrideRate"
                name="Override rate %"
                stroke="var(--status-red)"
                strokeWidth={2}
                dot={{ r: 4, fill: 'var(--status-red)' }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Per-task breakdown */}
      <div>
        <h3 className="text-xs font-semibold mb-3 uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>
          Override Rate by Task (%)
        </h3>
        <div style={{ width: '100%', height: 200 }}>
          <ResponsiveContainer>
            <LineChart data={taskBreakdownData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis
                dataKey="week"
                tick={{ fontSize: 11, fill: '#6B7280' }}
                axisLine={{ stroke: 'var(--border)' }}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: '#6B7280' }}
                axisLine={false}
                tickLine={false}
                domain={[0, 40]}
              />
              <Tooltip
                contentStyle={{
                  background: '#fff',
                  border: '1px solid var(--border)',
                  borderRadius: 8,
                  fontSize: 12,
                  boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                }}
                formatter={(value) => `${value}%`}
              />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              {taskNames.map(name => (
                <Line
                  key={name}
                  type="monotone"
                  dataKey={name}
                  stroke={taskColors[name] || '#6B7280'}
                  strokeWidth={2}
                  dot={{ r: 3 }}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
