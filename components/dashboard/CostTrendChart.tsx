'use client'

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import type { MonthlyCost } from '@/types/telemetry'

interface Props {
  data: MonthlyCost[]
}

export default function CostTrendChart({ data }: Props) {
  // Aggregate costs by month across all agents
  const monthlyTotals = data.reduce<Record<string, number>>((acc, entry) => {
    acc[entry.month] = (acc[entry.month] ?? 0) + entry.inferenceCost
    return acc
  }, {})

  const chartData = Object.entries(monthlyTotals).map(([month, cost]) => ({
    month: month.replace(' 20', ' \''),
    cost: parseFloat(cost.toFixed(2)),
  }))

  return (
    <div className="card">
      <h3
        className="text-sm font-semibold mb-4"
        style={{ fontFamily: 'var(--font-sora)', color: 'var(--text-primary)' }}
      >
        Monthly Inference Spend
      </h3>
      <div style={{ width: '100%', height: 280 }}>
        <ResponsiveContainer>
          <AreaChart data={chartData} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="costGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#378ADD" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#378ADD" stopOpacity={0} />
              </linearGradient>
            </defs>
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
              formatter={(value) => [`$${Number(value).toFixed(4)}`, 'Inference Cost']}
            />
            <Area
              type="monotone"
              dataKey="cost"
              stroke="#378ADD"
              strokeWidth={2}
              fill="url(#costGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
