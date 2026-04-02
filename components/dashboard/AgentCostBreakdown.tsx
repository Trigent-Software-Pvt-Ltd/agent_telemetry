'use client'

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'
import type { MonthlyCost } from '@/types/telemetry'

const AGENT_COLORS: Record<string, string> = {
  'odds-analysis': '#378ADD',
  'line-comparison': '#D4AF37',
  'recommendation-writer': '#7C3AED',
  'customer-response': '#059669',
}

interface Props {
  data: MonthlyCost[]
}

export default function AgentCostBreakdown({ data }: Props) {
  // Get unique agents and months
  const agentIds = [...new Set(data.map(d => d.agentId))]
  const months = [...new Set(data.map(d => d.month))]

  // Build chart data: one row per month, with each agent's cost as a key
  const chartData = months.map(month => {
    const row: Record<string, string | number> = { month: month.replace(' 20', ' \'') }
    for (const agentId of agentIds) {
      const entry = data.find(d => d.month === month && d.agentId === agentId)
      row[agentId] = entry ? parseFloat(entry.inferenceCost.toFixed(4)) : 0
    }
    return row
  })

  // Build agent name map for legend
  const agentNames: Record<string, string> = {}
  for (const entry of data) {
    agentNames[entry.agentId] = entry.agentName.replace(' Agent', '')
  }

  return (
    <div className="card">
      <h3
        className="text-sm font-semibold mb-4"
        style={{ fontFamily: 'var(--font-sora)', color: 'var(--text-primary)' }}
      >
        Per-Agent Cost Breakdown
      </h3>
      <div style={{ width: '100%', height: 300 }}>
        <ResponsiveContainer>
          <BarChart data={chartData} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--vip-border)" />
            <XAxis
              dataKey="month"
              tick={{ fontSize: 11, fill: 'var(--vip-muted)' }}
              axisLine={{ stroke: 'var(--vip-border)' }}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 11, fill: 'var(--vip-muted)' }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v: number) => `$${v.toFixed(2)}`}
            />
            <Tooltip
              contentStyle={{
                background: '#FFFFFF',
                border: '1px solid var(--vip-border)',
                borderRadius: 8,
                fontSize: 12,
              }}
              formatter={(value, name) => [
                `$${Number(value).toFixed(4)}`,
                agentNames[String(name)] ?? String(name),
              ]}
            />
            <Legend
              formatter={(value: string) => (
                <span style={{ fontSize: 11, color: 'var(--vip-muted)' }}>
                  {agentNames[value] ?? value}
                </span>
              )}
            />
            {agentIds.map(agentId => (
              <Bar
                key={agentId}
                dataKey={agentId}
                stackId="cost"
                fill={AGENT_COLORS[agentId] ?? '#94A3B8'}
                radius={agentId === agentIds[agentIds.length - 1] ? [4, 4, 0, 0] : [0, 0, 0, 0]}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
